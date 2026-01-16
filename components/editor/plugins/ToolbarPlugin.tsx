"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useActiveEditor } from "../ActiveEditorContext"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, $insertNodes, $getRoot, $createParagraphNode, $isElementNode, $createTextNode } from "lexical"
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
    Image as ImageIcon,
    Sparkles,
    Mic,
    MicOff,
    Hash,
    ChevronRight
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
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getPageSections, Section } from "./DocumentStructureSidebar"
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { $applyDiffAsSuggestions } from "@/lib/lexical-diff"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { $generateNodesFromDOM } from "@lexical/html"
import { AIValidationFloatingMenu } from "./AIValidationFloatingMenu"
import { $createSuggestionNode, $isSuggestionNode, REJECT_SUGGESTION_COMMAND } from "@/components/editor/nodes/SuggestionNode"
import { toast } from "react-toastify"

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

interface ToolbarPluginProps {
    projectId: Id<"projects">
}

export function ToolbarPlugin({ projectId }: ToolbarPluginProps) {
    const { activeEditor: editor } = useActiveEditor()
    const addPage = useMutation(api.projects.addPage)
    const updatePageContent = useMutation(api.projects.updatePageContent)
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [isCode, setIsCode] = useState(false)
    const [currentColor, setCurrentColor] = useState<string | null>(null)
    const [currentHighlight, setCurrentHighlight] = useState<string | null>(null)
    const [currentFontSize, setCurrentFontSize] = useState<string | null>(null)

    // AI Autocomplete State
    const [aiPrompt, setAiPrompt] = useState("")
    const [basePrompt, setBasePrompt] = useState("")
    const [aiSections, setAiSections] = useState<Section[]>([])
    const [filteredSections, setFilteredSections] = useState<Section[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestionIndex, setSuggestionIndex] = useState(0)

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

    // AI Review State
    const [aiReviewOpen, setAiReviewOpen] = useState(false)
    const [aiPendingContent, setAiPendingContent] = useState("")
    const [aiOriginalContent, setAiOriginalContent] = useState("")

    // AI Validation State
    const [showValidation, setShowValidation] = useState(false)
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

    // Tag Badge State
    const [selectedTargets, setSelectedTargets] = useState<Section[]>([])

    // Helper to find range of nodes for a section
    const getSectionNodes = useCallback((section: Section, rootNode?: any): any[] => {
        let nodesToReplace: any[] = [];
        const findNodes = (root: any) => {
            const children = root.getChildren();
            let startFound = false;
            let currentLevel = parseInt(section.type.replace('h', ''));

            for (const node of children) {
                // Find the starting header
                if (!startFound) {
                    // 1. Try matching by key first (most reliable)
                    if (section.key && node.getKey() === section.key) {
                        startFound = true;
                        nodesToReplace.push(node);
                        continue;
                    }

                    // 2. Fallback to text matching
                    if ($isElementNode(node) && node.getType() === 'heading') {
                        const nodeText = node.getTextContent().trim().toLowerCase();
                        const targetText = section.text.trim().toLowerCase();

                        if (nodeText === targetText) {
                            // @ts-ignore
                            if (node.getTag() === section.type) {
                                startFound = true;
                                nodesToReplace.push(node);
                                continue;
                            }
                        }
                    }
                } else {
                    // Collect following nodes until next equal or higher level header
                    if ($isElementNode(node) && node.getType() === 'heading') {
                        // @ts-ignore
                        const level = parseInt(node.getTag().replace('h', ''));
                        if (level <= currentLevel) {
                            break; // End of section
                        }
                    }
                    nodesToReplace.push(node);
                }
            }
        };

        if (rootNode) {
            findNodes(rootNode);
        } else {
            editor.getEditorState().read(() => findNodes($getRoot()));
        }
        return nodesToReplace;
    }, [editor]);

    const handleAIAction = async (btn?: HTMLButtonElement) => {
        if (!editor) return;
        if (!aiPrompt && selectedTargets.length === 0) return;

        let currentContent = "";
        let selection = "";

        editor.getEditorState().read(() => {
            currentContent = $convertToMarkdownString(TRANSFORMERS);
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
                selection = sel.getTextContent();
            }

            // If we have targeted sections, collect their content for context
            if (selectedTargets.length > 0) {
                selection = "Targeted Sections Content:\n";
                selectedTargets.forEach(target => {
                    const nodes = getSectionNodes(target);
                    selection += `--- Section: ${target.text} ---\n`;
                    nodes.forEach(n => {
                        selection += n.getTextContent() + "\n";
                    });
                });
            }
        });

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Génération...';
            }

            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt + (selectedTargets.length > 0 ? ` (Cible et réécris ces sections: ${selectedTargets.map(t => t.text).join(', ')})` : ""),
                    currentContent,
                    selection
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("AI API Error:", errorData);
                if (res.status === 503) {
                    throw new Error("L'IA est actuellement surchargée par un grand nombre de demandes. Veuillez réessayer dans quelques instants.");
                }
                throw new Error(errorData.details || errorData.error || "Une erreur inconnue est survenue lors de la génération.");
            }

            let { content } = await res.json();

            // Clean markdown code blocks if present
            content = content.replace(/```(?:html|markdown)?\n?([\s\S]*?)```/g, '$1').trim();

            // 1. Initial Parsing (Standard DOM, no Lexical context needed)
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, "text/html");

            // 2. Handle NEW PAGES if any (Async mutations)
            const pageTags = Array.from(dom.querySelectorAll('page'));
            console.log("Found page tags:", pageTags.length);

            for (const pageTag of pageTags) {
                const title = pageTag.getAttribute('title') || "Nouvelle Page";
                const pageHtml = pageTag.innerHTML;

                console.log(`[AI] Creating new page: "${title}" with HTML length: ${pageHtml.length}`);
                const newPageId = await addPage({ projectId, title });

                if (newPageId) {
                    toast.success(`Page "${title}" créée.`);

                    // We need a Lexical context to generate nodes and export JSON
                    // We MUST use editor.update() to create nodes ($ functions)
                    // We need a Lexical context to generate nodes and export JSON
                    // We use a Promise to wait for the update to complete and return the JSON
                    const rootNodeJson = await new Promise<string>((resolve) => {
                        editor.update(() => {
                            try {
                                const pageDom = parser.parseFromString(pageHtml, "text/html");
                                const pageNodes = $generateNodesFromDOM(editor, pageDom);
                                console.log(`[AI] Generated ${pageNodes.length} nodes for page "${title}"`);

                                const rootNode = {
                                    root: {
                                        children: pageNodes.reduce((acc: any[], node) => {
                                            try {
                                                // Lexical Root children MUST be ElementNodes (Block-level).
                                                // If we have a TextNode or LineBreakNode at top level, we must wrap it in a Paragraph.
                                                if (node.getType() === 'text' || node.getType() === 'linebreak') {
                                                    // Check if previous node was a paragraph we can append to? 
                                                    // For now, simpler: wrap distinct text blocks in new paragraphs
                                                    // But better: if it's whitespace, ignore?
                                                    if (node.getTextContent().trim().length === 0) return acc;

                                                    // Wrap in paragraph
                                                    acc.push({
                                                        type: "paragraph",
                                                        version: 1,
                                                        children: [{
                                                            detail: 0,
                                                            format: 0,
                                                            mode: "normal",
                                                            style: "",
                                                            text: node.getTextContent(),
                                                            type: "text",
                                                            version: 1
                                                        }],
                                                        direction: "ltr",
                                                        format: "",
                                                        indent: 0
                                                    });
                                                } else {
                                                    // It's likely an ElementNode (heading, list, paragraph, quote)
                                                    const json = node.exportJSON();
                                                    acc.push(json);
                                                }
                                            } catch (e) {
                                                console.error("[AI] Export JSON failed for node:", node.getType(), e);
                                                // Fallback paragraph
                                                acc.push({
                                                    children: [{ detail: 0, format: 0, mode: "normal", style: "", text: node.getTextContent(), type: "text", version: 1 }],
                                                    direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1
                                                });
                                            }
                                            return acc;
                                        }, []),
                                        direction: "ltr", format: "", indent: 0, type: "root", version: 1
                                    }
                                };
                                const jsonString = JSON.stringify(rootNode);
                                console.log(`[AI] Serialized JSON length: ${jsonString.length}`);
                                resolve(jsonString);
                            } catch (e) {
                                console.error("Error generating page content", e);
                                resolve(JSON.stringify({ root: { children: [], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } }));
                            }
                        });
                    });

                    await updatePageContent({
                        projectId,
                        pageId: newPageId,
                        content: rootNodeJson
                    });
                }
                // Remove the tag so it doesn't get inserted into the current editor
                pageTag.remove();
            }

            // 3. Handle remaining content for the CURRENT page (Standard Sync Update)
            editor.update(() => {
                const nodes = $generateNodesFromDOM(editor, dom);
                if (nodes.length === 0) {
                    console.log("No nodes left for current page after <page> removal.");
                    return;
                }

                console.log("Generated nodes count for current page:", nodes.length);
                const selection = $getSelection();
                const groupId = Math.random().toString(36).substring(7);

                if (selectedTargets.length > 0) {
                    console.log("Targeting sections:", selectedTargets.map(t => t.text));
                    const actualNodesToDelete: any[] = [];
                    const root = $getRoot();
                    selectedTargets.forEach(target => {
                        const targetNodes = getSectionNodes(target, root);
                        actualNodesToDelete.push(...targetNodes);
                    });

                    console.log("Nodes found to replace:", actualNodesToDelete.length);

                    const originalText = actualNodesToDelete.map(n => {
                        if ($isElementNode(n) && n.getType() === 'heading') {
                            // @ts-ignore
                            const level = n.getTag().replace('h', '');
                            return '#'.repeat(parseInt(level)) + ' ' + n.getTextContent();
                        }
                        return n.getTextContent();
                    }).join("\n");

                    const suggestionNode = $createSuggestionNode(originalText, groupId);
                    suggestionNode.append(...nodes);

                    if (actualNodesToDelete.length > 0) {
                        const first = actualNodesToDelete[0];
                        first.replace(suggestionNode);
                        actualNodesToDelete.slice(1).forEach(n => n.remove());
                    } else {
                        $getRoot().append(suggestionNode);
                    }
                } else {
                    const originalText = ($isRangeSelection(selection) && !selection.isCollapsed()) ? selection.getTextContent() : "";
                    const suggestionNode = $createSuggestionNode(originalText, groupId);
                    suggestionNode.append(...nodes);

                    if ($isRangeSelection(selection)) {
                        $insertNodes([suggestionNode]);
                    } else {
                        const root = $getRoot();
                        const lastChild = root.getLastChild();
                        if (lastChild) {
                            lastChild.insertAfter(suggestionNode);
                        } else {
                            root.append(suggestionNode);
                        }
                    }
                }
            });

            setAiPrompt("");
            setSelectedTargets([]);
            if (btn) {
                btn.innerHTML = 'Générer';
                btn.disabled = false;
            }
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            setTimeout(() => {
                editor.focus();
                updateMenuPosition();
                setShowValidation(true);
            }, 100);

        } catch (err: any) {
            console.error("Generation failed:", err);
            if (btn) {
                btn.innerHTML = 'Erreur: ' + (err.message.substring(0, 15) + '...');
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = 'Générer';
                }, 3000);
            }
        }
    };

    // Handle Validation Actions
    const handleAcceptAI = useCallback(() => {
        editor.update(() => {
            // Find all pending suggestion nodes and accept them
            const root = $getRoot();
            const suggestions: any[] = [];
            root.getAllTextNodes().forEach(n => {
                // Optimization: SuggestionNodes are ElementNodes.
            });
            // Better: use dfs
            const traverse = (node: any) => {
                if ($isSuggestionNode(node)) {
                    suggestions.push(node);
                } else if ($isElementNode(node)) {
                    node.getChildren().forEach(traverse);
                }
            }
            root.getChildren().forEach(traverse);

            suggestions.forEach(node => {
                const children = node.getChildren();
                for (const child of children) {
                    node.insertBefore(child);
                }
                node.remove();
            });
        });

        setShowValidation(false)
        setMenuPosition(null)
        editor.focus()
    }, [editor])

    const handleRejectAI = useCallback(() => {
        editor.update(() => {
            const root = $getRoot();
            const suggestions: any[] = [];
            const traverse = (node: any) => {
                if ($isSuggestionNode(node)) {
                    suggestions.push(node);
                } else if ($isElementNode(node)) {
                    node.getChildren().forEach(traverse);
                }
            }
            root.getChildren().forEach(traverse);

            suggestions.forEach(node => {
                editor.dispatchCommand(REJECT_SUGGESTION_COMMAND, node.getKey());
            });
        });

        setShowValidation(false)
        setMenuPosition(null)
        editor.focus()
    }, [editor])

    // Helper to update menu position based on selection
    const updateMenuPosition = useCallback(() => {
        // Use requestAnimationFrame to ensure we run after layout updates
        requestAnimationFrame(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Viewport Safety
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Center horizontally relative to selection, but clamp to screen edges
                let left = rect.left + (rect.width / 2);
                left = Math.max(20, Math.min(viewportWidth - 20, left)); // Keep 20px padding from edges

                // Position above, but flip to below if not enough space top
                let top = rect.top - 60; // Default: Above
                if (top < 100) { // If too close to header/top
                    top = rect.bottom + 20; // Flip to below
                }

                setMenuPosition({
                    top: top,
                    left: left
                });
            } else {
                setMenuPosition(null);
            }
        });
    }, []);

    // Mutation for file upload
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

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
        if (!editor) return;
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar()
            })
        })
    }, [editor, updateToolbar])

    const insertBanner = (type: BannerType) => {
        if (!editor) return;
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createBannerNode(type))
            }
        })
    }

    // if (!editor) return null; // Don't hide the toolbar

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-muted/20 rounded-t-lg sticky top-0 z-10 backdrop-blur shrink-0 min-h-[50px]">
            {/* History Controls */}
            <div className="flex items-center gap-0.5">
                <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => editor?.dispatchCommand(UNDO_COMMAND, undefined)} title="Annuler">
                    <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => editor?.dispatchCommand(REDO_COMMAND, undefined)} title="Rétablir">
                    <Redo className="h-3.5 w-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
                <Toggle disabled={!editor} size="sm" pressed={isBold} onPressedChange={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} className="h-7 w-7 p-0 cursor-pointer" aria-label="Gras">
                    <Bold className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle disabled={!editor} size="sm" pressed={isItalic} onPressedChange={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} className="h-7 w-7 p-0 cursor-pointer" aria-label="Italique">
                    <Italic className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle disabled={!editor} size="sm" pressed={isUnderline} onPressedChange={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} className="h-7 w-7 p-0 cursor-pointer" aria-label="Souligné">
                    <Underline className="h-3.5 w-3.5" />
                </Toggle>

                {/* Advanced Formatting Group (Hidden on tiny screens) */}
                <div className="hidden sm:flex items-center gap-0.5">
                    <Toggle disabled={!editor} size="sm" pressed={isStrikethrough} onPressedChange={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className="h-7 w-7 p-0 cursor-pointer" aria-label="Barré">
                        <Strikethrough className="h-3.5 w-3.5" />
                    </Toggle>
                    <Toggle disabled={!editor} size="sm" pressed={isCode} onPressedChange={() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "code")} className="h-7 w-7 p-0 cursor-pointer" aria-label="Code">
                        <Code className="h-3.5 w-3.5" />
                    </Toggle>
                </div>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Headings & Lists */}
            <div className="flex items-center gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button disabled={!editor} variant="ghost" size="sm" className="h-7 px-2 gap-1 cursor-pointer" title="Titres">
                            <Type className="h-3.5 w-3.5" />
                            <span className="text-xs hidden sm:inline">Normal</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editor?.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h1'))
                        })}>
                            <Heading1 className="mr-2 h-4 w-4" /> Titre 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor?.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h2'))
                        })}>
                            <Heading2 className="mr-2 h-4 w-4" /> Titre 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor?.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h3'))
                        })}>
                            <Heading3 className="mr-2 h-4 w-4" /> Titre 3
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => editor?.update(() => {
                            const selection = $getSelection()
                            if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createQuoteNode())
                        })}>
                            <Type className="mr-2 h-4 w-4" /> Citation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden sm:flex items-center gap-0.5">
                    <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor?.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
                        <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor?.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
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
                        <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0" title="Insérer une bannière">
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
                        <Button disabled={!editor} variant="ghost" size="sm" className="h-7 w-7 p-0" title="Insérer un tableau">
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
                                        editor?.dispatchCommand(INSERT_TABLE_COMMAND, {
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
                    className="h-7 w-7 p-0 cursor-pointer"
                    title="Insérer une image"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                try {
                                    // 1. Get Upload URL
                                    // We need to fetch this from Convex. Since we can't use `useMutation` directly inside this callback easily without setting it up in the component body first:
                                    // Actually we can, we just need to pass the mutation function to this handler or use the one from the hook we'll add.

                                    // For now, let's use a temporary placeholder while it uploads?
                                    // Better: We need the mutation available.
                                    // I'll assume `generateUploadUrl` is passed or available via hook at the top.

                                    // Let's trigger a custom event or handled via a method exposed?
                                    // Easiest is to add useMutation at top level.

                                    // (This click handler will be replaced by the one below that uses the mutation)
                                } catch (error) {
                                    console.error("Upload failed", error);
                                    alert("Erreur lors de l'upload de l'image");
                                }
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

            {/* AI Generation */}
            <Dialog onOpenChange={(open) => {
                if (open) {
                    editor?.getEditorState().read(() => {
                        const json = JSON.stringify(editor?.getEditorState().toJSON());
                        setAiSections(getPageSections(json));
                    });
                    setAiPrompt("");
                    setSelectedTargets([]);
                    setShowSuggestions(false);
                }
            }}>
                <DialogTrigger asChild>
                    <Button disabled={!editor} variant="ghost" size="sm" className="h-7 px-2 gap-1 text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 cursor-pointer" title="Générer avec l'IA">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">IA</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Générer du contenu avec l'IA</DialogTitle>
                        <DialogDescription>
                            Décrivez ce que vous souhaitez générer pour cette page. L'IA créera une structure et du contenu formaté.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 relative">
                        <div className="grid gap-2 relative">
                            <Label htmlFor="prompt">Votre demande</Label>

                            <div className="relative group transition-all duration-200">
                                <div
                                    className="min-h-[120px] w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50 flex flex-wrap gap-2 items-start transition-all cursor-text"
                                    onClick={() => document.getElementById('ai-prompt-input')?.focus()}
                                >
                                    {/* Inline Orange Badges */}
                                    {selectedTargets.map((target, i) => (
                                        <div
                                            key={i}
                                            className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-orange-200/50 animate-in zoom-in-95 duration-200 group/badge whitespace-nowrap"
                                        >
                                            <Hash className="w-3 h-3 opacity-70" />
                                            <span className="max-w-[150px] truncate">{target.text}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTargets(prev => prev.filter((_, idx) => idx !== i));
                                                }}
                                                className="ml-1 hover:text-orange-900 dark:hover:text-orange-200 focus:outline-none transition-colors"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    <textarea
                                        id="ai-prompt-input"
                                        value={aiPrompt}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && aiPrompt === "" && selectedTargets.length > 0) {
                                                setSelectedTargets(prev => prev.slice(0, -1));
                                            }
                                            if (e.key === 'Enter') {
                                                if (showSuggestions && filteredSections.length > 0) {
                                                    e.preventDefault();
                                                    const section = filteredSections[0];
                                                    if (!selectedTargets.some(t => t.text === section.text)) {
                                                        setSelectedTargets(prev => [...prev, section]);
                                                    }
                                                    setAiPrompt(prev => prev.replace(/@\w*$/, "").trim() + " ");
                                                    setShowSuggestions(false);
                                                } else if (!e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAIAction();
                                                }
                                            }
                                        }}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setAiPrompt(val);
                                            const lastWord = val.split(/[\s\n]+/).pop();
                                            if (lastWord && lastWord.startsWith('@')) {
                                                const query = lastWord.slice(1).toLowerCase();
                                                const matches = aiSections.filter(s => s.text.toLowerCase().includes(query) && s.type !== 'h1');
                                                setFilteredSections(matches);
                                                setShowSuggestions(matches.length > 0);
                                            } else {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-none outline-none resize-none min-w-[150px] min-h-[200px] p-0 focus-visible:ring-0 leading-relaxed"
                                        placeholder={selectedTargets.length > 0 ? "" : "Ex: Réécris l'introduction @Intro..."}
                                    />
                                </div>
                                {!aiPrompt && (
                                    <div className="absolute top-2 left-3 text-muted-foreground pointer-events-none text-sm opacity-50">
                                        Ex: Réécris l'introduction @Intro...
                                    </div>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn("h-8 w-8 absolute right-2 bottom-2 text-muted-foreground hover:text-orange-600 transition-colors", listening && "text-red-500 animate-pulse")}
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute z-[60] w-full bg-popover text-popover-foreground border rounded-md shadow-md bottom-[100%] mb-1 max-h-[200px] overflow-auto">
                                    {filteredSections.map((section, i) => (
                                        <div
                                            key={i}
                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted font-medium flex items-center justify-between group"
                                            onClick={() => {
                                                if (!selectedTargets.some(t => t.text === section.text)) {
                                                    setSelectedTargets(prev => [...prev, section]);
                                                }
                                                // Keep prompt but remove the @ part
                                                setAiPrompt(prev => prev.replace(/@\w*$/, "").trim() + " ");
                                                setShowSuggestions(false);
                                                document.getElementById('prompt')?.focus();
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-50 text-xs">#{section.type.toUpperCase()}</span>
                                                {section.text}
                                            </div>
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={(e) => handleAIAction(e.currentTarget as HTMLButtonElement)}>
                            Générer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
            {/* AI Validation Menu */}
            <AIValidationFloatingMenu
                show={showValidation}
                onAccept={handleAcceptAI}
                onReject={handleRejectAI}
                position={menuPosition}
            />

        </div >
    )
}
