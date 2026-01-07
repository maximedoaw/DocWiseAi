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
        const element = document.createElement('div');
        addClassNamesToElement(element, 'suggestion-node-container my-4 border-2 border-dashed border-green-200 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm');

        // 1. Original Content Header (The "Diff" part)
        if (this.__originalText) {
            const originalDiv = document.createElement('div');
            originalDiv.className = 'suggestion-original-content bg-red-50/80 dark:bg-red-950/30 p-4 border-b border-red-100 dark:border-red-900/50';

            const badge = document.createElement('span');
            badge.className = 'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 mb-2';
            badge.textContent = 'Original (Supprimé)';
            originalDiv.appendChild(badge);

            const content = document.createElement('div');
            content.className = 'text-sm text-red-600 dark:text-red-400 line-through font-mono whitespace-pre-wrap leading-relaxed opacity-70';
            content.textContent = this.__originalText;
            originalDiv.appendChild(content);

            element.appendChild(originalDiv);
        }

        // 2. Suggestion Container Label
        const suggestionHeader = document.createElement('div');
        suggestionHeader.className = 'suggestion-header bg-green-50/50 dark:bg-green-950/20 px-4 py-2 border-b border-green-100 dark:border-green-900/50 flex items-center justify-between';

        const badge = document.createElement('span');
        badge.className = 'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        badge.textContent = 'Suggestion IA';
        suggestionHeader.appendChild(badge);

        element.appendChild(suggestionHeader);

        // 3. This is where Lexical appends children. 
        // We'll add a class to distinguish the suggested area.
        addClassNamesToElement(element, 'suggestion-content-area p-4 bg-green-50/20 dark:bg-green-900/10');

        return element;
    }

    updateDOM(prevNode: SuggestionNode, dom: HTMLElement): boolean {
        // Return true if status changed to trigger a re-render if needed
        return prevNode.__status !== this.__status || prevNode.__originalText !== this.__originalText;
    }

    static importJSON(serializedNode: SerializedSuggestionNode): SuggestionNode {
        const node = $createSuggestionNode(
            serializedNode.originalText,
            serializedNode.groupId,
        );
        node.__status = serializedNode.status;
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

    // Since it's a block-level diff, we treat it as an element
    isInline(): boolean {
        return false;
    }
}

export function $isSuggestionNode(
    node: LexicalNode | null | undefined,
): node is SuggestionNode {
    return node instanceof SuggestionNode;
}
