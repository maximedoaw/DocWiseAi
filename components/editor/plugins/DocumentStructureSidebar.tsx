
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Trash2, StickyNote, Hash, ChevronRight, MoreVertical, CheckSquare, X } from "lucide-react"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useMemo, useState, useEffect } from "react"
import { PageThumbnail } from "./PageThumbnail"
import { DeletePagesDialog } from "../dialogs/DeletePagesDialog"

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

export function getPageSections(htmlContent: string): Section[] {
    if (typeof window === 'undefined') return [] // Guard for SSR
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')
        const headings = doc.querySelectorAll('h1, h2, h3')
        return Array.from(headings).map((h, index) => ({
            type: h.tagName.toLowerCase() as "h1" | "h2" | "h3",
            text: h.textContent || "",
            key: `section-${index}-${h.textContent?.slice(0, 10)}`
        }))
    } catch (e) {
        console.error("Error parsing sections", e)
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

    const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selection mode is implicit: if checks are visible or if user explicitly triggered it.
    // Let's make it explicit or derived from selection size?
    // User asked: "si il selectionne il pourra alors en selectionner d'autres".
    // Let's say if selection > 0, we show checkboxes everywhere.
    // OR we have a dedicated state 'isSelectionMode'.
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Auto-scroll to active page
    // Auto-scroll to active page - DISABLED by user request
    // useEffect(() => {
    //     if (activePageId) {
    //         const el = document.getElementById(`thumbnail-${activePageId}`);
    //         if (el) {
    //             el.scrollIntoView({ behavior: "smooth", block: "center" });
    //         }
    //     }
    // }, [activePageId]);

    const toggleSelection = (pageId: string) => {
        const newSelected = new Set(selectedPageIds);
        if (newSelected.has(pageId)) {
            newSelected.delete(pageId);
        } else {
            newSelected.add(pageId);
        }
        setSelectedPageIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedPageIds.size === pages.length) {
            setSelectedPageIds(new Set());
        } else {
            setSelectedPageIds(new Set(pages.map(p => p.id)));
        }
    };

    const handlePageClick = (pageId: string, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const newSelected = new Set(selectedPageIds);
            if (newSelected.has(pageId)) {
                newSelected.delete(pageId);
            } else {
                newSelected.add(pageId);
            }
            setSelectedPageIds(newSelected);
        } else {
            if (selectedPageIds.size > 0) {
                setSelectedPageIds(new Set());
            }
            onPageSelect(pageId);

            // Explicitly scroll the editor to this page
            const el = document.getElementById(`page-${pageId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    const enterSelectionMode = (initialPageId?: string) => {
        setIsSelectionMode(true);
        if (initialPageId) {
            setSelectedPageIds(new Set([initialPageId]));
        }
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedPageIds(new Set());
    };

    const handleConfirmDelete = async () => {
        const idsToDelete = Array.from(selectedPageIds);
        setIsDeleteDialogOpen(false);
        // Optimistic clear
        exitSelectionMode();

        await Promise.all(idsToDelete.map(id => deletePage({ projectId, pageId: id })));
    };

    const handleDeletePage = async (pageId: string) => {
        // Direct single delete from menu
        setSelectedPageIds(new Set([pageId]));
        setIsDeleteDialogOpen(true);
    };

    const handleAddPage = async () => {
        const title = "Nouvelle Page"
        const newPageId = await addPage({ projectId, title })
        if (newPageId) {
            onPageSelect(newPageId)
            // Scroll editor to end when adding page
            setTimeout(() => {
                const el = document.getElementById(`page-${newPageId}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);
        }
    }

    return (
        <div className="w-full xl:w-72 border-l border-border/50 bg-muted/10 h-full flex flex-col">
            <div className="h-14 px-4 border-b border-border/50 shrink-0 bg-background/50 backdrop-blur-sm flex items-center justify-between transition-all duration-200">
                {!isSelectionMode ? (
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Pages
                    </h3>
                ) : (
                    <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={exitSelectionMode}
                                className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
                                title="Annuler la sélection"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium">
                                {selectedPageIds.size}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                                {selectedPageIds.size === pages.length ? "Tout désélectionner" : "Tout sélectionner"}
                            </Button>

                            {selectedPageIds.size > 0 && (
                                <div className="h-4 w-px bg-border/50 mx-1" />
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 text-muted-foreground transition-all",
                                    selectedPageIds.size > 0
                                        ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        : "opacity-50 pointer-events-none"
                                )}
                                onClick={() => selectedPageIds.size > 0 && setIsDeleteDialogOpen(true)}
                                title="Supprimer la sélection"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Removed the separate Action Bar, integrated above for cleaner UI */}

            <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 py-4 flex flex-col gap-4 items-center">
                    {pages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            Aucune page
                        </div>
                    ) : (
                        pages.map((page, index) => {
                            const isSelected = selectedPageIds.has(page.id);

                            return (
                                <div
                                    key={page.id}
                                    id={`thumbnail-${page.id}`}
                                    className="relative group w-full flex flex-col items-center"
                                >
                                    <div className="w-full max-w-[140px] mb-1 flex items-center justify-between px-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Page {index + 1}
                                        </span>

                                        {/* Kebab Menu or Checkbox */}
                                        {isSelectionMode ? (
                                            <div
                                                className="cursor-pointer p-1"
                                                onClick={() => toggleSelection(page.id)}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/50 bg-background"
                                                )}>
                                                    {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => enterSelectionMode(page.id)}>
                                                        <CheckSquare className="w-4 h-4 mr-2" />
                                                        Sélectionner
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeletePage(page.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <PageThumbnail
                                            content={page.content}
                                            title={getPageTitle(page)}
                                            isActive={activePageId === page.id}
                                            onClick={() => {
                                                if (isSelectionMode) {
                                                    toggleSelection(page.id);
                                                } else {
                                                    onPageSelect(page.id);
                                                }
                                            }}
                                        />

                                        {/* Overlay for selection mode visual feedback */}
                                        {isSelectionMode && (
                                            <div
                                                className={cn(
                                                    "absolute inset-0 rounded-md transition-colors pointer-events-none",
                                                    isSelected ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : "hover:bg-black/5"
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {!isSelectionMode && (
                <div className="p-4 border-t border-border/50 shrink-0 bg-background/50 backdrop-blur-sm">
                    <Button className="w-full gap-2 shadow-sm" size="sm" onClick={handleAddPage}>
                        <Plus className="w-4 h-4" />
                        Ajouter une page
                    </Button>
                </div>
            )}

            <DeletePagesDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                pageCount={selectedPageIds.size}
            />
        </div>
    )
}
