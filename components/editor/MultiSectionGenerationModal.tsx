"use client"

import React, { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Check, Loader2, Sparkles, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface Section {
    id: string
    title: string
    status: "pending" | "generating" | "completed" | "error"
}

interface MultiSectionGenerationModalProps {
    open: boolean
    planHTML: string
    onSectionGenerated: (title: string, content: string) => Promise<void>
    onComplete: () => void
    projectDetails: any
}

export function MultiSectionGenerationModal({
    open,
    planHTML,
    onSectionGenerated,
    onComplete,
    projectDetails
}: MultiSectionGenerationModalProps) {
    const [sections, setSections] = useState<Section[]>([])
    const [isStarted, setIsStarted] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Parse sections from HTML plan
    useEffect(() => {
        if (!planHTML) return
        const parser = new DOMParser()
        const doc = parser.parseFromString(planHTML, 'text/html')
        const headings = Array.from(doc.querySelectorAll('h2, h3'))

        const parsedSections: Section[] = headings.map((h, i) => ({
            id: `section-${i}`,
            title: h.textContent || `Section ${i + 1}`,
            status: "pending"
        }))

        setSections(parsedSections)
    }, [planHTML])

    const startGeneration = async () => {
        if (isStarted || sections.length === 0) return
        setIsStarted(true)

        for (let i = 0; i < sections.length; i++) {
            setCurrentIndex(i)
            setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: "generating" } : s))

            try {
                const section = sections[i]
                const res = await fetch("/api/gemini", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: `ACTION: Rédige le contenu complet et détaillé pour la section UNIQUE : "${section.title}".
                               CONTEXTE DU RAPPORT:
                               - Détails : ${JSON.stringify(projectDetails)}
                               - Structure complète prévue : ${planHTML}
                               
                               CONSIGNES:
                               - Rédige uniquement le contenu relatif à "${section.title}".
                               - NE REPRENDS PAS l'introduction ou les autres sections si elles ne font pas partie de ce titre.
                               - Utilise un ton académique, professionnel et riche en détails.
                               - Retourne uniquement le code HTML (p, ul, li, strong) sans titre de section (le titre sera ajouté automatiquement).`,
                        projectDetails
                    })
                })

                if (!res.ok) throw new Error("Erreur API")
                const data = await res.json()

                if (data.content) {
                    await onSectionGenerated(section.title, data.content)
                    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: "completed" } : s))
                } else {
                    throw new Error("Contenu vide")
                }
            } catch (error) {
                console.error("Generation error:", error)
                setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: "error" } : s))
                // Optionally stop or continue? Let's continue for now.
            }
        }

        setTimeout(onComplete, 1500)
    }

    useEffect(() => {
        if (open && !isStarted && sections.length > 0) {
            startGeneration()
        }
    }, [open, sections, isStarted])

    const completedCount = sections.filter(s => s.status === "completed").length
    const progress = sections.length > 0 ? (completedCount / sections.length) * 100 : 0

    return (
        <Dialog open={open}>
            <DialogContent className="w-full sm:max-w-xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onComplete}
                    className="absolute top-6 right-6 z-50 p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-gray-950 p-6 md:p-8 space-y-6">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-serif">Éclosion du Rapport</DialogTitle>
                                    <DialogDescription className="font-light italic">
                                        L&apos;IA tisse votre expérience section par section.
                                    </DialogDescription>
                                </div>
                            </div>
                            <span className="text-2xl font-serif text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </DialogHeader>

                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {sections.map((section, idx) => (
                            <div
                                key={section.id}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
                                    section.status === "generating" ? "border-primary bg-primary/5 shadow-sm scale-[1.02]" : "border-border/50 bg-background/50",
                                    section.status === "completed" ? "opacity-70" : ""
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        section.status === "completed" ? "bg-green-500/10 text-green-600" :
                                            section.status === "generating" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/30"
                                    )}>
                                        {section.status === "completed" ? <Check className="w-4 h-4 stroke-[3px]" /> :
                                            section.status === "generating" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                                section.status === "error" ? <AlertCircle className="w-4 h-4 text-destructive" /> :
                                                    <span className="text-xs font-serif">{idx + 1}</span>}
                                    </div>
                                    <span className={cn(
                                        "font-serif text-sm transition-all",
                                        section.status === "generating" ? "font-medium" : "font-light"
                                    )}>
                                        {section.title}
                                    </span>
                                </div>
                                {section.status === "generating" && (
                                    <span className="text-[10px] uppercase tracking-widest text-primary animate-pulse font-bold">En cours...</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-border/10 flex justify-center">
                        <p className="text-xs text-muted-foreground font-light italic text-center max-w-xs">
                            Votre rapport est en train de prendre vie. Ne fermez pas cette fenêtre pour assurer la continuité du tissage.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
