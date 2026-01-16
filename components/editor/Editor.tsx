"use client"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

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
import { $getRoot, $insertNodes, EditorState, $createParagraphNode, $createTextNode, $getNodeByKey, $parseSerializedNode } from "lexical"

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

import { ActiveEditorProvider, useActiveEditor } from "./ActiveEditorContext"
import { FOCUS_COMMAND } from "lexical"

// Plugin to register the editor with the context when focused
function EditorRegistrationPlugin({ pageId }: { pageId: string }) {
    const [editor] = useLexicalComposerContext();
    const { setActiveEditor } = useActiveEditor();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            // Optional: Auto-set active on update? 
            // Better to rely on Focus (see OnFocusPlugin below)
        });
    }, [editor]);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none" />
    );
}

// Plugin to set active editor on focus
function OnFocusPlugin() {
    const [editor] = useLexicalComposerContext();
    const { setActiveEditor } = useActiveEditor();

    useEffect(() => {
        const unregister = editor.registerCommand(
            FOCUS_COMMAND, // Fake command, actually we use DOM focus
            () => false,
            1
        );

        const rootElement = editor.getRootElement();
        if (rootElement) {
            const handleFocus = () => {
                console.log("Editor Focused:", editor);
                setActiveEditor(editor);
            };
            const handleClick = () => {
                setActiveEditor(editor);
            };

            rootElement.addEventListener("focus", handleFocus);
            rootElement.addEventListener("click", handleClick);

            return () => {
                rootElement.removeEventListener("focus", handleFocus);
                rootElement.removeEventListener("click", handleClick);
            };
        }
    }, [editor, setActiveEditor]);

    return null;
}


// Internal Page Editor Component
import { PaginationPlugin } from "./plugins/PaginationPlugin"

const PageEditor = ({ page, projectId, onOverflow }: { page: any, projectId: Id<"projects">, onOverflow: (json: string) => void }) => {
    const { registerEditor, unregisterEditor } = useActiveEditor();

    const initialConfig = {
        namespace: `DocWiseEditor-${page.id}`,
        theme,
        onError: (error: Error) => console.error(error),
        nodes: [
            HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode,
            TableNode, TableCellNode, TableRowNode, AutoLinkNode, LinkNode,
            PageBreakNode, BannerNode, SimpleImageNode, SuggestionNode
        ]
    }

    return (
        <div className="mb-8 relative group w-full max-w-[21cm] mx-auto px-4 sm:px-0" id={`page-${page.id}`}>
            <LexicalComposer initialConfig={initialConfig}>
                <RegisterEditorPlugin id={page.id} />

                <div
                    className="relative bg-background shadow-md h-[29.7cm] w-full p-8 sm:p-[2.5cm] outline-none transition-shadow hover:shadow-lg ring-1 ring-black/5 overflow-hidden"
                    style={{ maxHeight: '29.7cm', height: '29.7cm' }}
                    data-page-container="true"
                    onClick={(e) => {
                        // Ensure we focus the editor when clicking the "paper" area
                    }}
                >
                    {/* Page Number Indicator */}
                    <div className="absolute top-4 right-4 text-xs text-muted-foreground opacity-50 select-none pointer-events-none">
                        {page.title}
                    </div>

                    <RichTextPlugin
                        contentEditable={<ContentEditable className="outline-none w-full  prose prose-stone dark:prose-invert max-w-full" />}
                        placeholder={
                            <div className="absolute top-[2.5cm] left-[2.5cm] text-muted-foreground pointer-events-none">
                                Commencez à rédiger...
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <TablePlugin />
                    <ContextMenuPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <SuggestionPlugin />
                    <InitialContentPlugin initialContent={page.content} pageId={page.id} />
                    <AutoSavePlugin projectId={projectId} pageId={page.id} />
                    {/* <EditorRegistrationPlugin pageId={page.id} /> Replaced by RegisterEditorPlugin */}
                    <OnFocusPlugin />
                    <PaginationPlugin pageId={page.id} onOverflow={onOverflow} />
                </div>
            </LexicalComposer>
        </div>
    )
}

function RegisterEditorPlugin({ id }: { id: string }) {
    const [editor] = useLexicalComposerContext();
    const { registerEditor, unregisterEditor } = useActiveEditor();

    useEffect(() => {
        registerEditor(id, editor);
        return () => unregisterEditor(id);
    }, [id, editor, registerEditor, unregisterEditor]);

    return null;
}

export const Editor = forwardRef<any, EditorProps>(({ projectId, pageId, initialContent, pages, onPageSelect }, ref) => {
    // Wait, Editor renders ActiveEditorProvider, so we can't use the hook here directly.
    // We need to move the inner content to a component or just pass the registry refs if possible, 
    // OR, better: We make a "PageManager" inside ActiveEditorProvider. 
    // But refactoring that far is risky.
    // Hack: We can use a REF passed to the provider or just accept that Editor is the provider parent?
    // Actually, ActiveEditorProvider is INSIDE Editor's return. So Editor cannot use useActiveEditor.

    // Quick Fix: Move the list rendering into a separate component "EditorPageList" which IS inside the provider.
    return (
        <ActiveEditorProvider>
            <div className="flex flex-1 w-full h-full gap-4 relative">
                <EditorContent
                    projectId={projectId}
                    pageId={pageId}
                    pages={pages}
                    onPageSelect={onPageSelect}
                />
            </div>
        </ActiveEditorProvider>
    )
});

// New Inner Component to consume context
function EditorContent({ projectId, pageId, pages, onPageSelect }: EditorProps) {
    const { getEditor } = useActiveEditor();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const addPage = useMutation(api.projects.addPage);
    const updatePageContent = useMutation(api.projects.updatePageContent);

    // Provide this function to PaginationPlugin
    // We can't use callbacks that depend on 'pages' if 'pages' changes and re-renders everything too often?
    // Lexical updates are async.

    const handlePageOverflow = async (sourcePageId: string, contentJSON: string) => {
        const index = pages.findIndex(p => p.id === sourcePageId);
        if (index === -1) return;

        // Parse content to ensure valid nodes
        // contentJSON is the serialized JSON of the *node* that was moved (e.g. ParagraphNode)

        if (index < pages.length - 1) {
            // Move to next page
            const nextPage = pages[index + 1];
            const nextEditor = getEditor(nextPage.id);
            if (nextEditor) {
                nextEditor.update(() => {
                    const root = $getRoot();
                    const firstChild = root.getFirstChild();
                    const node = $parseSerializedNode(JSON.parse(contentJSON));
                    let insertedNode;

                    if (firstChild) {
                        insertedNode = firstChild.insertBefore(node);
                    } else {
                        insertedNode = root.append(node);
                    }

                    // Restore Selection/Focus to the end of the moved node
                    // This ensures "typing flow" continues on the next page
                    if (insertedNode) {
                        insertedNode.selectEnd();
                    }
                });
            } else {
                console.warn("Next editor not found in registry", nextPage.id);
            }
        } else {
            // Create New Page
            const newTitle = `Suite de ${pages[index].title || 'Page ' + (index + 1)}`;
            const newPageId = await addPage({ projectId, title: newTitle });

            // We need to wait for the page to be created and mounted
            // But we can just set its content immediately via mutation
            // We need to construct a valid Root JSON containing this node

            // Quick serialized root construction
            const rootJSON = {
                root: {
                    children: [JSON.parse(contentJSON)],
                    direction: null,
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1
                }
            };

            await updatePageContent({ projectId, pageId: newPageId, content: JSON.stringify(rootJSON) });
            // Ideally we would focus the new page editor here, but it's not mounted yet.
            // The user will have to click, or we need a more complex "onMount" focus logic.
            // Select the new page? Maybe not, keep focus on current but let user scroll.
            // onPageSelect(newPageId); 
        }
    };

    // We scroll to the active page on mount or selection change
    useEffect(() => {
        if (pageId) {
            const el = document.getElementById(`page-${pageId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [pageId]);

    return (
        <>
            {/* Sidebar Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-20 z-50 bg-background/80 backdrop-blur border shadow-sm hover:bg-muted"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
            >
                {isSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>

            <div className="relative flex-1 flex flex-col min-w-0 bg-background/50 rounded-lg border border-border/50 shadow-sm overflow-hidden backdrop-blur-sm">
                {/* Shared Toolbar controlling active editor */}
                <ToolbarPlugin projectId={projectId} />

                {/* Scrollable Container for Stacked Pages */}
                <div className="relative flex-1 overflow-auto bg-muted/10 p-8 flex flex-col items-center">
                    <div className="w-full max-w-screen-xl mx-auto flex flex-col items-center pb-32">
                        {pages.map((page) => (
                            <PageEditor
                                key={page.id}
                                page={page}
                                projectId={projectId}
                                onOverflow={(json) => handlePageOverflow(page.id, json)}
                            />
                        ))}

                        {/* Empty State / Add Page Tip */}
                        {pages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                Aucune page. Utilisez l'IA ou le bouton "+" pour en créer.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar for Structure */}
            {isSidebarOpen && (
                <div className="hidden xl:block h-full animate-in slide-in-from-right duration-300">
                    <DocumentStructureSidebar
                        projectId={projectId}
                        pages={pages}
                        activePageId={pageId}
                        onPageSelect={onPageSelect}
                    />
                </div>
            )}
        </>
    )
}
Editor.displayName = "Editor"
