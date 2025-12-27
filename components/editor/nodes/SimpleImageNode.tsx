
import {
    $createParagraphNode,
    $createNodeSelection,
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface SerializedSimpleImageNode extends SerializedLexicalNode {
    altText: string;
    height?: number;
    maxWidth?: number;
    src: string;
    width?: number;
    type: 'simple-image';
    version: 1;
}

// React Component to render the image
function ImageComponent({
    src,
    altText,
    nodeKey,
    width,
    height,
    maxWidth,
    resizable
}: {
    src: string;
    altText: string;
    nodeKey: NodeKey;
    width: number | "inherit";
    height: number | "inherit";
    maxWidth: number | "inherit";
    resizable: boolean;
}) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const resizingRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    const isConvexStorage = src.startsWith("convex:");
    const storageId = isConvexStorage ? src.replace("convex:", "") : null;

    // @ts-ignore
    const storageUrl = useQuery(api.files.getUrl, storageId ? { storageId } : "skip");

    const displaySrc = isConvexStorage ? (storageUrl || "") : src;

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if ($isSimpleImageNode(node)) {
                    node.remove();
                }
                return true;
            }
            return false;
        },
        [isSelected, nodeKey]
    );

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (payload: MouseEvent) => {
                    const event = payload;
                    if (event.target === imageRef.current) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection();
                            setSelected(true);
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, isSelected, setSelected, clearSelection]);

    const handlePointerDown = (event: React.PointerEvent) => {
        if (!resizable || !isSelected) return;
        event.preventDefault();
        setIsResizing(true);
        const img = imageRef.current;
        if (img) {
            const { width, height } = img.getBoundingClientRect();
            resizingRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                startWidth: width,
                startHeight: height
            };
            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
        }
    };

    const handlePointerMove = (event: PointerEvent) => {
        if (!resizingRef.current) return;
        const { startX, startWidth } = resizingRef.current;
        const diffX = event.clientX - startX;
        const newWidth = Math.max(100, startWidth + diffX);

        if (imageRef.current) {
            imageRef.current.style.width = `${newWidth}px`;
            imageRef.current.style.height = "auto";
        }
    };

    const handlePointerUp = (event: PointerEvent) => {
        if (!resizingRef.current) return;
        const { startX, startWidth } = resizingRef.current;
        const diffX = event.clientX - startX;
        const newWidth = Math.max(100, startWidth + diffX);

        setIsResizing(false);
        resizingRef.current = null;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isSimpleImageNode(node)) {
                node.setWidthAndHeight(newWidth, "inherit");
            }
        });
    };

    return (
        <div className={`relative inline-block ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <img
                ref={imageRef}
                src={displaySrc}
                alt={altText}
                style={{
                    width: width === "inherit" ? "100%" : width,
                    height: "auto", // Always maintain aspect ratio for now
                    maxWidth: maxWidth === "inherit" ? "100%" : maxWidth,
                }}
                className="rounded-md max-w-full h-auto cursor-pointer"
                draggable="false"
            />
            {isSelected && resizable && (
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize rounded-full border-2 border-white shadow-sm transform translate-x-1/2 translate-y-1/2 z-10"
                    onPointerDown={handlePointerDown}
                />
            )}
        </div>
    );
}

export class SimpleImageNode extends DecoratorNode<React.ReactNode> {
    __src: string;
    __altText: string;
    __width: number | "inherit";
    __height: number | "inherit";
    __maxWidth: number | "inherit";

    static getType(): string {
        return 'simple-image';
    }

    static clone(node: SimpleImageNode): SimpleImageNode {
        return new SimpleImageNode(
            node.__src,
            node.__altText,
            node.__width,
            node.__height,
            node.__maxWidth,
            node.__key,
        );
    }

    static importJSON(serializedNode: SerializedSimpleImageNode): SimpleImageNode {
        const { altText, height, width, maxWidth, src } = serializedNode;
        const node = $createSimpleImageNode({
            altText,
            height: height || "inherit",
            maxWidth: maxWidth || "inherit",
            src,
            width: width || "inherit",
        });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        return { element };
    }

    constructor(
        src: string,
        altText: string,
        width?: number | "inherit",
        height?: number | "inherit",
        maxWidth?: number | "inherit",
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width || "inherit";
        this.__height = height || "inherit";
        this.__maxWidth = maxWidth || "inherit";
    }

    exportJSON(): SerializedSimpleImageNode {
        return {
            altText: this.__altText,
            height: this.__height === "inherit" ? 0 : this.__height,
            maxWidth: this.__maxWidth === "inherit" ? 0 : this.__maxWidth,
            src: this.__src,
            type: 'simple-image',
            version: 1,
            width: this.__width === "inherit" ? 0 : this.__width,
        };
    }

    setWidthAndHeight(width: number | "inherit", height: number | "inherit"): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    // View
    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): boolean {
        return false;
    }

    decorate(): React.ReactNode {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                width={this.__width}
                height={this.__height}
                maxWidth={this.__maxWidth}
                nodeKey={this.getKey()}
                resizable={true}
            />
        );
    }
}

export function $createSimpleImageNode({
    altText,
    height,
    maxWidth,
    src,
    width,
}: {
    altText: string;
    height?: number | "inherit";
    maxWidth?: number | "inherit";
    src: string;
    width?: number | "inherit";
}): SimpleImageNode {
    return new SimpleImageNode(src, altText, width, height, maxWidth);
}

export function $isSimpleImageNode(
    node: LexicalNode | null | undefined,
): node is SimpleImageNode {
    return node instanceof SimpleImageNode;
}
