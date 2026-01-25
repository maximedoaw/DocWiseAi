"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProjectsSidebar } from "@/components/projects/ProjectsSidebar"
import { ProjectsMobileNav } from "@/components/projects/ProjectsMobileNav"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader, Save, LayoutGrid, Sparkles, PanelRightClose, PanelRight } from "lucide-react"
import Link from "next/link"
import { FloatingToolbar } from "@/components/editor/FloatingToolbar"
import { FixedToolbar } from "@/components/editor/FixedToolbar"
import { ContextMenu } from "@/components/editor/ContextMenu"
import { DocumentStructureSidebar } from "@/components/editor/plugins/DocumentStructureSidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { toast } from "sonner"
import { CustomEditor } from "@/components/editor/CustomEditor"
import { UserButton } from "@clerk/nextjs"
import { AIGenerationOverlay } from "@/components/ui/AIGenerationOverlay"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function EditorPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const projectId = params.id as Id<"projects">
    const project = useQuery(api.projects.get, { id: projectId })
    const editorRef = useRef<any>(null)

    // State for active page
    const [activePageId, setActivePageId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
    const [showRightSidebar, setShowRightSidebar] = useState(true)
    const [generationStep, setGenerationStep] = useState<"analysing" | "generating" | "formatting" | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // ... (keep useEffect for activePageId)

    // ... (keep useEffect for activePageId)

    // (Note: skipping unchanged lines to reach handleGenerateReport is needed but tool only does contiguous. I will just replace the top state part and the function separately? No, I need to be careful about file structure.)

    // I will replace the state part first.

    // State for pages (local copy for real-time updates)
    const [localPages, setLocalPages] = useState<any[]>([])

    // Sync local pages with project pages initially
    useEffect(() => {
        if (project?.pages && localPages.length === 0) {
            setLocalPages(project.pages)
        }
    }, [project?.pages, localPages.length]) // Only sync once or if length changes significantly? 
    // Actually we need to be careful. If we are typing, we don't want DB over-writes to revert our typing if DB is slow.
    // Ideally CustomEditor is the source of truth for 'editing'.
    // But project.pages might update if pages are added/deleted.
    // Let's rely on CustomEditor's onPagesChange to keep us up to date.

    // Better strategy: Use a derived state or just use local state initialized from prop.
    // We'll update localPages when project.pages changes ONLY if we assume no local pending edits, 
    // OR we just use the handler from CustomEditor.

    useEffect(() => {
        if (project?.pages) {
            // We only update if we have a mismatch in length (page added/removed remotely)
            // or if we are initializing. 
            // Checking deep equality is expensive.
            // Let's just trust project.pages for initial load.
            if (localPages.length === 0) {
                setLocalPages(project.pages)
            }
        }
    }, [project?.pages])

    // ... (keep useEffect for activePageId)

    // ... (keep useEffect for activePageId)

    // Sync active page with URL or default
    useEffect(() => {
        if (project && project.pages && project.pages.length > 0) {
            const pageParam = searchParams.get('page')
            if (pageParam && project.pages.some((p: any) => p.id === pageParam)) {
                if (activePageId !== pageParam) {
                    setActivePageId(pageParam)
                }
            } else if (!activePageId) {
                setActivePageId(project.pages[0].id)
            }
        }
    }, [project, searchParams])

    const handlePageSelect = useCallback((id: string) => {
        setActivePageId(id)
        router.push(`/projects/${projectId}?page=${id}`)
    }, [projectId, router])

    const activePage = localPages.find((p: { id: string }) => p.id === activePageId) || project?.pages?.find((p: { id: string }) => p.id === activePageId)

    const handleManualSave = async () => {
        if (editorRef.current) {
            const promise = editorRef.current.save()
            toast.promise(promise, {
                loading: "Enregistrement...",
                success: "Page enregistrée",
                error: (err) => "Erreur lors de l'enregistrement"
            })
        }
    }

    // Handler for AI generation insertion
    const handleAIInsert = (html: string) => {
        if (editorRef.current) {
            editorRef.current.insertAIDraft(html)
        }
    }

    const handleGenerateReport = async () => {
        if (!project || !project.modelStorageId) return;

        setGenerationStep("analysing");

        try {
            const timer = setTimeout(() => setGenerationStep("generating"), 2500);

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelStorageId: project.modelStorageId,
                    projectDetails: {
                        title: project.title,
                        companyName: project.companyName,
                        companyDescription: project.companyDescription,
                        domains: project.domains,
                        duration: project.duration,
                        missions: project.missions,
                        academicYear: project.academicYear
                    }
                })
            });

            if (!res.ok) throw new Error("Erreur de génération");

            const data = await res.json();

            if (editorRef.current && data.content) {
                setGenerationStep("formatting");
                await new Promise(r => setTimeout(r, 1000));

                editorRef.current.insertHTML(data.content);
                editorRef.current.save();
                toast.success("Rapport généré avec succès !");
            }
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la génération.");
        } finally {
            setGenerationStep(null);
        }
    }

    if (!mounted) return null;

    if (project === undefined) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin h-8 w-8 text-amber-500" />
                </div>
            </div>
        );
    }

    if (project === null) {
        return (
            <div className="flex min-h-screen bg-background items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">Projet introuvable ou non autorisé</h1>
                <Link href="/projects">
                    <Button variant="secondary" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux projets
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-transparent text-foreground">
            {/* Projects Sidebar (Left) */}
            <ProjectsSidebar />

            <main className="flex-1 flex flex-col h-screen bg-muted/10 relative">
                {/* AI Overlay */}
                <AIGenerationOverlay isVisible={!!generationStep} step={generationStep || "analysing"} />

                {/* Editor Header */}
                <header className="h-14 border-b border-border/50 bg-background/50 backdrop-blur flex items-center justify-between px-2 sm:px-4 sticky top-0 z-50 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        {/* Mobile: Left Sidebar (Projects) */}
                        <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 md:hidden"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <ProjectsSidebar className="flex w-full relative h-full" />
                            </SheetContent>
                        </Sheet>

                        {/* Mobile: Right Sidebar (Structure) */}
                        <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 xl:hidden"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-64 p-0">
                                <DocumentStructureSidebar
                                    projectId={projectId}
                                    pages={localPages.length > 0 ? localPages : (project.pages || [])}
                                    activePageId={activePageId}
                                    onPageSelect={(id) => {
                                        handlePageSelect(id)
                                        setRightSidebarOpen(false)
                                    }}
                                />
                            </SheetContent>
                        </Sheet>

                        {/* Back Button (Mobile) */}
                        <Link href="/projects" className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>

                        <div className="flex flex-col min-w-0 flex-1">
                            <h1 className="font-semibold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-md">{project.title}</h1>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline-block truncate">
                                {activePage?.title || "Page sans titre"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {project.modelStorageId && (
                            <Button
                                size="sm"
                                className="gap-1 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 border-0 h-8 text-xs px-2 sm:px-3 shadow-sm"
                                onClick={handleGenerateReport}
                            >
                                <Sparkles className="w-3 h-3" />
                                <span className="hidden sm:inline">Générer avec l'IA</span>
                            </Button>
                        )}

                        <Button
                            size="sm"
                            className="gap-1 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs px-2 sm:px-3"
                            onClick={handleManualSave}
                            disabled={!activePageId}
                        >
                            <Save className="w-3 h-3" />
                            <span className="hidden sm:inline">Enregistrer</span>
                        </Button>

                        {/* Sidebar Toggle Button (Desktop) */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden xl:flex h-8 w-8 p-0"
                            onClick={() => setShowRightSidebar(!showRightSidebar)}
                            title={showRightSidebar ? "Masquer la barre latérale" : "Afficher la barre latérale"}
                        >
                            {showRightSidebar ? (
                                <PanelRightClose className="w-4 h-4" />
                            ) : (
                                <PanelRight className="w-4 h-4" />
                            )}
                        </Button>

                        <div className="pl-2 border-l border-border/50">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <FixedToolbar
                        className="shrink-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                        activePageContent={activePage?.content}
                        onInsertHTML={handleAIInsert}
                    />

                    <div className="flex-1 flex overflow-hidden relative">
                        <CustomEditor
                            key={project._id}
                            ref={editorRef}
                            projectId={project._id}
                            project={project}
                            pages={project.pages || []}
                            onPageSelect={setActivePageId}
                            onPagesChange={setLocalPages}
                        />

                        <FloatingToolbar />
                        <ContextMenu />

                        {/* Right Sidebar */}
                        <div
                            className={cn(
                                "hidden xl:block h-full border-l shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
                                showRightSidebar ? "w-80 opacity-100" : "w-0 opacity-0"
                            )}
                        >
                            <div className="w-80 h-full">
                                <DocumentStructureSidebar
                                    projectId={projectId}
                                    pages={localPages.length > 0 ? localPages : (project.pages || [])}
                                    activePageId={activePageId || ""}
                                    onPageSelect={(id) => {
                                        if (editorRef.current) {
                                            editorRef.current.scrollToPage(id)
                                        }
                                        setActivePageId(id)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}