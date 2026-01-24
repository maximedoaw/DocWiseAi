"use client"

import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Palette, Highlighter, Type,
    ChevronDown, Undo, Redo, RemoveFormatting,
    Sparkles, Table as TableIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect, useCallback } from "react"
import { AIGeneratorDialog } from "./AIGeneratorDialog"

// Expanded Color Palette (10 hues x 8 shades)
const COLOR_PALETTE = [
    { name: "Gris", shades: ["#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#111827"] },
    { name: "Rouge", shades: ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#b91c1c", "#7f1d1d"] },
    { name: "Orange", shades: ["#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#c2410c", "#7c2d12"] },
    { name: "Ambre", shades: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#b45309", "#78350f"] },
    { name: "Jaune", shades: ["#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15", "#eab308", "#854d0e", "#713f12"] },
    { name: "Vert", shades: ["#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#15803d", "#14532d"] },
    { name: "Emeraude", shades: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#047857", "#064e3b"] },
    { name: "Bleu", shades: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8", "#1e3a8a"] },
    { name: "Indigo", shades: ["#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4338ca", "#312e81"] },
    { name: "Violet", shades: ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#6d28d9", "#4c1d95"] },
]

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title?: string
    className?: string
}

const ToolbarButton = ({ onClick, isActive, children, title, className }: ToolbarButtonProps) => (
    <button
        type="button"
        onMouseDown={(e) => {
            e.preventDefault()
            onClick()
        }}
        title={title}
        className={cn(
            "p-1.5 sm:p-2 rounded-md transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
            className
        )}
    >
        {children}
    </button>
)

export function FixedToolbar({ className, onToggleSidebar, isSidebarOpen, activePageContent, onInsertHTML }: {
    className?: string
    onToggleSidebar?: () => void
    isSidebarOpen?: boolean
    activePageContent?: string
    onInsertHTML?: (html: string) => void
}) {
    const [currentColor, setCurrentColor] = useState("#000000")
    const [currentHighlight, setCurrentHighlight] = useState("transparent")
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)

    // New States
    const [fontSize, setFontSize] = useState("16")
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)

    // Helper to execute commands safely
    const exec = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value)
    }, [])

    const formatBlock = useCallback((tag: string) => {
        // Enforce <TAG> syntax for Chrome/Webkit
        document.execCommand('formatBlock', false, `<${tag}>`)
    }, [])

    // Update toolbar state based on selection
    const updateToolbarState = useCallback(() => {
        setIsBold(document.queryCommandState('bold'))
        setIsItalic(document.queryCommandState('italic'))
        setIsUnderline(document.queryCommandState('underline'))
        setIsStrikethrough(document.queryCommandState('strikeThrough'))

        // Try to get font size - browsers return inconsistent values (1-7 or px)
        // Usually queryCommandValue('fontSize') returns 1-7 string
        // But for our custom px implementation, we might not get it easily via standard API.
        // We'll trust the user input mainly.
    }, [])

    useEffect(() => {
        document.addEventListener('selectionchange', updateToolbarState)
        return () => document.removeEventListener('selectionchange', updateToolbarState)
    }, [updateToolbarState])

    const applyColor = (color: string) => {
        exec('foreColor', color)
        setCurrentColor(color)
    }

    const applyHighlight = (color: string) => {
        if (color === 'transparent') {
            document.execCommand('removeFormat', false, 'backColor')
        } else {
            exec('hiliteColor', color)
        }
        setCurrentHighlight(color)
    }

    const clearFormatting = () => {
        exec('removeFormat')
    }

    // --- New Features ---

    const applyCustomFontSize = (sizePx: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        // Validate number
        const size = parseInt(sizePx)
        if (isNaN(size) || size < 1 || size > 100) return

        const range = selection.getRangeAt(0)

        // Method 1: Create a span with style
        // This is robust for inserting new style
        const span = document.createElement("span")
        span.style.fontSize = `${size}px`

        try {
            // If selection is collapsed (cursor only), we can't easily style "future" text without quirk.
            // But usually browsers handle 'insertHTML' well.
            if (selection.isCollapsed) {
                // Insert a zero-width space with style? Or just standard font size command?
                // Standard command works best for collapsed. But standard command only does 1-7.
                // Let's use insertHTML with a placeholder or just wrap?
                // Actually, for collapsed, specific px size is hard. 
                // Let's just create a span with a zero-width space '&#8203;' inside?
                document.execCommand('insertHTML', false, `<span style="font-size: ${size}px">&#8203;</span>`)
            } else {
                // If text selected, extract and wrap
                const contents = range.extractContents()
                span.appendChild(contents)
                range.insertNode(span)

                // Reset selection to span
                selection.removeAllRanges()
                const newRange = document.createRange()
                newRange.selectNodeContents(span)
                selection.addRange(newRange)
            }
        } catch (e) {
            console.error("Font size apply error", e)
        }

        setFontSize(sizePx)
    }

    const insertTable = () => {
        const rows = parseInt(prompt("Nombre de lignes :", "3") || "0")
        const cols = parseInt(prompt("Nombre de colonnes :", "3") || "0")

        if (rows > 0 && cols > 0) {
            let html = '<table style="width:100%; border-collapse: collapse; margin: 1em 0;"><tbody>'
            for (let i = 0; i < rows; i++) {
                html += '<tr>'
                for (let j = 0; j < cols; j++) {
                    html += `<td style="border: 1px solid #d1d5db; padding: 8px; min-width: 50px;">Case ${i + 1}-${j + 1}</td>`
                }
                html += '</tr>'
            }
            html += '</tbody></table><p><br></p>' // Add break after table
            document.execCommand('insertHTML', false, html)
        }
    }

    const handleAIInsert = (html: string) => {
        if (onInsertHTML) {
            onInsertHTML(html)
        } else {
            document.execCommand('insertHTML', false, html)
        }
    }

    return (
        <div className={cn(
            "flex items-center gap-1 p-1.5 sm:p-2 bg-background border-b border-border/50 overflow-x-auto scrollbar-hide no-scrollbar w-full",
            className
        )}>
            <div className="flex items-center gap-1 min-w-max">

                {/* AI Button */}
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-8 px-3 mr-2 shadow-sm animate-in zoom-in duration-300"
                    size="sm"
                    onClick={() => setIsAIDialogOpen(true)}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">IA Magic</span>
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton onClick={() => exec('undo')} title="Annuler">
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('redo')} title="Rétablir">
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Basic Formatting */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton onClick={() => exec('bold')} isActive={isBold} title="Gras (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('italic')} isActive={isItalic} title="Italique (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('underline')} isActive={isUnderline} title="Souligné (Ctrl+U)">
                        <Underline className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('strikeThrough')} isActive={isStrikethrough} title="Barré">
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Headings */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground shrink-0"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <Type className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs">Style</span>
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => formatBlock('P')}><span className="text-sm">Normal</span></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => formatBlock('H1')}><Heading1 className="w-4 h-4 mr-2" /><span className="text-xl font-bold">Titre 1</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => formatBlock('H2')}><Heading2 className="w-4 h-4 mr-2" /><span className="text-lg font-bold">Titre 2</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => formatBlock('H3')}><Heading3 className="w-4 h-4 mr-2" /><span className="text-base font-bold">Titre 3</span></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Custom Font Size Input */}
                <div className="flex items-center gap-1 mx-1 border border-border/50 rounded-md bg-muted/20 px-1 relative group">
                    <span className="text-[10px] text-muted-foreground absolute -top-2 left-1 bg-background px-0.5 hidden group-hover:block">px</span>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                applyCustomFontSize(fontSize)
                                e.preventDefault() // prevent newline
                            }
                        }}
                        onBlur={() => applyCustomFontSize(fontSize)}
                        className="w-10 h-7 bg-transparent text-sm text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Taille de police (1-100px). Appuyez sur Entrée."
                    />
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Alignment */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton onClick={() => exec('justifyLeft')} title="Gauche"><AlignLeft className="w-4 h-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => exec('justifyCenter')} title="Centrer"><AlignCenter className="w-4 h-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => exec('justifyRight')} title="Droite"><AlignRight className="w-4 h-4" /></ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Lists & Table */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Puces"><List className="w-4 h-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numérotée"><ListOrdered className="w-4 h-4" /></ToolbarButton>

                    <ToolbarButton onClick={insertTable} title="Insérer un tableau">
                        <TableIcon className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Colors */}
                <div className="flex items-center gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative shrink-0" title="Couleur" onMouseDown={(e) => e.preventDefault()}>
                                <Palette className="w-4 h-4" />
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ backgroundColor: currentColor }} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                            <div className="grid grid-cols-10 gap-1">
                                {COLOR_PALETTE.map((hue) => hue.shades.map((shade, i) => (
                                    <button
                                        key={`${hue.name}-${i}`}
                                        className="w-5 h-5 rounded-sm hover:scale-125 transition-transform"
                                        style={{ backgroundColor: shade }}
                                        onClick={() => applyColor(shade)}
                                        onMouseDown={(e) => e.preventDefault()}
                                    />
                                )))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative shrink-0" title="Surlignage" onMouseDown={(e) => e.preventDefault()}>
                                <Highlighter className="w-4 h-4" />
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full border" style={{ backgroundColor: currentHighlight === 'transparent' ? '#ddd' : currentHighlight }} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                            <div className="flex flex-col gap-2">
                                <button className="text-xs underline mb-1 text-left" onClick={() => applyHighlight('transparent')}>Aucun</button>
                                <div className="grid grid-cols-10 gap-1">
                                    {COLOR_PALETTE.map((hue) => hue.shades.map((shade, i) => (
                                        <button
                                            key={`hl-${hue.name}-${i}`}
                                            className="w-5 h-5 rounded-sm hover:scale-125 transition-transform"
                                            style={{ backgroundColor: shade }}
                                            onClick={() => applyHighlight(shade)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        />
                                    )))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <AIGeneratorDialog
                open={isAIDialogOpen}
                onOpenChange={setIsAIDialogOpen}
                onInsert={handleAIInsert}
                currentContent={activePageContent || ""}
            />
        </div>
    )
}
// AI Generator UI refined for elegance and speed.
