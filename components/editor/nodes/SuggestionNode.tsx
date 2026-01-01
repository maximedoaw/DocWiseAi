"use client"

import {
    ElementNode,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
    createCommand,
    LexicalCommand,
    $isElementNode,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';

export type SerializedSuggestionNode = Spread<
    {
        originalText: string;
        groupId: string;
        status: 'pending' | 'accepted' | 'rejected';
    },
    SerializedElementNode
>;

// ...

export function $createSuggestionNode(
    originalText: string,
    groupId: string,
): SuggestionNode {
    return new SuggestionNode(originalText, groupId);
}

export const ACCEPT_SUGGESTION_COMMAND: LexicalCommand<NodeKey> = createCommand('ACCEPT_SUGGESTION_COMMAND');
export const REJECT_SUGGESTION_COMMAND: LexicalCommand<NodeKey> = createCommand('REJECT_SUGGESTION_COMMAND');
export const ACCEPT_SUGGESTION_GROUP_COMMAND: LexicalCommand<string> = createCommand('ACCEPT_SUGGESTION_GROUP_COMMAND');
export const REJECT_SUGGESTION_GROUP_COMMAND: LexicalCommand<string> = createCommand('REJECT_SUGGESTION_GROUP_COMMAND');

export class SuggestionNode extends ElementNode {
    __originalText: string;
    __groupId: string;
    __status: 'pending' | 'accepted' | 'rejected';

    static getType(): string {
        return 'suggestion';
    }

    static clone(node: SuggestionNode): SuggestionNode {
        return new SuggestionNode(
            node.__originalText,
            node.__groupId,
            node.__status,
            node.__key,
        );
    }

    constructor(
        originalText: string,
        groupId: string,
        status: 'pending' | 'accepted' | 'rejected' = 'pending',
        key?: NodeKey,
    ) {
        super(key);
        this.__originalText = originalText;
        this.__groupId = groupId;
        this.__status = status;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('span');
        addClassNamesToElement(element, 'suggestion-node relative bg-green-50/50 border-b-2 border-green-200 mx-1 rounded-sm px-0.5'); // Styling for the node itself
        return element;
    }

    updateDOM(prevNode: SuggestionNode, dom: HTMLElement): boolean {
        if (prevNode.__status !== this.__status) {
            // Update styles based on status if needed, but we mostly rely on CSS classes
            return true;
        }
        return false;
    }

    static importJSON(serializedNode: SerializedSuggestionNode): SuggestionNode {
        const node = $createSuggestionNode(
            serializedNode.originalText,
            serializedNode.groupId,
        );
        node.__status = serializedNode.status;
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedSuggestionNode {
        return {
            ...super.exportJSON(),
            originalText: this.__originalText,
            groupId: this.__groupId,
            status: this.__status,
            type: 'suggestion',
            version: 1,
        };
    }

    isInline(): boolean {
        return true;
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return false;
    }

    canBeEmpty(): boolean {
        return false;
    }
}

export function $isSuggestionNode(
    node: LexicalNode | null | undefined,
): node is SuggestionNode {
    return node instanceof SuggestionNode;
}
