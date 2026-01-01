"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createTextNode,
    $getNodeByKey,
    COMMAND_PRIORITY_EDITOR,
    LexicalCommand,
    NodeKey,
} from "lexical";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { $isSuggestionNode, SuggestionNode, ACCEPT_SUGGESTION_COMMAND, REJECT_SUGGESTION_COMMAND } from "../nodes/SuggestionNode";
import { Check, X } from "lucide-react";

export function SuggestionPlugin() {
    const [editor] = useLexicalComposerContext();
    const [suggestionKeys, setSuggestionKeys] = useState<string[]>([]);

    useEffect(() => {
        if (!editor.hasNodes([SuggestionNode])) {
            throw new Error("SuggestionPlugin: SuggestionNode not registered on editor");
        }

        // Track all SuggestionNodes
        return editor.registerMutationListener(SuggestionNode, (mutations) => {
            setSuggestionKeys((prev) => {
                const next = new Set(prev);
                for (const [key, mutation] of mutations) {
                    if (mutation === "created") {
                        next.add(key);
                    } else if (mutation === "destroyed") {
                        next.delete(key);
                    }
                }
                return Array.from(next);
            });
        });
    }, [editor]);

    // Command Implementations
    useEffect(() => {
        return editor.registerCommand(
            ACCEPT_SUGGESTION_COMMAND,
            (payload: NodeKey) => {
                editor.update(() => {
                    const node = $getNodeByKey(payload);
                    if ($isSuggestionNode(node)) {
                        // Unwrap children (keep content, remove wrapper)
                        const children = node.getChildren();
                        for (const child of children) {
                            node.insertBefore(child);
                        }
                        node.remove();
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            REJECT_SUGGESTION_COMMAND,
            (payload: NodeKey) => {
                editor.update(() => {
                    const node = $getNodeByKey(payload);
                    if ($isSuggestionNode(node)) {
                        // Revert to original text
                        // We might want to parse originalText if it had markdown? 
                        // But usually originalText is just the plain text before change?
                        // If it came from a diff, it's just text string.
                        // We restore it as simple text.
                        if (node.__originalText) {
                            const textNode = $createTextNode(node.__originalText);
                            node.replace(textNode);
                        } else {
                            // If original text was empty (insertion), just remove.
                            node.remove();
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return (
        <>
            {suggestionKeys.map((key) => (
                <SuggestionControls key={key} nodeKey={key} editor={editor} />
            ))}
        </>
    );
}

function SuggestionControls({ nodeKey, editor }: { nodeKey: NodeKey, editor: any }) {
    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const update = () => {
            const dom = editor.getElementByKey(nodeKey);
            if (dom) {
                const rect = dom.getBoundingClientRect();
                // Position above the node
                setCoords({
                    x: rect.left,
                    y: rect.top - 32 // Offset up
                });
            } else {
                setCoords(null);
            }
        };

        const removeUpdateListener = editor.registerUpdateListener(({ editorState }: any) => {
            editorState.read(() => {
                update();
            });
        });

        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);

        // Initial update
        editor.getEditorState().read(() => update());

        return () => {
            removeUpdateListener();
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [editor, nodeKey]);

    if (!coords) return null;

    return createPortal(
        <div
            className="fixed z-50 flex items-center gap-1 bg-background border shadow-sm rounded-md p-1 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: coords.x, top: coords.y }}
        >
            <button
                className="h-6 w-6 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition-colors"
                onClick={() => editor.dispatchCommand(ACCEPT_SUGGESTION_COMMAND, nodeKey)}
                title="Valider"
            >
                <Check className="w-4 h-4" />
            </button>
            <button
                className="h-6 w-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
                onClick={() => editor.dispatchCommand(REJECT_SUGGESTION_COMMAND, nodeKey)}
                title="Rejeter"
            >
                <X className="w-4 h-4" />
            </button>
        </div>,
        document.body
    );
}
