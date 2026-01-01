"use client"

import { $createTextNode, $getRoot, LexicalEditor, $createParagraphNode } from "lexical";
import * as Diff from "diff";
import { $createSuggestionNode } from "@/components/editor/nodes/SuggestionNode";

/**
 * Compares old and new text, and inserts nodes into the current paragraph/selection.
 */
export function $applyDiffAsSuggestions(oldText: string, newText: string) {
    const diff = Diff.diffWords(oldText, newText);
    const nodes = [];
    const groupId = Math.random().toString(36).substring(2, 15);

    let i = 0;
    while (i < diff.length) {
        const part = diff[i];

        if (part.removed) {
            // Check if next is added (Replacement)
            if (i + 1 < diff.length && diff[i+1].added) {
                const addedPart = diff[i+1];
                // Replacement: Node stores original text for restore.
                // Children are the NEW text.
                const node = $createSuggestionNode(part.value, groupId);
                const children = parseMarkdownToNodes(addedPart.value);
                node.append(...children);
                nodes.push(node);
                i += 2; // Skip next
            } else {
                // Deletion: Node stores original text.
                const node = $createSuggestionNode(part.value, groupId);
                const textNode = $createTextNode(part.value);
                textNode.setFormat('strikethrough'); 
                node.append(textNode);
                nodes.push(node);
                i++;
            }
        } else if (part.added) {
            // Addition: No original text.
            const node = $createSuggestionNode("", groupId); 
            const children = parseMarkdownToNodes(part.value); 
            node.append(...children);
            nodes.push(node);
            i++;
        } else {
            // Unchanged
            nodes.push($createTextNode(part.value));
            i++;
        }
    }

    return nodes;
}

// Helper to parse markdown (bold/italic/underline)
function parseMarkdownToNodes(text: string) {
    const nodes = [];
    let currentIndex = 0;
    const regex = /(\*\*|__)(.*?)\1|(_|\*)(.*?)\3|(<u>)(.*?)(<\/u>)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            nodes.push($createTextNode(text.slice(currentIndex, match.index)));
        }

        let formattedTextNode;
        if (match[2]) { // Bold
             formattedTextNode = $createTextNode(match[2]);
             formattedTextNode.setFormat('bold');
        } else if (match[4]) { // Italic
             formattedTextNode = $createTextNode(match[4]);
             formattedTextNode.setFormat('italic');
        } else if (match[6]) { // Underline
             formattedTextNode = $createTextNode(match[6]);
             formattedTextNode.setFormat('underline');
        }
        
        if (formattedTextNode) nodes.push(formattedTextNode);
        currentIndex = regex.lastIndex;
    }

    if (currentIndex < text.length) {
        nodes.push($createTextNode(text.slice(currentIndex)));
    }
    
    if (nodes.length === 0) nodes.push($createTextNode(text));
    
    return nodes;
}
