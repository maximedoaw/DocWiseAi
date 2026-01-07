"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createTextNode,
    $getNodeByKey,
    $createParagraphNode,
    COMMAND_PRIORITY_EDITOR,
    LexicalCommand,
    NodeKey,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { $isSuggestionNode, SuggestionNode, ACCEPT_SUGGESTION_COMMAND, REJECT_SUGGESTION_COMMAND } from "@/components/editor/nodes/SuggestionNode";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
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
                        const original = node.__originalText;
                        if (original) {
                            const lines = original.split('\n');
                            const restoredNodes = [];

                            for (const line of lines) {
                                // Basic heading detection
                                const headingMatch = line.match(/^(#{1,6})\s(.*)/);
                                if (headingMatch) {
                                    const level = headingMatch[1].length;
                                    const text = headingMatch[2];
                                    const heading = $createHeadingNode(`h${level}` as any);
                                    heading.append($createTextNode(text));
                                    restoredNodes.push(heading);
                                } else if (line.trim() !== "") {
                                    const p = $createParagraphNode();
                                    p.append($createTextNode(line));
                                    restoredNodes.push(p);
                                }
                            }

                            if (restoredNodes.length > 0) {
                                // Replace the suggestion node with the first restored node, 
                                // and insert the others after.
                                const first = restoredNodes[0];
                                node.replace(first);
                                for (let i = 1; i < restoredNodes.length; i++) {
                                    first.insertAfter(restoredNodes[i]);
                                }
                            } else {
                                node.remove();
                            }
                        } else {
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
            className="fixed z-[9999] flex items-center gap-1 bg-background border border-border shadow-md rounded-md p-1 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            style={{ left: coords.x, top: coords.y }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent editor blur
        >
            <button
                className="h-6 w-6 flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
                onClick={() => editor.dispatchCommand(ACCEPT_SUGGESTION_COMMAND, nodeKey)}
                title="Valider"
            >
                <Check className="w-4 h-4" />
            </button>
            <button
                className="h-6 w-6 flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                onClick={() => editor.dispatchCommand(REJECT_SUGGESTION_COMMAND, nodeKey)}
                title="Rejeter"
            >
                <X className="w-4 h-4" />
            </button>
        </div>,
        document.body
    );
}
