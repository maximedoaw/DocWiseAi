"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Archive, BookOpen, FileText, LayoutGrid, LogOut, Menu, Plus, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Folder } from "lucide-react"

export function ProjectsMobileNav() {
    const pathname = usePathname()
    const { signOut } = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const projects = useQuery(api.projects.list)

    const handleLogout = () => {
        signOut()
        router.push("/")
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col bg-background/95 backdrop-blur">
                <SheetHeader className="p-6 border-b border-border/50 text-left">
                    <SheetTitle>
                        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-lg">DocWise</span>
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Link href="/projects" onClick={() => setOpen(false)}>
                                <Button
                                    variant={pathname === "/projects" ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start gap-2", pathname === "/projects" && "bg-secondary/50 font-medium")}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Mes projets
                                </Button>
                            </Link>
                            <Link href="/onboarding" onClick={() => setOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Plus className="w-4 h-4" />
                                    Nouveau projet
                                </Button>
                            </Link>
                        </div>

                        {projects && projects.length > 0 && (
                            <div className="py-2">
                                <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Récents
                                </h4>
                                <div className="space-y-1">
                                    {projects.slice(0, 5).map((project) => (
                                        <Link key={project._id} href={`/projects/${project._id}`} onClick={() => setOpen(false)}>
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

                        <div className="py-2">
                            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                AIDE & SUPPORT
                            </h4>
                            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                Guide de rédaction
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                                <Archive className="w-4 h-4" />
                                Modèles
                            </Button>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                        <Settings className="w-4 h-4" />
                        Paramètres
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
