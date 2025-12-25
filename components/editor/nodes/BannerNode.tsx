
import {
    $createParagraphNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    ParagraphNode,
    RangeSelection,
    SerializedElementNode,
    Spread,
} from 'lexical';
import { ReactNode } from 'react';
import { addClassNamesToElement } from '@lexical/utils';

export type BannerType = 'info' | 'warning' | 'error' | 'success';

export interface SerializedBannerNode extends SerializedElementNode {
    bannerType: BannerType;
    type: 'banner';
    version: 1;
}

export class BannerNode extends ElementNode {
    __bannerType: BannerType;

    constructor(bannerType: BannerType, key?: NodeKey) {
        super(key);
        this.__bannerType = bannerType;
    }

    static getType(): string {
        return 'banner';
    }

    static clone(node: BannerNode): BannerNode {
        return new BannerNode(node.__bannerType, node.__key);
    }

    static importJSON(serializedNode: SerializedBannerNode): BannerNode {
        const node = $createBannerNode(serializedNode.bannerType);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedBannerNode {
        return {
            ...super.exportJSON(),
            bannerType: this.__bannerType,
            type: 'banner',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('div');
        const className = config.theme.banner;
        if (className) {
            addClassNamesToElement(element, className);
        }

        // Add specific class for banner type
        element.className = `editor-banner editor-banner-${this.__bannerType} flex rounded-md p-4 my-4 border-l-4`;

        // Set specific styles based on type (using Tailwind classes conceptually, but applied via className)
        switch (this.__bannerType) {
            case 'info':
                element.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-900');
                break;
            case 'warning':
                element.classList.add('bg-yellow-50', 'border-yellow-500', 'text-yellow-900');
                break;
            case 'error':
                element.classList.add('bg-red-50', 'border-red-500', 'text-red-900');
                break;
            case 'success':
                element.classList.add('bg-green-50', 'border-green-500', 'text-green-900');
                break;
        }

        return element;
    }

    updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
        if (prevNode.__bannerType !== this.__bannerType) {
            // Simple way: re-create DOM if type changes, or just update classes here
            dom.className = `editor-banner editor-banner-${this.__bannerType} flex rounded-md p-4 my-4 border-l-4`;
            switch (this.__bannerType) {
                case 'info':
                    dom.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-900');
                    break;
                case 'warning':
                    dom.classList.add('bg-yellow-50', 'border-yellow-500', 'text-yellow-900');
                    break;
                case 'error':
                    dom.classList.add('bg-red-50', 'border-red-500', 'text-red-900');
                    break;
                case 'success':
                    dom.classList.add('bg-green-50', 'border-green-500', 'text-green-900');
                    break;
            }
        }
        return false;
    }

    getBannerType(): BannerType {
        return this.__bannerType;
    }

    setBannerType(bannerType: BannerType): void {
        const writable = this.getWritable();
        writable.__bannerType = bannerType;
    }

    insertNewAfter(_: RangeSelection, restoreSelection?: boolean): ParagraphNode {
        const newBlock = $createParagraphNode();
        const direction = this.getDirection();
        newBlock.setDirection(direction);
        this.insertAfter(newBlock, restoreSelection);
        return newBlock;
    }

    collapseAtStart(): true {
        const newBlock = $createParagraphNode();
        const children = this.getChildren();
        children.forEach((child) => newBlock.append(child));
        this.replace(newBlock);
        return true;
    }
}

export function $createBannerNode(bannerType: BannerType = 'info'): BannerNode {
    return new BannerNode(bannerType);
}

export function $isBannerNode(node: LexicalNode | null | undefined): node is BannerNode {
    return node instanceof BannerNode;
}
