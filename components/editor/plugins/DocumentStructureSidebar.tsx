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
        const title = `Nouvelle Page`
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
        <div className="w-full xl:w-64 border-l border-border/50 bg-background/95 h-full flex flex-col">
            <div className="p-4 border-b border-border/50 shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Structure du document
                </h3>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2">
                    {pages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            Aucune page
                        </div>
                    ) : (
                        <Accordion
                            type="single"
                            collapsible
                            value={activePageId || undefined}
                            onValueChange={(val) => {
                                if (val) onPageSelect(val)
                            }}
                            className="space-y-1"
                        >
                            {pages.map((page, index) => {
                                const realTitle = getPageTitle(page)
                                const sections = getPageSections(page.content)

                                return (
                                    <AccordionItem
                                        key={page.id}
                                        value={page.id}
                                        className="border rounded-md px-0 data-[state=open]:bg-muted/30"
                                    >
                                        <div className="flex items-center group px-2 hover:bg-muted/50 transition-colors rounded-t-md">
                                            <AccordionTrigger
                                                onClick={() => onPageSelect(page.id)}
                                                className="flex-1 hover:no-underline py-2 text-sm font-medium pr-2"
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                                        {index + 1}
                                                    </span>
                                                    {realTitle !== "Nouvelle Page" && (
                                                        <span className="truncate">{realTitle}</span>
                                                    )}
                                                </span>
                                            </AccordionTrigger>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive ml-1"
                                                onClick={(e) => handleDeletePage(page.id, e)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <AccordionContent className="px-2 pb-2">
                                            {sections.length > 0 ? (
                                                <div className="flex flex-col gap-1 pl-6 pt-1 pr-2">
                                                    {sections.map((section, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onSectionClick) {
                                                                    // Pass section info for flexible matching
                                                                    onSectionClick(JSON.stringify({ key: section.key, text: section.text, type: section.type }));
                                                                }
                                                            }}
                                                            className={cn(
                                                                "text-xs text-muted-foreground py-1 flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors group/item min-w-0",
                                                                section.type === "h1" && "hidden", // H1 is already the title
                                                                section.type === "h2" && "pl-0 font-medium text-foreground/80",
                                                                section.type === "h3" && "pl-3"
                                                            )}
                                                        >
                                                            <Hash className="w-3 h-3 opacity-50 shrink-0 group-hover/item:text-primary" />
                                                            <span className={cn(
                                                                "flex-1 min-w-0 pr-2 truncate",
                                                                section.type === "h2" ? "font-medium text-sm" : "text-muted-foreground ml-2 text-sm"
                                                            )} title={section.text}>
                                                                {section.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-muted-foreground pl-8 italic pt-1">
                                                    Aucune section
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
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

