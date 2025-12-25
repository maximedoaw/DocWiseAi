"use client"

import { Check, BookOpen, GraduationCap, Layout, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

export type TemplateId = "bts" | "licence" | "master" | "custom"

interface Template {
    id: TemplateId
    title: string
    description: string
    icon: React.ElementType
    defaultPages: number
    minPages?: number
    maxPages?: number
    badge?: string
}

const templates: Template[] = [
    {
        id: "bts",
        title: "Rapport BTS / DUT",
        description: "Structure standard pour bac+2. Axé sur la pratique et les missions techniques.",
        icon: Layout,
        defaultPages: 50,
        minPages: 45,
        maxPages: 70,
    },
    {
        id: "licence",
        title: "Rapport de Licence",
        description: "Pour L3 / Bachelor. Équilibre entre missions opérationnelles et analyse.",
        icon: BookOpen,
        defaultPages: 55,
        badge: "Populaire",
    },
    {
        id: "master",
        title: "Mémoire de Master",
        description: "Pour M1 / M2. Approche académique, problématique et recherche.",
        icon: GraduationCap,
        defaultPages: 60,
    },
]

interface TemplateSelectorProps {
    selectedTemplate: TemplateId | null
    pageCount: number
    onSelect: (id: TemplateId) => void
    onPageCountChange: (count: number) => void
}

export function TemplateSelector({
    selectedTemplate,
    pageCount,
    onSelect,
    onPageCountChange,
}: TemplateSelectorProps) {
    const currentTemplate = templates.find(t => t.id === selectedTemplate)

    // Validate BTS pages
    const isBtsInvalid = selectedTemplate === "bts" &&
        ((currentTemplate?.minPages && pageCount < currentTemplate.minPages) ||
            (currentTemplate?.maxPages && pageCount > currentTemplate.maxPages))

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => {
                    const isSelected = selectedTemplate === template.id
                    const Icon = template.icon

                    return (
                        <div
                            key={template.id}
                            onClick={() => {
                                onSelect(template.id)
                                onPageCountChange(template.defaultPages)
                            }}
                            className={cn(
                                "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-muted bg-card"
                            )}
                        >
                            {template.badge && (
                                <Badge className="absolute -top-3 -right-3 bg-amber-500 hover:bg-amber-600 text-white border-white border-2">
                                    {template.badge}
                                </Badge>
                            )}

                            <div className="flex flex-col gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{template.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/30 rounded-lg p-6 border border-dashed"
                    >
                        <div className="flex flex-col sm:flex-row gap-8 items-center">
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Nombre de pages estimé</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={pageCount}
                                        onChange={(e) => onPageCountChange(Number(e.target.value))}
        
                                        className={cn(
                                            "text-lg font-mono font-bold pl-4 pr-12 py-6",
                                            isBtsInvalid ? "border-destructive text-destructive focus-visible:ring-destructive" : "border-primary/20 focus-visible:ring-primary"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Validation Message for BTS */}
                            {selectedTemplate === 'bts' && (
                                <div className={cn(
                                    "w-full sm:w-64 p-4 rounded-md text-sm transition-colors duration-300 border",
                                    isBtsInvalid ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-green-500/10 text-green-600 border-green-500/20"
                                )}>
                                    <div className="flex items-center gap-2 font-semibold mb-1">
                                        {isBtsInvalid ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        {isBtsInvalid ? "Attention" : "Parfait"}
                                    </div>
                                    <p>
                                        Pour un BTS, le volume attendu est généralement compris entre <strong>45 et 70 pages</strong>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
