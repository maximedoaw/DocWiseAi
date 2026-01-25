"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProjectsSidebar } from "@/components/projects/ProjectsSidebar"
import { ProjectsMobileNav } from "@/components/projects/ProjectsMobileNav"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function ProjectsPage() {
    const projects = useQuery(api.projects.list)

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <ProjectsSidebar />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto font-light">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <ProjectsMobileNav />
                        <div>
                            <h1 className="text-3xl font-serif font-medium tracking-tight">Mes Projets</h1>
                            <p className="text-muted-foreground mt-1 font-light italic">Gérez et éditez vos rapports de stage.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="hidden md:block">
                            <CreateProjectDialog>
                                <Button className="gap-2 text-white font-serif italic">
                                    <Plus className="w-4 h-4" />
                                    Nouveau Projet
                                </Button>
                            </CreateProjectDialog>
                        </div>
                    </div>
                </header>

                {projects === undefined ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse border border-border/50" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/10">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Aucun projet pour le moment</h2>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Commencez par créer votre premier rapport pour accéder à l'éditeur intelligent.
                        </p>
                        <CreateProjectDialog>
                            <Button size="lg">Créer un nouveau rapport</Button>
                        </CreateProjectDialog>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                id={project._id}
                                title={project.title}
                                type={project.type}
                                updatedAt={project.updatedAt}
                                status={project.status}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}