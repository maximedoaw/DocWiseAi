"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, FileText, Users, Loader } from "lucide-react"
import { ProjectsSidebar } from "@/components/projects/ProjectsSidebar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DatabasePage() {
    const projects = useQuery(api.projects.list)
    const users = useQuery(api.users.list)

    return (
        <div className="flex min-h-screen bg-transparent text-foreground">
            <ProjectsSidebar />
            
            <main className="flex-1 flex flex-col h-screen bg-muted/10 overflow-auto">
                <header className="h-14 border-b border-border/50 bg-background/50 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/projects">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            <h1 className="font-semibold text-lg">Visualisation de la base de données</h1>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 space-y-6">
                    {/* Projects Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <CardTitle>Projets</CardTitle>
                            </div>
                            <CardDescription>
                                {projects === undefined ? "Chargement..." : `${projects?.length || 0} projet(s) trouvé(s)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {projects === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="animate-spin h-6 w-6 text-primary" />
                                </div>
                            ) : projects.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Aucun projet trouvé</p>
                            ) : (
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-2">
                                        {projects.map((project) => (
                                            <Card key={project._id} className="p-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold">{project.title}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Type: {project.type} | Pages: {project.pages?.length || 0}
                                                            </p>
                                                        </div>
                                                        <span className={`
                                                            px-2 py-1 rounded-full text-xs font-medium
                                                            ${project.status === "completed" 
                                                                ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                                                                : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"}
                                                        `}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                    {project.companyName && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Entreprise: {project.companyName}
                                                        </p>
                                                    )}
                                                    {project.missions && project.missions.length > 0 && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">Missions:</span>
                                                            <ul className="list-disc list-inside ml-2 text-muted-foreground">
                                                                {project.missions.map((mission, idx) => (
                                                                    <li key={idx}>{mission}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        Créé le: {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                                                        {" | "}
                                                        Modifié le: {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
                                                    </div>
                                                    {project.pages && project.pages.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-border/50">
                                                            <p className="text-xs font-medium mb-1">Pages:</p>
                                                            <div className="space-y-1">
                                                                {project.pages.map((page) => (
                                                                    <div key={page.id} className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/20">
                                                                        <span className="font-medium">{page.title}</span>
                                                                        <span className="ml-2">
                                                                            ({Math.round((page.content?.length || 0) / 1024)} KB)
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>

                    {/* Users Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <CardTitle>Utilisateurs</CardTitle>
                            </div>
                            <CardDescription>
                                {users === undefined ? "Chargement..." : `${users?.length || 0} utilisateur(s) trouvé(s)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {users === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="animate-spin h-6 w-6 text-primary" />
                                </div>
                            ) : users.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Aucun utilisateur trouvé</p>
                            ) : (
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {users.map((user) => (
                                            <Card key={user._id} className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatarUrl ? (
                                                        <img 
                                                            src={user.avatarUrl} 
                                                            alt={user.username} 
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <Users className="w-5 h-5 text-primary" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold">{user.username}</h3>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            ID: {user.clerkId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}



