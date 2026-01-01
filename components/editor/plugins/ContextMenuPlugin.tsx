"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, $getSelection, $isRangeSelection, $isNodeSelection, COMMAND_PRIORITY_LOW, COPY_COMMAND, CUT_COMMAND, PASTE_COMMAND } from "lexical";
import { useCallback, useEffect, useState, useRef } from "react";
import { Copy, Scissors, Clipboard, Trash2, X, Sparkles, Send, Loader2, Mic, MicOff } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { $createSuggestionNode } from "../nodes/SuggestionNode";
import { $applyDiffAsSuggestions } from "@/lib/lexical-diff";
import * as Diff from "diff";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function ContextMenuPlugin() {
    const [editor] = useLexicalComposerContext();
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [basePrompt, setBasePrompt] = useState("");
    const [selectedText, setSelectedText] = useState("");

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (listening) {
            setAiPrompt(basePrompt + (basePrompt && transcript ? " " : "") + transcript);
        }
    }, [transcript, listening, basePrompt]);

    const menuRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            setPosition({ x: event.clientX, y: event.clientY });
            setShowAIPrompt(false);

            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    setSelectedText(selection.getTextContent());
                } else {
                    setSelectedText("");
                }
            });
        };

        const handleClick = (e: MouseEvent) => {
            if (menuRef.current?.contains(e.target as Node)) return;
            if (promptRef.current?.contains(e.target as Node)) return;
            setPosition(null);
            setShowAIPrompt(false);
        };

        const rootElement = editor.getRootElement();
        if (rootElement) {
            rootElement.addEventListener("contextmenu", handleContextMenu);
        }
        document.addEventListener("click", handleClick);

        return () => {
            if (rootElement) {
                rootElement.removeEventListener("contextmenu", handleContextMenu);
            }
            document.removeEventListener("click", handleClick);
        };
    }, [editor]);

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);

        try {
            let currentContent = "";
            editor.getEditorState().read(() => {
                currentContent = $convertToMarkdownString(TRANSFORMERS);
            });

            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    currentContent,
                    selection: selectedText
                })
            });

            if (!res.ok) throw new Error('Generation failed');
            const { content } = await res.json();

            editor.update(() => {
                const root = $getRoot();
                const oldContent = $convertToMarkdownString(TRANSFORMERS);
                root.clear();

                // If we have a selection, we could be more surgical, 
                // but user asked to keep manual edits if rejected.
                // $applyDiffAsSuggestions will create SuggestionNodes.
                const nodes = $applyDiffAsSuggestions(oldContent, content);

                // Append nodes to root (simplified paragraph wrapping)
                const p = $createParagraphNode();
                nodes.forEach(node => p.append(node));
                root.append(p);
            });

            setShowAIPrompt(false);
            setPosition(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
            setAiPrompt("");
        }
    };

    if (!position) return null;

    return createPortal(
        <>
            {!showAIPrompt ? (
                <div
                    ref={menuRef}
                    className="fixed z-[9999] min-w-[180px] bg-popover text-popover-foreground rounded-md border border-border shadow-lg animate-in fade-in zoom-in-95 duration-100 p-1"
                    style={{ top: position.y, left: position.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-0.5">
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground select-none outline-none cursor-pointer group"
                            onClick={() => {
                                setShowAIPrompt(true);
                            }}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Modifier avec l'IA</span>
                        </button>

                        <div className="h-px bg-border my-1" />

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
                                // @ts-ignore - native paste is complex, simpler to dispatch without args for fallback
                                editor.dispatchCommand(PASTE_COMMAND, undefined);
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
                </div>
            ) : (
                <div
                    ref={promptRef}
                    className="fixed z-[9999] w-[320px] bg-background border border-border shadow-2xl rounded-lg p-3 animate-in fade-in slide-in-from-top-4 duration-300"
                    style={{
                        top: Math.min(position.y, window.innerHeight - 120),
                        left: Math.min(position.x, window.innerWidth - 340)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Sparkles className="w-3 h-3" />
                                <span>MODIFICATION IA</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAIPrompt(false)}>
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Input
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Que voulez-vous modifier ?"
                                className="h-10 text-sm focus-visible:ring-amber-500 border-amber-100 bg-amber-50/20 pr-8"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAIGenerate();
                                    if (e.key === 'Escape') setPosition(null);
                                }}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn("h-8 w-8 absolute right-12 top-1 text-muted-foreground hover:text-amber-600", listening && "text-red-500 animate-pulse")}
                                onClick={() => {
                                    if (!browserSupportsSpeechRecognition) {
                                        alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
                                        return;
                                    }
                                    if (listening) {
                                        SpeechRecognition.stopListening();
                                    } else {
                                        setBasePrompt(aiPrompt);
                                        resetTranscript();
                                        SpeechRecognition.startListening({ continuous: true, language: 'fr-FR' });
                                    }
                                }}
                                title="Dictée vocale"
                            >
                                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                            <Button
                                size="icon"
                                className="h-10 w-10 shrink-0 bg-amber-500 hover:bg-amber-600 shadow-md transition-all active:scale-95"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiPrompt}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {selectedText && (
                            <p className="text-[10px] text-muted-foreground truncate italic opacity-80">
                                Sélection: "{selectedText}"
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>,
        document.body
    );
}
