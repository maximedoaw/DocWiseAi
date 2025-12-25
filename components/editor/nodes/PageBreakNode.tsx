import {
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
} from 'lexical';
import { ReactNode } from 'react';
import * as React from 'react';

export interface SerializedPageBreakNode extends SerializedLexicalNode {
    type: 'page-break';
    version: 1;
}

export class PageBreakNode extends DecoratorNode<ReactNode> {
    static getType(): string {
        return 'page-break';
    }

    static clone(node: PageBreakNode): PageBreakNode {
        return new PageBreakNode(node.__key);
    }

    static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
        return $createPageBreakNode();
    }

    exportJSON(): SerializedPageBreakNode {
        return {
            type: 'page-break',
            version: 1,
        };
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'page-break-node';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    decorate(): ReactNode {
        return <div className="page-break-component w-full h-8 bg-muted/20 my-8 relative flex items-center justify-center border-t border-b border-dashed border-muted-foreground/30 select-none print:break-after-page"><span className="text-xs text-muted-foreground font-mono">--- Page Break ---</span></div>;
    }
}

export function $createPageBreakNode(): PageBreakNode {
    return new PageBreakNode();
}

export function $isPageBreakNode(node: LexicalNode | null | undefined): node is PageBreakNode {
    return node instanceof PageBreakNode;
}
