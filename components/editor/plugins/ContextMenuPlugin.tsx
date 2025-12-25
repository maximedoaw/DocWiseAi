
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    $isNodeSelection,
    COMMAND_PRIORITY_LOW,
    COPY_COMMAND,
    CUT_COMMAND,
    PASTE_COMMAND,
    LexicalEditor,
    DELETE_CHARACTER_COMMAND,
    DELETE_WORD_COMMAND,
    DELETE_LINE_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    $getNodeByKey,
} from "lexical";
import { useCallback, useEffect, useState, useRef } from "react";
import { Copy, Scissors, Clipboard, Trash2, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

export default function ContextMenuPlugin() {
    const [editor] = useLexicalComposerContext();
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            setPosition({ x: event.clientX, y: event.clientY });
        };

        const handleClick = () => {
            setPosition(null);
        };

        // Attach listener to the editor root element
        const rootElement = editor.getRootElement();
        if (rootElement) {
            rootElement.addEventListener("contextmenu", handleContextMenu);
        }

        // Close menu on click anywhere
        document.addEventListener("click", handleClick);

        return () => {
            if (rootElement) {
                rootElement.removeEventListener("contextmenu", handleContextMenu);
            }
            document.removeEventListener("click", handleClick);
        };
    }, [editor]);

    // Close menu when scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (position) setPosition(null);
        };
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [position]);

    if (!position) return null;

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[160px] bg-popover text-popover-foreground rounded-md border border-border shadow-md animate-in fade-in zoom-in-95 duration-100 p-1"
            style={{ top: position.y, left: position.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-0.5">
                <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground select-none outline-none cursor-pointer"
                    onClick={() => {
                        editor.dispatchCommand(CUT_COMMAND, null);
                        setPosition(null);
                    }}
                >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Couper</span>
                </button>
                <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground select-none outline-none cursor-pointer"
                    onClick={() => {
                        editor.dispatchCommand(COPY_COMMAND, null);
                        setPosition(null);
                    }}
                >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                </button>
                <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground select-none outline-none cursor-pointer"
                    onClick={async () => {
                        try {
                            const text = await navigator.clipboard.readText();
                            editor.dispatchCommand(PASTE_COMMAND,
                                new ClipboardEvent('paste', {
                                    clipboardData: new DataTransfer()
                                })
                            );
                            // Fallback for permissions issues or direct paste handling if needed
                        } catch (e) {
                            console.error("Paste failed", e);
                        }
                        // Note: Programmatic paste is restricted in standard web, often requires user gesture or permission.
                        // Lexical handles internal PASTE_COMMAND heavily relying on native event.
                        // For a reliable "Paste" button, it often just instructs user to use Ctrl+V.
                        // We will try simple dispatch, but might need "navigator.clipboard" read if browser allows.

                        setPosition(null);
                    }}
                >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Coller</span>
                </button>

                <div className="h-px bg-border my-1" />

                <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-destructive text-muted-foreground select-none outline-none cursor-pointer"
                    onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.removeText();
                            } else if ($isNodeSelection(selection)) {
                                selection.getNodes().forEach(node => node.remove());
                            }
                        })
                        setPosition(null);
                    }}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                </button>
            </div>
        </div>,
        document.body
    );
}
