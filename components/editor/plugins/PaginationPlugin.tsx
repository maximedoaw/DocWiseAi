// PaginationPlugin.tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useCallback } from "react";
import { $getRoot, $getSelection, $setSelection, $createRangeSelection, $getNodeByKey, TextNode, RangeSelection, INSERT_PARAGRAPH_COMMAND, ParagraphNode, ElementNode, $isElementNode } from "lexical";

export function PaginationPlugin({
    pageId,
    onOverflow
}: {
    pageId: string,
    onOverflow: (contentJSON: string) => void
}) {
    const [editor] = useLexicalComposerContext();
    const isProcessing = useRef(false);
    const lastOverflowTime = useRef(0);

    const checkOverflow = useCallback(() => {
        if (isProcessing.current) return;

        // Rate limit: Max 1 overflow every 500ms to allow pages to settle
        const now = Date.now();
        if (now - lastOverflowTime.current < 500) return;

        editor.getEditorState().read(() => {
            const rootElement = editor.getRootElement();
            if (!rootElement) return;

            const container = rootElement.closest('[data-page-container="true"]');
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            // Strict A4 height constraint minus margins
            const MAX_HEIGHT = containerRect.height;
            const PADDING_BOTTOM = 96; // 2.5cm
            const CUT_Y = containerRect.bottom - PADDING_BOTTOM;

            // Simple fast check first
            const rootRect = rootElement.getBoundingClientRect();
            if (rootRect.bottom <= CUT_Y) return;

            // Detailed check
            const children = rootElement.children;
            if (children.length === 0) return;

            const lastChildEl = children[children.length - 1];
            const lastChildRect = lastChildEl.getBoundingClientRect();

            if (lastChildRect.bottom > CUT_Y) {
                console.log('[PaginationPlugin] Overflow detected!', {
                    pageId,
                    lastChildBottom: lastChildRect.bottom,
                    cutY: CUT_Y
                });
                isProcessing.current = true;
                lastOverflowTime.current = Date.now();

                // Perform split/move logic
                setTimeout(() => {
                    editor.update(() => {
                        try {
                            const root = $getRoot();
                            // Re-check inside update
                            // Use DOM provided range if possible
                            let splitRange: Range | null = null;
                            const measureX = containerRect.left + 50; // A bit into the page

                            // Try to find the exact split point
                            if (document.caretRangeFromPoint) {
                                // We check AT the cut line
                                splitRange = document.caretRangeFromPoint(measureX, CUT_Y - 5);
                            }

                            if (splitRange) {
                                const selection = $createRangeSelection();
                                selection.applyDOMRange(splitRange);
                                $setSelection(selection);

                                // Split the paragraph
                                // This command splits the current block at the cursor
                                // The new part creates a new node *after* the current one.
                                // This new node should be the one moving.
                                editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
                            }

                            // Now move all Overflowing Children
                            // Not just the last one, because splitting might have created multiple push-downs?
                            // Actually, let's just move the VERY LAST one.
                            // If we split successfully, the "tail" is now the last child.

                            const updatedRoot = $getRoot();
                            const lastChild = updatedRoot.getLastChild();

                            if (lastChild && lastChild.getPreviousSibling()) {
                                // Only move if it's NOT the only child (unless huge?)
                                // If it's the only child, we can't do much without empty page loop.
                                // BUT: If we successfully split, we should have at least 2 children now.

                                const json = JSON.stringify(lastChild.exportJSON());
                                console.log('[PaginationPlugin] Moving content to next page:', {
                                    pageId,
                                    contentPreview: json.substring(0, 200) + '...'
                                });
                                lastChild.remove();
                                onOverflow(json);
                            } else if (lastChild && !lastChild.getPreviousSibling()) {
                                // Only one child and it overflows?
                                // If it's huge, we must move it (it's what we did before).
                                // But if it was just created by a split... wait.
                                // If we split a huge block, we have Top (fits) and Bottom (overflows).
                                // So we should have 2 children.

                                // If we are here, it means we FAILED to split properly or logic failed.
                                // Safest fallback: Move it anyway to avoid hidden text.
                                const json = JSON.stringify(lastChild.exportJSON());
                                lastChild.remove();
                                onOverflow(json);
                            }
                        } finally {
                            isProcessing.current = false;
                        }
                    });
                }, 50); // Small delay to let UI measure
            }
        });
    }, [editor, onOverflow]);

    // Safety: Prevent race conditions
    useEffect(() => {
        if (!editor) return;

        const checkOverflow = () => {
            if (isProcessing.current) return;
            const now = Date.now();
            if (now - lastOverflowTime.current < 500) return;

            editor.getEditorState().read(() => {
                const rootElement = editor.getRootElement();
                if (!rootElement) return;

                const container = rootElement.closest('[data-page-container="true"]');
                if (!container) return;

                const containerRect = container.getBoundingClientRect();
                const PADDING_BOTTOM = 96;
                const CUT_Y = containerRect.bottom - PADDING_BOTTOM;
                const MAX_PAGE_HEIGHT = containerRect.height;

                // Fast check
                const rootRect = rootElement.getBoundingClientRect();
                if (rootRect.bottom <= CUT_Y) return;

                const children = rootElement.children;
                if (children.length === 0) return;

                const lastChildEl = children[children.length - 1];
                const lastChildRect = lastChildEl.getBoundingClientRect();

                if (lastChildRect.bottom > CUT_Y) {
                    isProcessing.current = true;
                    lastOverflowTime.current = Date.now();

                    setTimeout(() => {
                        editor.update(() => {
                            try {
                                const root = $getRoot();
                                const containerTop = containerRect.top;

                                // Strategy:
                                // 1. Try Caret Split (Precision)
                                // 2. If fail, check if "Giant Node" (height > Page). If so, Force Split.
                                // 3. Else, Move Node.

                                let splitRange: Range | null = null;
                                const measureX = containerRect.left + 50;

                                // 1. Try Caret
                                if (document.caretRangeFromPoint) {
                                    // Try slightly above cut line to catch the line just inside
                                    splitRange = document.caretRangeFromPoint(measureX, CUT_Y - 10);
                                }

                                if (splitRange) {
                                    const selection = $createRangeSelection();
                                    selection.applyDOMRange(splitRange);
                                    $setSelection(selection);
                                    editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
                                } else {
                                    // 2. Check Giant Node
                                    // If we failed to find a split point, it might be a huge block (image, code, or dense text)
                                    // that covers the cut line but caret failed.

                                    const lastNode = root.getLastChild();

                                    // If this is the ONLY child, we MUST split it or we loop forever.
                                    // Or if it's huge (> 70% of page).
                                    if (lastNode && lastChildRect.height > MAX_PAGE_HEIGHT * 0.7) {
                                        // Force Split Logic:
                                        // We can't easily "middle split" a generic node without selection.
                                        // If it's a TextNode (inside Paragraph), we can slice text.

                                        if ($isElementNode(lastNode)) {
                                            // It is likely a paragraph or similar.
                                            // We can try to get its text content size and cut in half?
                                            // This is desperate measure.

                                            // Better: Just move it ANYWAY if it has peers.
                                            // If it has NO peers (it's the only one), we are STUCK.
                                            if (root.getChildrenSize() === 1) {
                                                console.warn("Giant node detected as only child. Cannot move without loop. User must manually fix.");
                                                // We ABORT to prevent infinite loop.
                                                // Optional: Show visual warning?
                                                return;
                                            }
                                        }
                                    }
                                }

                                // 3. Move Overflowing Children
                                // Re-get root after potential split
                                const updatedRoot = $getRoot();
                                const children = updatedRoot.getChildren();
                                const lastChild = updatedRoot.getLastChild();

                                // We move the last child if it exists.
                                // CRITICAL: Only move if we are NOT in a single-child giant node stalemate.
                                if (lastChild) {
                                    // If we just split, we definitely move the tail.
                                    // If we didn't split, we move the head IF there are other siblings previously.
                                    if (updatedRoot.getChildrenSize() > 1) {
                                        const json = JSON.stringify(lastChild.exportJSON());
                                        lastChild.remove();
                                        onOverflow(json);
                                    }
                                }
                            } finally {
                                isProcessing.current = false;
                            }
                        });
                    }, 50);
                }
            });
        };

        const unregister = editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
            checkOverflow();
        });

        const resizeObserver = new ResizeObserver(() => checkOverflow());
        const root = editor.getRootElement();
        if (root) resizeObserver.observe(root);

        return () => {
            unregister();
            resizeObserver.disconnect();
        };
    }, [editor, checkOverflow]);

    return null;
}
