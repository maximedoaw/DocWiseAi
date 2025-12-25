"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Archive, BookOpen, ChevronLeft, ChevronRight, FileText, LayoutGrid, LogOut, Plus, Settings, Folder } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export function ProjectsSidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { signOut } = useAuth()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const projects = useQuery(api.projects.list)

    const handleLogout = () => {
        signOut()
        router.push("/")
    }

    return (
        <div
            className={cn(
                "border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen hidden md:flex flex-col sticky top-0 transition-all duration-300",
                collapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Header */}
            <div className={cn("p-6 border-b border-border/50 flex items-center", collapsed ? "justify-center p-4" : "justify-between")}>
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg">DocWise</span>
                    </Link>
                )}
                {collapsed && (
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6 text-muted-foreground", !collapsed && "ml-2")}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Link href="/projects" title="Mes projets">
                            <Button
                                variant={pathname === "/projects" ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2", pathname === "/projects" && "bg-secondary/50 font-medium", collapsed && "justify-center px-0")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                {!collapsed && "Mes projets"}
                            </Button>
                        </Link>
                        <Link href="/onboarding" title="Nouveau projet">
                            <Button variant="ghost" className={cn("w-full justify-start gap-2", collapsed && "justify-center px-0")}>
                                <Plus className="w-4 h-4" />
                                {!collapsed && "Nouveau projet"}
                            </Button>
                        </Link>
                    </div>

                    {!collapsed && projects && projects.length > 0 && (
                        <div className="py-2">
                            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Récents
                            </h4>
                            <div className="space-y-1">
                                {projects.slice(0, 5).map((project) => (
                                    <Link key={project._id} href={`/projects/${project._id}`}>
                                        <Button
                                            variant={pathname === `/projects/${project._id}` ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-2 text-sm font-normal truncate",
                                                pathname === `/projects/${project._id}` && "bg-secondary/20"
                                            )}
                                        >
                                            <Folder className="w-3 h-3 text-muted-foreground" />
                                            <span className="truncate flex-1 text-left">{project.title}</span>
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {collapsed && projects && projects.length > 0 && (
                        <div className="py-2 border-t border-border/50 mt-2 pt-2 flex flex-col gap-2 items-center">
                            {projects.slice(0, 3).map(p => (
                                <Link key={p._id} href={`/projects/${p._id}`} title={p.title}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Folder className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className={cn("py-2", collapsed && "border-t border-border/50 mt-2 pt-2")}>
                        {!collapsed && (
                            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                AIDE
                            </h4>
                        )}
                        <Button variant="ghost" className={cn("w-full justify-start gap-2 text-muted-foreground", collapsed && "justify-center px-0")} title="Guide">
                            <FileText className="w-4 h-4" />
                            {!collapsed && "Guide"}
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start gap-2 text-muted-foreground", collapsed && "justify-center px-0")} title="Modèles">
                            <Archive className="w-4 h-4" />
                            {!collapsed && "Modèles"}
                        </Button>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 space-y-2">
                <Button variant="ghost" className={cn("w-full justify-start gap-2 text-muted-foreground hover:text-foreground", collapsed && "justify-center px-0")} title="Paramètres">
                    <Settings className="w-4 h-4" />
                    {!collapsed && "Paramètres"}
                </Button>
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10", collapsed && "justify-center px-0")}
                    onClick={handleLogout}
                    title="Déconnexion"
                >
                    <LogOut className="w-4 h-4" />
                    {!collapsed && "Déconnexion"}
                </Button>
            </div>
        </div>
    )
}
