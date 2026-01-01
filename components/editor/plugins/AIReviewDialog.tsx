"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as Diff from "diff"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface AIReviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    originalContent: string
    newContent: string
    onConfirm: () => void
    onReject: () => void
    isProcessing?: boolean
}

export function AIReviewDialog({
    open,
    onOpenChange,
    originalContent,
    newContent,
    onConfirm,
    onReject,
    isProcessing
}: AIReviewDialogProps) {
    const diff = useMemo(() => {
        if (!originalContent || !newContent) return []
        // Use word diff for better readability in reports
        return Diff.diffWords(originalContent, newContent)
    }, [originalContent, newContent])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Révision des modifications IA</DialogTitle>
                    <DialogDescription>
                        Vert = Ajouté | Rouge = Supprimé. Veuillez valider les changements.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 border rounded-md bg-muted/20 p-4">
                    <ScrollArea className="h-full pr-4">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {diff.map((part: Diff.Change, index: number) => {
                                const color = part.added
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : part.removed
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 line-through decoration-red-500/50"
                                        : "text-foreground opacity-80"

                                return (
                                    <span key={index} className={cn("px-0.5 rounded-sm transition-colors", color)}>
                                        {part.value}
                                    </span>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onReject} disabled={isProcessing}>
                        Rejeter
                    </Button>
                    <Button onClick={onConfirm} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white">
                        {isProcessing ? "Application..." : "Valider les modifications"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
