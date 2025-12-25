import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Trash2, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface Page {
    id: string
    title: string
    content: string
}

interface DocumentStructureSidebarProps {
    projectId: Id<"projects">
    pages: Page[]
    activePageId: string | null
    onPageSelect: (id: string) => void
}

export function DocumentStructureSidebar({ projectId, pages, activePageId, onPageSelect }: DocumentStructureSidebarProps) {
    const addPage = useMutation(api.projects.addPage)
    const deletePage = useMutation(api.projects.deletePage)

    const handleAddPage = async () => {
        const title = `Page ${pages.length + 1}`
        const newPageId = await addPage({ projectId, title })
        if (newPageId) {
            onPageSelect(newPageId)
        }
    }

    const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (pages.length <= 1) {
            alert("Vous devez avoir au moins une page.")
            return
        }
        if (confirm("Supprimer cette page ?")) {
            await deletePage({ projectId, pageId })
            if (activePageId === pageId) {
                // Select previous or first page
                const index = pages.findIndex(p => p.id === pageId)
                const newIndex = Math.max(0, index - 1)
                const newActive = pages.find((_, i) => i === newIndex) || pages[0]
                onPageSelect(newActive.id) // Fallback might fail if length was 1 before but we checked
            }
        }
    }

    return (
        <div className="w-full xl:w-64 border-l border-border/50 bg-background/95 h-full flex flex-col">
            <div className="p-4 border-b border-border/50 shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Pages du document
                </h3>
            </div>

            <ScrollArea className="flex-1 p-2 min-h-0">
                <div className="space-y-1">
                    {pages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            Aucune page
                        </div>
                    ) : (
                        pages.map((page, index) => (
                            <div
                                key={page.id}
                                onClick={() => onPageSelect(page.id)}
                                className={cn(
                                    "group flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-colors border border-transparent",
                                    activePageId === page.id
                                        ? "bg-primary/10 border-primary/20 text-primary"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                    <StickyNote className="w-4 h-4 shrink-0 opacity-70" />
                                    <span className="truncate font-medium">
                                        {page.title || `Page ${index + 1}`}
                                    </span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => handleDeletePage(page.id, e)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 shrink-0">
                <Button className="w-full gap-2" size="sm" onClick={handleAddPage}>
                    <Plus className="w-4 h-4" />
                    Ajouter une page
                </Button>
            </div>
        </div>
    )
}
