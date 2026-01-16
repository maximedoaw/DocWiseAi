import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Trash2, StickyNote, Hash, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useMemo } from "react"
import { PageThumbnail } from "./PageThumbnail"

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
    onSectionClick?: (key: string) => void
}

export interface Section {
    type: "h1" | "h2" | "h3"
    text: string
    key?: string
}

export function getPageSections(contentJSON: string): Section[] {
    try {
        const content = JSON.parse(contentJSON)
        const sections: Section[] = []

        if (!content.root || !content.root.children) return []

        const traverse = (node: any) => {
            if (node.type === "heading") {
                const text = node.children?.[0]?.text || ""
                if (text) {
                    // Avoid consecutive duplicates
                    const last = sections[sections.length - 1];
                    if (!last || last.text !== text || last.type !== node.tag) {
                        sections.push({
                            type: node.tag,
                            text: text,
                            key: node.key // Extract Lexical Node Key
                        })
                    }
                }
            } else if (node.children && Array.isArray(node.children)) {
                node.children.forEach(traverse)
            }
        }

        content.root.children.forEach(traverse)
        return sections
    } catch (e) {
        return []
    }
}

function getPageTitle(page: Page): string {
    // Try to find the first H1 in content
    try {
        const content = JSON.parse(page.content)
        if (content.root && content.root.children) {
            for (const node of content.root.children) {
                if (node.type === "heading" && node.tag === "h1") {
                    const text = node.children?.[0]?.text
                    if (text && text.trim().length > 0) return text
                }
            }
        }
    } catch (e) {
        // ignore
    }
    return page.title
}

export function DocumentStructureSidebar({ projectId, pages, activePageId, onPageSelect, onSectionClick }: DocumentStructureSidebarProps) {
    const addPage = useMutation(api.projects.addPage)
    const deletePage = useMutation(api.projects.deletePage)

    const handleAddPage = async () => {
        const title = "Nouvelle Page"
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
                onPageSelect(newActive.id)
            }
        }
    }

    return (
        <div className="w-full xl:w-72 border-l border-border/50 bg-muted/10 h-full flex flex-col">
            <div className="p-4 border-b border-border/50 shrink-0 bg-background/50 backdrop-blur-sm">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Pages
                </h3>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 py-4 flex flex-col gap-4 items-center">
                    {pages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            Aucune page
                        </div>
                    ) : (
                        pages.map((page, index) => (
                            <div key={page.id} className="relative group">
                                <div className="mb-1 flex items-center justify-between px-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Page {index + 1}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => handleDeletePage(page.id, e)}
                                        title="Supprimer la page"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                                <PageThumbnail
                                    content={page.content}
                                    title={getPageTitle(page)}
                                    isActive={activePageId === page.id}
                                    onClick={() => onPageSelect(page.id)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 shrink-0 bg-background/50 backdrop-blur-sm">
                <Button className="w-full gap-2 shadow-sm" size="sm" onClick={handleAddPage}>
                    <Plus className="w-4 h-4" />
                    Ajouter une page
                </Button>
            </div>
        </div>
    )
}

