"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, $insertNodes } from "lexical"
import { $patchStyleText } from "@lexical/selection"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Highlighter,
    Type,
    Palette,
    Plus as PlusIcon,
    Table as TableIcon,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    MoreHorizontal,
    Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { useCallback, useEffect, useState } from "react"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"
import { $createPageBreakNode } from "@/components/editor/nodes/PageBreakNode"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { INSERT_TABLE_COMMAND } from "@lexical/table"
import { $createBannerNode, BannerType } from "@/components/editor/nodes/BannerNode"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { $createSimpleImageNode } from "@/components/editor/nodes/SimpleImageNode"

const TEXT_COLORS = [
    { name: "Noir", value: "#000000" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Vert", value: "#22c55e" },
    { name: "Bleu", value: "#3b82f6" },
    { name: "Violet", value: "#a855f7" },
    { name: "Orange", value: "#f97316" },
    { name: "Jaune", value: "#eab308" },
    { name: "Rose", value: "#ec4899" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Gris foncé", value: "#475569" },
]

const HIGHLIGHT_COLORS = [
    { name: "Jaune", value: "#fef08a" },
    { name: "Vert clair", value: "#dcfce7" },
    { name: "Bleu clair", value: "#dbeafe" },
    { name: "Rose clair", value: "#fce7f3" },
    { name: "Orange clair", value: "#fed7aa" },
    { name: "Violet clair", value: "#e9d5ff" },
    { name: "Cyan clair", value: "#cffafe" },
]

const FONT_SIZES = [
    { label: "Très petit", value: "10px" },
    { label: "Petit", value: "12px" },
    { label: "Normal", value: "14px" },
    { label: "Moyen", value: "16px" },
    { label: "Grand", value: "18px" },
    { label: "Très grand", value: "20px" },
    { label: "Énorme", value: "24px" },
]

export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [isCode, setIsCode] = useState(false)
    const [currentColor, setCurrentColor] = useState<string | null>(null)
    const [currentHighlight, setCurrentHighlight] = useState<string | null>(null)
    const [currentFontSize, setCurrentFontSize] = useState<string | null>(null)

    const updateToolbar = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"))
            setIsItalic(selection.hasFormat("italic"))
            setIsUnderline(selection.hasFormat("underline"))
            setIsStrikethrough(selection.hasFormat("strikethrough"))
            setIsCode(selection.hasFormat("code"))

            // Use generic style access if possible, or manual parsing
            // Note: Lexical types might need adjustment depending on version
            // Doing safe check mainly
            // @ts-ignore
            const style = selection.style || ""

            const colorMatch = style.match(/color:\s*([^;]+)/)
            const bgMatch = style.match(/background-color:\s*([^;]+)/)
            const fontSizeMatch = style.match(/font-size:\s*([^;]+)/)

            setCurrentColor(colorMatch ? colorMatch[1].trim() : null)
            setCurrentHighlight(bgMatch ? bgMatch[1].trim() : null)
            setCurrentFontSize(fontSizeMatch ? fontSizeMatch[1].trim() : null)
        }
    }, [])

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar()
            })
        })
    }, [editor, updateToolbar])

    const insertBanner = (type: BannerType) => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createBannerNode(type))
            }
        })
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-muted/20 rounded-t-lg sticky top-0 z-10 backdrop-blur">
            {/* History Controls */}
            <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Annuler">
                    <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Rétablir">
                    <Redo className="h-3.5 w-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
                <Toggle size="sm" pressed={isBold} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} className="h-7 w-7 p-0" aria-label="Gras">
                    <Bold className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle size="sm" pressed={isItalic} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} className="h-7 w-7 p-0" aria-label="Italique">
                    <Italic className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle size="sm" pressed={isUnderline} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} className="h-7 w-7 p-0" aria-label="Souligné">
                    <Underline className="h-3.5 w-3.5" />
                </Toggle>

                {/* Advanced Formatting Group (Hidden on tiny screens) */}
                <div className="hidden sm:flex items-center gap-0.5">
                    <Toggle size="sm" pressed={isStrikethrough} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className="h-7 w-7 p-0" aria-label="Barré">
                        <Strikethrough className="h-3.5 w-3.5" />
                    </Toggle>
                    <Toggle size="sm" pressed={isCode} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")} className="h-7 w-7 p-0" aria-label="Code">
                        <Code className="h-3.5 w-3.5" />
                    </Toggle>
                </div>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Headings & Lists */}
            <div className="flex items-center gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" title="Titres">
                            <Type className="h-3.5 w-3.5" />
                            <span className="text-xs hidden sm:inline">Normal</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editor.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h1'))
                        })}>
                            <Heading1 className="mr-2 h-4 w-4" /> Titre 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h2'))
                        })}>
                            <Heading2 className="mr-2 h-4 w-4" /> Titre 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h3'))
                        })}>
                            <Heading3 className="mr-2 h-4 w-4" /> Titre 3
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => editor.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createQuoteNode())
                        })}>
                            <Type className="mr-2 h-4 w-4" /> Citation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden sm:flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
                        <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
                        <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Insert Elements Group */}
            <div className="flex items-center gap-0.5">
                {/* Banners */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Insérer une bannière">
                            <AlertCircle className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Bannières</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => insertBanner('info')} className="text-blue-600">
                            <Info className="mr-2 h-4 w-4" /> Info
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBanner('success')} className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" /> Succès
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBanner('warning')} className="text-yellow-600">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Avertissement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBanner('error')} className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" /> Erreur
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Table with Grid Selection */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Insérer un tableau">
                            <TableIcon className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm leading-none">Dimensions du tableau</h4>
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="grid gap-1">
                                        <label htmlFor="rows" className="text-xs font-medium">Lignes</label>
                                        <input
                                            id="rows"
                                            type="number"
                                            className="h-8 w-16 border rounded px-2 text-sm"
                                            min="1"
                                            max="20"
                                            defaultValue="3"
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <label htmlFor="cols" className="text-xs font-medium">Colonnes</label>
                                        <input
                                            id="cols"
                                            type="number"
                                            className="h-8 w-16 border rounded px-2 text-sm"
                                            min="1"
                                            max="20"
                                            defaultValue="3"
                                        />
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        const rows = (document.getElementById('rows') as HTMLInputElement).value;
                                        const cols = (document.getElementById('cols') as HTMLInputElement).value;
                                        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                                            rows: rows || "3",
                                            columns: cols || "3"
                                        });
                                    }}
                                >
                                    Insérer
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Image Upload */}
                <Button // Image Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Insérer une image"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const src = event.target?.result as string;
                                    editor.update(() => {
                                        const node = $createSimpleImageNode({
                                            altText: "Image téléchargée",
                                            src,
                                            maxWidth: 500
                                        });
                                        const selection = $getSelection();
                                        if ($isRangeSelection(selection)) {
                                            $insertNodes([node]);
                                        }
                                    });
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        input.click();
                    }}
                >
                    <ImageIcon className="h-3.5 w-3.5" />
                </Button>

                {/* Page Break */}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $insertNodes([$createPageBreakNode()]);
                    }
                })} title="Saut de page">
                    <PlusIcon className="h-3.5 w-3.5" />
                </Button>

                {/* Page Break */}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $insertNodes([$createPageBreakNode()]);
                    }
                })} title="Saut de page">
                    <PlusIcon className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="flex-1" />

            {/* Formatting (Colors, Align) - Collapsed for small screens */}
            <div className="flex items-center gap-0.5">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground">
                            Format <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[200px] p-2">
                        <div className="space-y-4">
                            {/* Alignment */}
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Alignement</h5>
                                <div className="flex gap-1 justify-between">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}><AlignLeft className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}><AlignCenter className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}><AlignRight className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}><AlignJustify className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Couleurs</h5>
                                <div className="flex gap-2">
                                    {/* Simple color pickers re-implementation here or just simple buttons for common colors to save space if complex picker logic is heavy to duplicate inside popover */}
                                    {/* Current Implementation kept simpler: */}
                                    <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => {
                                        // Trigger the other popovers if possible? 
                                        // Or just duplicate the grid here. Let's duplicate a mini-grid.
                                    }}>
                                        Voir palette complète...
                                    </Button>
                                    <div className="flex gap-1">
                                        {TEXT_COLORS.slice(0, 3).map(c => (
                                            <div key={c.value} className="w-4 h-4 rounded-full border border-border cursor-pointer" style={{ background: c.value }}
                                                onClick={() => editor.update(() => {
                                                    const s = $getSelection();
                                                    if ($isRangeSelection(s)) $patchStyleText(s, { color: c.value });
                                                })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

