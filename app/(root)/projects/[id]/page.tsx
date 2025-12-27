"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProjectsSidebar } from "@/components/projects/ProjectsSidebar"
import { ProjectsMobileNav } from "@/components/projects/ProjectsMobileNav"
import { Editor } from "@/components/editor/Editor"
import { Id } from "@/convex/_generated/dataModel"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader, Save, LayoutGrid } from "lucide-react"
import Link from "next/link"

import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { DocumentStructureSidebar } from "@/components/editor/plugins/DocumentStructureSidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

import { UserButton } from "@clerk/nextjs"

export default function EditorPage() {
    const params = useParams()
    const projectId = params.id as Id<"projects">
    const project = useQuery(api.projects.get, { id: projectId })
    const editorRef = useRef<any>(null)

    // State for active page
    const [activePageId, setActivePageId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Set default active page when project loads
    useEffect(() => {
        if (project && project.pages && project.pages.length > 0 && !activePageId) {
            setActivePageId(project.pages[0].id)
        }
    }, [project, activePageId])

    const activePage = project?.pages?.find((p: { id: string }) => p.id === activePageId)

    const handleManualSave = async () => {
        if (editorRef.current) {
            const promise = editorRef.current.save()
            toast.promise(promise, {
                pending: "Enregistrement...",
                success: "Page enregistrée",
                error: "Erreur lors de l'enregistrement"
            })
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

            <main className="flex-1 flex flex-col h-screen bg-muted/10">
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
                                    pages={project.pages || []}
                                    activePageId={activePageId}
                                    onPageSelect={(id) => {
                                        setActivePageId(id)
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
                        <Button
                            size="sm"
                            className="gap-1 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs px-2 sm:px-3"
                            onClick={handleManualSave}
                            disabled={!activePageId}
                        >
                            <Save className="w-3 h-3" />
                            <span className="hidden sm:inline">Enregistrer</span>
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

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Centered Editor */}
                    {activePageId && activePage ? (
                        <div className="flex-1 relative flex flex-col min-w-0">
                            <div className="flex-1 overflow-hidden p-2 sm:p-4">
                                <Editor
                                    key={activePageId} // Critical: Force re-mount on page switch to reset editor state
                                    projectId={project._id}
                                    pageId={activePageId}
                                    initialContent={activePage.content}
                                    ref={editorRef}
                                    pages={project.pages || []}
                                    onPageSelect={setActivePageId}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
                            <div>
                                <p className="text-sm mb-2">Sélectionnez une page pour commencer</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRightSidebarOpen(true)}
                                    className="xl:hidden"
                                >
                                    Ouvrir le menu
                                </Button>
                            </div>
                        </div>
                    )}


                </div>
            </main>
        </div>
    )
}