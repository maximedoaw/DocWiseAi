"use client"

import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered,
    Palette, X
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

const ToggleItem = ({ onClick, isActive, children }: { onClick: () => void, isActive?: boolean, children: React.ReactNode }) => (
    <button
        onMouseDown={(e) => {
            e.preventDefault()
            onClick()
        }}
        className={cn(
            "p-1.5 rounded-md transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
        )}
    >
        {children}
    </button>
)

export function FloatingToolbar() {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [showColors, setShowColors] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let timeout: NodeJS.Timeout

        const handleSelectionChange = () => {
            clearTimeout(timeout)

            timeout = setTimeout(() => {
                const selection = window.getSelection()
                if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
                    // Only hide if we aren't interacting with the menu (e.g. clicking color)
                    // But here we rely on mousedown prevention.
                    setIsVisible(false)
                    setShowColors(false)
                    setTimeout(() => setPosition(null), 200)
                    return
                }

                // Robust check: ensure we are in a contentEditable
                let node = selection.anchorNode
                if (node?.nodeType === 3) node = node.parentElement
                const editor = (node as HTMLElement)?.closest('[contenteditable="true"]')

                if (!editor) {
                    setIsVisible(false)
                    return
                }

                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()

                if (rect.width === 0 && rect.height === 0) return

                // Position centrally above
                let left = rect.left + (rect.width / 2)

                // Viewport boundary check
                const viewportWidth = window.innerWidth
                if (left < 150) left = 150 // min left padding
                if (left > viewportWidth - 150) left = viewportWidth - 150

                setPosition({
                    top: rect.top - 55,
                    left: left
                })
                setIsVisible(true)
            }, 50) // Slightly longer debounce 
        }

        document.addEventListener("selectionchange", handleSelectionChange)
        document.addEventListener("mouseup", handleSelectionChange)
        document.addEventListener("keyup", handleSelectionChange)

        // Hide on scroll to prevent floating weirdness
        window.addEventListener("scroll", () => setIsVisible(false), { capture: true })

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange)
            document.removeEventListener("mouseup", handleSelectionChange)
            document.removeEventListener("keyup", handleSelectionChange)
            window.removeEventListener("scroll", () => setIsVisible(false))
            clearTimeout(timeout)
        }
    }, [])

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value)
    }

    if (!position && !isVisible) return null

    return (
        <div
            ref={menuRef}
            className={cn(
                "fixed z-50 flex flex-col items-center gap-2 transition-all duration-200 ease-out transform pointer-events-auto",
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
            )}
            style={{
                top: position?.top || 0,
                left: position?.left || 0,
                transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(10px)'}`
            }}
        >
            {/* Main Bar */}
            <div className="flex items-center gap-0.5 bg-background/90 backdrop-blur-md border border-border/50 shadow-xl rounded-xl p-1.5">
                <ToggleItem onClick={() => exec('bold')}><Bold className="w-4 h-4" /></ToggleItem>
                <ToggleItem onClick={() => exec('italic')}><Italic className="w-4 h-4" /></ToggleItem>

                <div className="w-px h-4 bg-border/50 mx-1" />

                <ToggleItem onClick={() => exec('formatBlock', '<H1>')}><Heading1 className="w-4 h-4" /></ToggleItem>
                <ToggleItem onClick={() => exec('formatBlock', '<H2>')}><Heading2 className="w-4 h-4" /></ToggleItem>

                <div className="w-px h-4 bg-border/50 mx-1" />

                <ToggleItem onClick={() => exec('insertUnorderedList')}><List className="w-4 h-4" /></ToggleItem>

                <div className="w-px h-4 bg-border/50 mx-1" />

                <ToggleItem onClick={() => setShowColors(!showColors)}>
                    <Palette className={cn("w-4 h-4", showColors && "text-primary")} />
                </ToggleItem>
            </div>

            {/* Expanded Color Palette (Mini) */}
            {showColors && (
                <div className="bg-background/90 backdrop-blur-md border border-border/50 shadow-xl rounded-lg p-2 grid grid-cols-5 gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {["#000000", "#ef4444", "#fb923c", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#6b7280", "#94a3b8"].map(color => (
                        <button
                            key={color}
                            className="w-5 h-5 rounded-full border border-border/20 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                exec('foreColor', color)
                            }}
                        />
                    ))}
                    <button
                        className="w-5 h-5 rounded-full border border-border/20 hover:scale-110 transition-transform flex items-center justify-center bg-white"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            exec('hiliteColor', '#fefce8') // Default highlight
                        }}
                        title="Surligner (Jaune)"
                    >
                        <div className="w-3 h-3 bg-yellow-200 rounded-full" />
                    </button>
                </div>
            )}
        </div>
    )
}
