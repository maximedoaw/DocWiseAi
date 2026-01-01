"use client"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ToolbarPlugin } from "./plugins/ToolbarPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { TRANSFORMERS } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { $getRoot, $insertNodes, EditorState, $createParagraphNode, $createTextNode, $getNodeByKey } from "lexical"

// ... imports
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { DocumentStructureSidebar } from "./plugins/DocumentStructureSidebar"
import { BannerNode } from "@/components/editor/nodes/BannerNode"
import { SimpleImageNode } from "@/components/editor/nodes/SimpleImageNode"
import ContextMenuPlugin from "./plugins/ContextMenuPlugin"
import { SuggestionNode } from "@/components/editor/nodes/SuggestionNode"
import { SuggestionPlugin } from "./plugins/SuggestionPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { PageBreakNode } from "@/components/editor/nodes/PageBreakNode"
import { FloatingTextFormatMenu } from "./plugins/FloatingTextFormatMenu"

// Theme styling for Lexical nodes
const theme = {
    ltr: "ltr",
    rtl: "rtl",
    placeholder: "editor-placeholder",
    paragraph: "editor-paragraph mb-2 leading-relaxed text-foreground/90 font-sans",
    quote: "editor-quote border-l-4 border-primary pl-4 italic text-muted-foreground my-4",
    heading: {
        h1: "editor-heading-h1 text-3xl font-bold mt-6 mb-4 tracking-tight text-foreground scroll-m-20",
        h2: "editor-heading-h2 text-2xl font-semibold mt-5 mb-3 tracking-tight text-foreground scroll-m-20",
        h3: "editor-heading-h3 text-xl font-semibold mt-4 mb-2 tracking-tight text-foreground scroll-m-20",
    },
    list: {
        nested: {
            listitem: "editor-nested-listitem ml-4",
        },
        ol: "editor-list-ol list-decimal list-inside my-4 space-y-1",
        ul: "editor-list-ul list-disc list-inside my-4 space-y-1",
        listitem: "editor-listitem",
    },
    image: "editor-image",
    link: "editor-link text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors",
    text: {
        bold: "editor-text-bold font-bold",
        italic: "editor-text-italic italic",
        overflowed: "editor-text-overflowed",
        hashtag: "editor-text-hashtag",
        underline: "editor-text-underline underline underline-offset-4",
        strikethrough: "editor-text-strikethrough line-through",
        underlineStrikethrough: "editor-text-underlineStrikethrough underline line-through",
        code: "editor-text-code font-mono bg-muted px-[0.3rem] py-[0.2rem] rounded text-sm font-medium",
    },
    code: "editor-code font-mono bg-muted p-4 rounded-lg block my-4 overflow-x-auto text-sm",

    // Table Styles
    table: "border-collapse border border-border w-full my-4 text-sm",
    tableCell: "border border-border p-2 align-top relative",
    tableCellHeader: "bg-muted/50 font-medium",
    tableRow: "hover:bg-muted/10",

    codeHighlight: {
        atrule: "editor-tokenAttr",
        attr: "editor-tokenAttr",
        boolean: "editor-tokenProperty",
        builtin: "editor-tokenSelector",
        cdata: "editor-tokenComment",
        char: "editor-tokenSelector",
        class: "editor-tokenFunction",
        "class-name": "editor-tokenFunction",
        comment: "editor-tokenComment text-gray-500",
        constant: "editor-tokenProperty",
        deleted: "editor-tokenProperty",
        doctype: "editor-tokenComment",
        entity: "editor-tokenOperator",
        function: "editor-tokenFunction text-blue-600",
        important: "editor-tokenVariable",
        inserted: "editor-tokenSelector",
        keyword: "editor-tokenAttr text-purple-600",
        namespace: "editor-tokenVariable",
        number: "editor-tokenProperty text-red-600",
        operator: "editor-tokenOperator",
        prolog: "editor-tokenComment",
        property: "editor-tokenProperty",
        punctuation: "editor-tokenPunctuation text-gray-400",
        regex: "editor-tokenVariable",
        selector: "editor-tokenSelector",
        string: "editor-tokenSelector text-green-600",
        symbol: "editor-tokenProperty",
        tag: "editor-tokenProperty",
        url: "editor-tokenOperator",
        variable: "editor-tokenVariable",
    },
}

interface EditorProps {
    projectId: Id<"projects">
    pageId: string
    initialContent?: string
    pages: any[]
    onPageSelect: (id: string) => void
}

function AutoSavePlugin({ projectId, pageId }: { projectId: Id<"projects">, pageId: string }) {
    const [editor] = useLexicalComposerContext();
    const updatePageContent = useMutation(api.projects.updatePageContent);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
            // Don't save if no elements or leaves are dirty
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
                return;
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                const serializedState = JSON.stringify(editorState);
                updatePageContent({ projectId, pageId, content: serializedState })
                    .then(() => console.log("Auto-saved"))
                    .catch((e) => console.error("Failed to auto-save", e));
            }, 1000); // Debounce saves by 1 second
        });
    }, [editor, projectId, pageId, updatePageContent]);

    return null;
}

// Wrapper to expose Lexical Context to manual save
const EditorRefPlugin = forwardRef(({ projectId, pageId }: { projectId: Id<"projects">, pageId: string }, ref) => {
    const [editor] = useLexicalComposerContext()
    const updatePageContent = useMutation(api.projects.updatePageContent)

    useImperativeHandle(ref, () => ({
        save: () => {
            const editorState = editor.getEditorState()
            const serializedState = JSON.stringify(editorState)
            const promise = updatePageContent({ projectId, pageId, content: serializedState })
            return promise
        }
    }))
    return null
})
EditorRefPlugin.displayName = "EditorRefPlugin"

// Plugin to load initial content
function InitialContentPlugin({ initialContent, pageId }: { initialContent?: string, pageId: string }) {
    const [editor] = useLexicalComposerContext()
    const loadedPageIdRef = useRef<string | null>(null)
    const isInitialMount = useRef(true)

    useEffect(() => {
        // Reset on page change
        if (loadedPageIdRef.current !== pageId) {
            loadedPageIdRef.current = null
            isInitialMount.current = true
        }

        // Only load if this is a different page or we haven't loaded yet
        if (loadedPageIdRef.current === pageId || !isInitialMount.current) return

        if (!initialContent || initialContent === "{}" || initialContent.trim() === "") {
            // Empty content - create empty paragraph
            editor.update(() => {
                const root = $getRoot()
                root.clear()
                const paragraph = $createParagraphNode()
                root.append(paragraph)
                loadedPageIdRef.current = pageId
                isInitialMount.current = false
            })
            return
        }

        editor.update(() => {
            try {
                const parsedContent = JSON.parse(initialContent)
                if (parsedContent && parsedContent.root) {
                    // Use Lexical's built-in deserialization
                    const editorState = editor.parseEditorState(initialContent)
                    editor.setEditorState(editorState)
                    loadedPageIdRef.current = pageId
                    isInitialMount.current = false
                } else {
                    // Invalid structure - create empty paragraph
                    const root = $getRoot()
                    root.clear()
                    const paragraph = $createParagraphNode()
                    root.append(paragraph)
                    loadedPageIdRef.current = pageId
                    isInitialMount.current = false
                }
            } catch (error) {
                console.error("Error loading initial content:", error)
                // If JSON parsing fails, create a simple paragraph
                const root = $getRoot()
                root.clear()
                const paragraph = $createParagraphNode()
                root.append(paragraph)
                loadedPageIdRef.current = pageId
                isInitialMount.current = false
            }
        })
    }, [editor, initialContent, pageId])

    return null
}

// Internal Plugin to handle Sidebar logic with access to Editor Context
function SidebarPlugin({ projectId, pages, activePageId, onPageSelect }: {
    projectId: Id<"projects">,
    pages: any[],
    activePageId: string,
    onPageSelect: (id: string) => void
}) {
    const [editor] = useLexicalComposerContext();

    return (
        <DocumentStructureSidebar
            projectId={projectId}
            pages={pages}
            activePageId={activePageId}
            onPageSelect={onPageSelect}
            onSectionClick={(key) => {
                editor.update(() => {
                    const node = $getNodeByKey(key);
                    if (node) {
                        const element = editor.getElementByKey(node.getKey());
                        if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "center" });
                            // Select the node to give visual feedback
                            // @ts-ignore
                            if (node.select) node.select();
                        }
                    }
                });
            }}
        />
    );
}

export const Editor = forwardRef<any, EditorProps>(({ projectId, pageId, initialContent, pages, onPageSelect }, ref) => {
    const initialConfig = {
        namespace: `DocWiseEditor-${pageId}`,
        theme,
        onError: (error: Error) => {
            console.error(error)
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            PageBreakNode,
            BannerNode,
            SimpleImageNode,
            SuggestionNode
        ]
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="flex flex-1 w-full h-full gap-4">
                <div className="relative flex-1 flex flex-col min-w-0 bg-background rounded-lg border border-border/50 shadow-sm overflow-hidden">
                    <ToolbarPlugin />
                    <div className="relative flex-1 bg-muted/10 overflow-auto">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="min-h-[29.7cm] w-full max-w-[21cm] mx-auto bg-background shadow-md my-4 sm:my-8 p-4 sm:p-8 md:p-[2.5cm] outline-none prose prose-stone dark:prose-invert max-w-full" />
                            }
                            placeholder={
                                <div className="absolute top-[2cm] sm:top-[3.5cm] left-0 right-0 text-center text-muted-foreground pointer-events-none px-4">
                                    Commencez à rédiger votre rapport...
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <TablePlugin />
                    <ContextMenuPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <FloatingTextFormatMenu />
                    <SuggestionPlugin />
                    <InitialContentPlugin initialContent={initialContent} pageId={pageId} />
                    <AutoSavePlugin projectId={projectId} pageId={pageId} />
                    <EditorRefPlugin projectId={projectId} pageId={pageId} ref={ref} />
                </div>

                {/* Right Sidebar for Structure */}
                <div className="hidden xl:block h-full">
                    <SidebarPlugin
                        projectId={projectId}
                        pages={pages}
                        activePageId={pageId}
                        onPageSelect={onPageSelect}
                    />
                </div>
            </div>
        </LexicalComposer >
    )
})
Editor.displayName = "Editor"
