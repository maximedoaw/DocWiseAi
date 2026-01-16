
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { PageBreakNode } from "@/components/editor/nodes/PageBreakNode";
import { BannerNode } from "@/components/editor/nodes/BannerNode";
import { SimpleImageNode } from "@/components/editor/nodes/SimpleImageNode";
import { SuggestionNode } from "@/components/editor/nodes/SuggestionNode";
import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot } from "lexical";

const theme = {
    ltr: "ltr",
    rtl: "rtl",
    paragraph: "editor-paragraph mb-2 text-[10px] leading-snug", // Sized for thumbnail
    heading: {
        h1: "editor-heading-h1 text-lg font-bold mt-2 mb-1",
        h2: "editor-heading-h2 text-base font-semibold mt-2 mb-1",
        h3: "editor-heading-h3 text-sm font-semibold mt-1",
    },
    list: {
        ol: "list-decimal list-inside ml-2",
        ul: "list-disc list-inside ml-2",
    },
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
    }
}

function ThumbnailContentPlugin({ content, onContentHeightChange }: { content: string, onContentHeightChange?: (height: number) => void }) {
    const [editor] = useLexicalComposerContext();
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (!content || content === "{}") {
            if (isFirstMount.current) {
                editor.update(() => {
                    const root = $getRoot();
                    root.clear();
                    root.append($createParagraphNode());
                });
            }
            return;
        }

        try {
            const editorState = editor.parseEditorState(content);
            editor.setEditorState(editorState);
        } catch (e) {
            // console.error("Thumbnail update error", e);
        }
        isFirstMount.current = false;
    }, [editor, content]);

    // Measure content height after render
    useEffect(() => {
        const measureHeight = () => {
            const rootElement = editor.getRootElement();
            if (rootElement && onContentHeightChange) {
                // Use scrollHeight to get the actual content height (includes padding)
                const height = rootElement.scrollHeight;
                onContentHeightChange(height);
            }
        };

        // Measure after editor updates
        const unregister = editor.registerUpdateListener(() => {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                setTimeout(measureHeight, 10);
            });
        });

        // Also measure on mount
        const timeout = setTimeout(measureHeight, 100);
        
        return () => {
            unregister();
            clearTimeout(timeout);
        };
    }, [editor, content, onContentHeightChange]);

    return null;
}

export function PageThumbnail({ content, title, onClick, isActive }: { content: string, title: string, onClick?: () => void, isActive: boolean }) {
    const [contentHeight, setContentHeight] = useState(1123); // Default to A4 height
    const initialConfig = {
        namespace: `Thumbnail-${title}`,
        theme,
        onError: () => { },
        editable: false,
        nodes: [
            HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode,
            TableNode, TableCellNode, TableRowNode, AutoLinkNode, LinkNode,
            PageBreakNode, BannerNode, SimpleImageNode, SuggestionNode
        ]
    };

    // A4 dimensions in pixels at 96 DPI: 794px x 1123px
    // Target width in sidebar: 80px (w-20, reduced from w-28)
    const thumbnailWidth = 80; // Reduced from 112px
    const thumbnailHeight = thumbnailWidth * (29.7 / 21); // A4 aspect ratio: ~113px
    
    // Calculate scale to fit content
    const maxContentHeight = 1123; // A4 height
    const actualContentHeight = Math.max(contentHeight, 200); // Minimum for empty pages
    
    // Base scale from width
    const widthScale = thumbnailWidth / 794; // ~0.101
    
    // If content exceeds A4 height, adjust scale to fit in thumbnail height
    let scale = widthScale;
    if (actualContentHeight > maxContentHeight) {
        // Calculate what the scaled height would be
        const scaledHeight = actualContentHeight * widthScale;
        // Adjust scale to fit in thumbnail height
        scale = thumbnailHeight / actualContentHeight;
    }

    return (
        <div
            onClick={onClick}
            className={`
                group relative w-20 mx-auto bg-white rounded-md shadow-sm border
                transition-all duration-200 cursor-pointer overflow-hidden
                ${isActive ? 'ring-2 ring-primary border-primary shadow-md scale-[1.02]' : 'hover:border-primary/50 hover:shadow-md'}
            `}
            style={{
                height: `${thumbnailHeight}px`
            }}
        >
            <div className="absolute inset-0 overflow-hidden bg-white">
                <div
                    style={{
                        width: '794px',
                        height: `${actualContentHeight}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0'
                    }}
                    className="pointer-events-none p-[2.5cm]"
                >
                    <LexicalComposer initialConfig={initialConfig}>
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="outline-none w-full h-full prose prose-stone dark:prose-invert max-w-full whitespace-pre-wrap" />}
                            placeholder={null}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <ThumbnailContentPlugin content={content} onContentHeightChange={setContentHeight} />
                        <ListPlugin />
                        <TablePlugin />
                        <LinkPlugin />
                    </LexicalComposer>
                </div>
            </div>

            {/* Overlay for interaction */}
            <div className={`absolute inset-0 transition-colors ${isActive ? 'bg-primary/5' : 'group-hover:bg-black/5'}`} />

            {/* Title Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-1.5">
                <p className={`text-[10px] truncate text-center ${isActive ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                    {title}
                </p>
            </div>
        </div>
    );
}
