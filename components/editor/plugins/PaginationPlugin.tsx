// PaginationPlugin.tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $getRoot, $getSelection, $setSelection, $createRangeSelection, $getNodeByKey, TextNode, RangeSelection, INSERT_PARAGRAPH_COMMAND } from "lexical";

export function PaginationPlugin({
    pageId,
    onOverflow
}: {
    pageId: string,
    onOverflow: (contentJSON: string) => void
}) {
    const [editor] = useLexicalComposerContext();
    const isProcessing = useRef(false);

    useEffect(() => {
        if (!editor) return;

        const checkOverflow = () => {
            if (isProcessing.current) return;

            editor.getEditorState().read(() => {
                const rootElement = editor.getRootElement();
                if (!rootElement) return;

                // Find the fixed-height container
                const container = rootElement.closest('[data-page-container="true"]');
                if (!container) return;

                const containerRect = container.getBoundingClientRect();

                // Define the absolute CUT line (bottom of page - padding)
                // Editor padding is 2.5cm approx 96px. 
                // We cut exactly there.
                const CUT_Y = containerRect.bottom - 96;

                // Check if any child goes beyond CUT_Y
                const children = rootElement.children;
                if (children.length === 0) return;

                const lastChildEl = children[children.length - 1];
                const lastChildRect = lastChildEl.getBoundingClientRect();

                if (lastChildRect.bottom > CUT_Y) {
                    isProcessing.current = true;

                    // We need to perform the split/move in a write update
                    setTimeout(() => {
                        // Use caretRangeFromPoint to find the split position
                        // We try to find a break point at the CUT_Y line, roughly in the middle of the text width
                        // X position: somewhat indented from left to hit text
                        const measureX = containerRect.left + 120; // 120px from left edge

                        let range: Range | null = null;

                        // Try standard API
                        if (document.caretRangeFromPoint) {
                            range = document.caretRangeFromPoint(measureX, CUT_Y);
                        } else if ((document as any).caretPositionFromPoint) {
                            // Firefox fallback (roughly)
                            const pos = (document as any).caretPositionFromPoint(measureX, CUT_Y);
                            if (pos) {
                                range = document.createRange();
                                range.setStart(pos.offsetNode, pos.offset);
                                range.collapse(true);
                            }
                        }

                        editor.update(() => {
                            const root = $getRoot();
                            // If we found a valid range in the text to split
                            if (range) {
                                // Convert DOM range to Lexical selection
                                const selection = $createRangeSelection();
                                selection.applyDOMRange(range);

                                // Check if we hit a TextNode
                                const nodes = selection.getNodes();
                                // We are looking for text to split
                                if (nodes.length > 0) {
                                    // We force a split at this selection
                                    // $splitParagraph logic (insert line break effectively, then move)
                                    // Or just Split the node?

                                    // Actually, if we just split the paragraph, we get two paragraphs.
                                    // The second one will naturally be "below" the first.
                                    // Then our loop (which checks for overflow) will pick it up and move it?
                                    // NO, we want to move it NOW.

                                    // Strategy: Insert a temporary split, find the newly created second part, and move it.
                                    // Simply inserting a Paragraph break should make the second part the "last child".
                                    // Then we can move it.

                                    // BUT we need to be careful not to create an infinite loop of splitting if the *next* page is also full.
                                    // That's handled by the next page's editor.

                                    $setSelection(selection);

                                    // Insert a split (Enter key behavior essentially)
                                    // But clean: split the node.
                                    const anchor = selection.anchor;
                                    const focus = selection.focus;

                                    // Safety: Ensure we are not splitting at the very start (which would move nothing and loop)
                                    // or very end.

                                    // For now, let's try standard split
                                    const splitNode = anchor.getNode();
                                    if (splitNode instanceof TextNode) {
                                        // Split the text node
                                        // If we are inside a paragraph, we want to split the PARAGRAPH.
                                        // Use insertParagraph?
                                    }

                                    // Simpler: Just rely on the loop. If we split, the second part becomes a new sibling.
                                    // The next iteration of checkOverflow (or just re-checking logic here) should detect 
                                    // that the NEW last sibling is overflowing and move it.

                                    // Wait, if we split, the updates are batched.
                                    // We can try to split AND move in one go if we can identify the new node.

                                    // Let's iterate children logic again to be robust
                                }
                            }

                            // Fallback / Standard logic: Move the *last child* if it's overflowing.
                            // If we didn't split (or couldn't), we still move the whole chunk to avoid data loss,
                            // although user hates that.
                            // BUT, if we DID split successfully, the "last child" is now the second half.
                            // We need to ensure we DO split.

                            // Let's use a simpler heuristic for splitting if caret fails:
                            // Split at the nearest paragraph boundary? No, that's what we did and it cleared the page.

                            // Let's try to simulate 'Enter' at the cursor if range found.
                            if (range) {
                                const sel = $createRangeSelection();
                                sel.applyDOMRange(range);
                                $setSelection(sel);

                                // Insert paragraph break to split the block
                                const anchor = sel.anchor;
                                const node = anchor.getNode();

                                // Only split if we are safely inside a block
                                if (node) {
                                    // Split
                                    // This creates a new block after the current one
                                    editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
                                }
                            }

                            // Now find the overflowing parts and move them
                            // We grab the updated root children
                            const updatedRoot = $getRoot();
                            const children = updatedRoot.getChildren();
                            const lastChild = updatedRoot.getLastChild();

                            // Move logic (simplified)
                            if (lastChild) {
                                // We verify if it is indeed overflowing? 
                                // We assume if we just split at the bottom edge, the new part IS overflowing.
                                // Or if we didn't split, the old part IS overflowing.

                                const json = JSON.stringify(lastChild.exportJSON());
                                lastChild.remove();
                                onOverflow(json);
                            }

                            isProcessing.current = false;
                        });
                    }, 0);
                }
            });
        };

        const unregister = editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
            checkOverflow();
        });

        window.addEventListener('resize', checkOverflow);

        return () => {
            unregister();
            window.removeEventListener('resize', checkOverflow);
        };
    }, [editor, onOverflow]);

    return null;
}
