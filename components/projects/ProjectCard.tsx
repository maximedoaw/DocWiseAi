"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MoreVertical, Trash2, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface ProjectCardProps {
    id: Id<"projects">
    title: string
    type: string
    updatedAt: number
    status: string
}

export function ProjectCard({ id, title, type, updatedAt, status }: ProjectCardProps) {
    const deleteProject = useMutation(api.projects.deleteProject)

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group border-border/50 bg-card/50 hover:bg-card">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="line-clamp-1 text-lg font-bold">{title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${type === 'BTS' ? 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400' :
                                type === 'Licence' ? 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/20 dark:text-purple-400' :
                                    'bg-amber-50 text-amber-700 ring-amber-700/10 dark:bg-amber-900/20 dark:text-amber-400'
                            }`}>
                            {type}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(updatedAt, { addSuffix: true, locale: fr })}
                        </span>
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteProject({ id })} className="text-red-600 focus:text-red-500 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="h-24 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20 group-hover:border-primary/20 transition-colors">
                    <FileText className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/projects/${id}`} className="w-full">
                    <Button className="w-full gap-2" variant="outline">
                        <BookOpen className="w-4 h-4" />
                        Ouvrir le projet
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
