"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical"
import { $patchStyleText } from "@lexical/selection"
import { useEffect, useState, useRef } from "react"
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"

const QUICK_COLORS = [
    { name: "Noir", value: "#000000" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Vert", value: "#22c55e" },
    { name: "Bleu", value: "#3b82f6" },
    { name: "Violet", value: "#a855f7" },
]

const QUICK_HIGHLIGHTS = [
    { name: "Jaune", value: "#fef08a" },
    { name: "Vert", value: "#dcfce7" },
    { name: "Bleu", value: "#dbeafe" },
    { name: "Rose", value: "#fce7f3" },
]

export function FloatingTextFormatMenu() {
    const [editor] = useLexicalComposerContext()
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [isCode, setIsCode] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection()
                
                if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                    setIsBold(selection.hasFormat("bold"))
                    setIsItalic(selection.hasFormat("italic"))
                    setIsUnderline(selection.hasFormat("underline"))
                    setIsStrikethrough(selection.hasFormat("strikethrough"))
                    setIsCode(selection.hasFormat("code"))

                    // Get selection position
                    const nativeSelection = window.getSelection()
                    if (nativeSelection && nativeSelection.rangeCount > 0) {
                        const range = nativeSelection.getRangeAt(0)
                        const rect = range.getBoundingClientRect()
                        
                        setPosition({
                            top: rect.top + window.scrollY - 60,
                            left: rect.left + (rect.width / 2) - 100,
                        })
                        setIsVisible(true)
                    }
                } else {
                    setIsVisible(false)
                }
            })
        })
    }, [editor])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Don't hide if clicking on the menu itself
                return
            }
        }

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <Toggle
                size="sm"
                pressed={isBold}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                className="h-8 w-8 p-0"
                aria-label="Gras"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={isItalic}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                className="h-8 w-8 p-0"
                aria-label="Italique"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={isUnderline}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                className="h-8 w-8 p-0"
                aria-label="Souligné"
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={isStrikethrough}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                className="h-8 w-8 p-0"
                aria-label="Barré"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={isCode}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                className="h-8 w-8 p-0"
                aria-label="Code"
            >
                <Code className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-border mx-1" />

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="top">
                    <div className="grid grid-cols-5 gap-1">
                        {QUICK_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => {
                                    editor.update(() => {
                                        const selection = $getSelection()
                                        if ($isRangeSelection(selection)) {
                                            $patchStyleText(selection, { color: color.value })
                                        }
                                    })
                                }}
                                className="w-6 h-6 rounded border border-border/20 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Highlighter className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="top">
                    <div className="grid grid-cols-4 gap-1">
                        {QUICK_HIGHLIGHTS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => {
                                    editor.update(() => {
                                        const selection = $getSelection()
                                        if ($isRangeSelection(selection)) {
                                            $patchStyleText(selection, { "background-color": color.value })
                                        }
                                    })
                                }}
                                className="w-8 h-8 rounded border border-border/20 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

