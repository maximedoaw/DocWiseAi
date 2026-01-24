"use client"

import { useEffect, useState, useRef } from "react"
import {
    Bold, Italic, Underline,
    Heading1, Heading2, Heading3,
    List, ListOrdered,
    Copy, Clipboard, FileText, Type,
    X, Check, Unlink, Link, Code,
    AlignLeft, AlignCenter, AlignRight,
    Undo, Redo, Highlighter,
    PaintBucket, Palette,
    TextSelect, Grid
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ContextMenu() {
    const [visible, setVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [selectedText, setSelectedText] = useState("")
    const [selection, setSelection] = useState<Range | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const editor = target.closest('[contenteditable="true"]')

            if (editor) {
                e.preventDefault()
                e.stopPropagation()

                // Get current selection
                const sel = window.getSelection()
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0)
                    setSelection(range.cloneRange())
                    setSelectedText(sel.toString())
                } else {
                    setSelection(null)
                    setSelectedText("")
                }

                setVisible(true)

                // Adjust position to stay in viewport
                let x = e.clientX
                let y = e.clientY

                // Get menu dimensions
                const menuWidth = 220
                const menuHeight = 400

                if (x + menuWidth > window.innerWidth) x -= menuWidth
                if (y + menuHeight > window.innerHeight) y -= Math.min(menuHeight, window.innerHeight - 100)

                setPosition({ x, y })
            } else {
                setVisible(false)
            }
        }

        const closeMenu = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setVisible(false)
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setVisible(false)
        }

        document.addEventListener("contextmenu", handleContextMenu)
        document.addEventListener("click", closeMenu)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
            document.removeEventListener("click", closeMenu)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [])

    const exec = (command: string, value?: string) => {
        // Restore selection if needed
        if (selection) {
            const sel = window.getSelection()
            if (sel) {
                sel.removeAllRanges()
                sel.addRange(selection)
            }
        }

        document.execCommand(command, false, value)
        setVisible(false)
    }

    const pasteAsPlainText = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (selection) {
                // Delete selected text first
                const sel = window.getSelection()
                if (sel) {
                    sel.removeAllRanges()
                    sel.addRange(selection)
                    document.execCommand('insertText', false, text)
                }
            } else {
                document.execCommand('insertText', false, text)
            }
        } catch (e) {
            // Fallback for browsers that don't support clipboard API
            alert("Impossible d'accéder au presse-papier. Utilisez Ctrl+Shift+V.")
        }
        setVisible(false)
    }

    const pasteAsHTML = async () => {
        try {
            const items = await navigator.clipboard.read()
            for (const item of items) {
                if (item.types.includes('text/html')) {
                    const html = await (await item.getType('text/html')).text()
                    document.execCommand('insertHTML', false, html)
                    break
                }
            }
        } catch (e) {
            alert("Coller HTML non supporté.")
        }
        setVisible(false)
    }

    const removeFormatting = () => {
        exec('removeFormat')
        exec('unlink') // Also remove links
    }

    const createLink = () => {
        const url = prompt("Entrez l'URL du lien:")
        if (url) exec('createLink', url)
    }

    const changeTextColor = () => {
        const color = prompt("Entrez une couleur (ex: #3490dc ou red):", "#3490dc")
        if (color) exec('foreColor', color)
    }

    const changeBackgroundColor = () => {
        const color = prompt("Entrez une couleur de fond (ex: #fef3c7):", "#fef3c7")
        if (color) exec('backColor', color)
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
            html += '</tbody></table><p><br></p>'

            // If we have a stored selection (from right click), restore it first
            if (selection) {
                const sel = window.getSelection()
                if (sel) {
                    sel.removeAllRanges()
                    sel.addRange(selection)
                }
            }
            document.execCommand('insertHTML', false, html)
            setVisible(false)
        }
    }

    const applyCustomFontSize = (sizePx: string) => {
        const size = parseInt(sizePx)
        if (isNaN(size) || size < 1 || size > 100) return

        // Restore selection if exists
        let range: Range | null = null
        if (selection) {
            range = selection
            const sel = window.getSelection()
            if (sel) {
                sel.removeAllRanges()
                sel.addRange(selection)
            }
        } else {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) range = sel.getRangeAt(0)
        }

        if (!range) return

        const span = document.createElement("span")
        span.style.fontSize = `${size}px`

        try {
            if (range.collapsed) {
                document.execCommand('insertHTML', false, `<span style="font-size: ${size}px">&#8203;</span>`)
            } else {
                const contents = range.extractContents()
                span.appendChild(contents)
                range.insertNode(span)
            }
        } catch (e) {
            console.error("Font size apply error", e)
        }
        setVisible(false)
    }

    const undo = () => document.execCommand('undo')
    const redo = () => document.execCommand('redo')

    if (!visible) return null

    return (
        <div
            ref={menuRef}
            className="fixed z-[60] bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-56 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-left"
            style={{
                top: position.y,
                left: position.x,
                maxHeight: "calc(100vh - 20px)",
                overflowY: "auto"
            }}
        >
            {/* Section Texte */}
            <MenuSection title="Texte">
                <MenuItem
                    icon={Bold}
                    label="Gras"
                    shortcut="⌘B"
                    onClick={() => exec('bold')}
                />
                <MenuItem
                    icon={Italic}
                    label="Italique"
                    shortcut="⌘I"
                    onClick={() => exec('italic')}
                />
                <MenuItem
                    icon={Underline}
                    label="Souligné"
                    shortcut="⌘U"
                    onClick={() => exec('underline')}
                />
                <MenuItem
                    icon={Highlighter}
                    label="Surligner"
                    onClick={() => changeBackgroundColor()}
                />
            </MenuSection>

            <Separator />

            {/* Section Titres */}
            <MenuSection title="Titres">
                <MenuItem
                    icon={Heading1}
                    label="Titre 1"
                    onClick={() => exec('formatBlock', '<H1>')}
                />
                <MenuItem
                    icon={Heading2}
                    label="Titre 2"
                    onClick={() => exec('formatBlock', '<H2>')}
                />
                <MenuItem
                    icon={Heading3}
                    label="Titre 3"
                    onClick={() => exec('formatBlock', '<H3>')}
                />
            </MenuSection>

            <Separator />

            {/* Section Formatage */}
            <MenuSection title="Formatage">
                <MenuItem
                    icon={List}
                    label="Liste à puces"
                    onClick={() => exec('insertUnorderedList')}
                />
                <MenuItem
                    icon={ListOrdered}
                    label="Liste numérotée"
                    onClick={() => exec('insertOrderedList')}
                />
                <MenuItem
                    icon={AlignLeft}
                    label="Aligner à gauche"
                    onClick={() => exec('justifyLeft')}
                />
                <MenuItem
                    icon={AlignCenter}
                    label="Centrer"
                    onClick={() => exec('justifyCenter')}
                />
                <MenuItem
                    icon={AlignRight}
                    label="Aligner à droite"
                    onClick={() => exec('justifyRight')}
                />
                <MenuItem
                    icon={Type}
                    label="Taille de police..."
                    onClick={() => {
                        const size = prompt("Taille en pixels (1-100):", "16")
                        if (size) applyCustomFontSize(size)
                    }}
                />
            </MenuSection>

            <Separator />

            {/* Section Insertion */}
            <MenuSection title="Insertion">
                <MenuItem
                    icon={Grid}
                    label="Tableau..."
                    onClick={insertTable}
                />
                <MenuItem
                    icon={Link}
                    label="Lien..."
                    onClick={() => createLink()}
                />
                <MenuItem
                    icon={Code}
                    label="Code en ligne"
                    onClick={() => exec('formatBlock', '<CODE>')}
                />
            </MenuSection>

            <Separator />

            {/* Section Couleurs */}
            <MenuSection title="Couleurs">
                <MenuItem
                    icon={Palette}
                    label="Couleur du texte"
                    onClick={() => changeTextColor()}
                />
                <MenuItem
                    icon={PaintBucket}
                    label="Couleur de fond"
                    onClick={() => changeBackgroundColor()}
                />
            </MenuSection>

            <Separator />

            {/* Section Liens */}
            <MenuSection title="Liens">
                <MenuItem
                    icon={Link}
                    label="Insérer un lien"
                    onClick={() => createLink()}
                />
                <MenuItem
                    icon={Unlink}
                    label="Supprimer le lien"
                    onClick={() => exec('unlink')}
                />
            </MenuSection>

            <Separator />

            {/* Section Edition */}
            <MenuSection title="Édition">
                <MenuItem
                    icon={Undo}
                    label="Annuler"
                    shortcut="⌘Z"
                    onClick={() => undo()}
                />
                <MenuItem
                    icon={Redo}
                    label="Rétablir"
                    shortcut="⌘⇧Z"
                    onClick={() => redo()}
                />
                <MenuItem
                    icon={Copy}
                    label="Copier"
                    shortcut="⌘C"
                    onClick={() => {
                        document.execCommand('copy')
                        setVisible(false)
                    }}
                />
                <MenuItem
                    icon={Type}
                    label="Coller comme texte"
                    shortcut="⌘⇧V"
                    onClick={pasteAsPlainText}
                />
                <MenuItem
                    icon={FileText}
                    label="Coller avec format"
                    shortcut="⌘V"
                    onClick={async () => {
                        try {
                            document.execCommand('paste')
                        } catch {
                            pasteAsPlainText()
                        }
                    }}
                />
                {selectedText && (
                    <MenuItem
                        icon={TextSelect}
                        label="Supprimer le format"
                        onClick={removeFormatting}
                    />
                )}
            </MenuSection>

            {/* Close button */}
            <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    onClick={() => setVisible(false)}
                >
                    <X className="w-4 h-4" />
                    Fermer
                </button>
            </div>
        </div>
    )
}

const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="px-3 py-1.5">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {title}
        </div>
        <div className="space-y-0.5">
            {children}
        </div>
    </div>
)

const MenuItem = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled
}: {
    icon: any,
    label: string,
    shortcut?: string,
    onClick: () => void,
    disabled?: boolean
}) => (
    <button
        className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left rounded",
            disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseDown={(e) => {
            e.preventDefault()
            if (!disabled) onClick()
        }}
        disabled={disabled}
    >
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {shortcut && (
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {shortcut}
            </span>
        )}
    </button>
)

const Separator = () => <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />