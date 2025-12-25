"use client"

import { Button } from "@/components/ui/button"
import { Check, Edit2 } from "lucide-react"
import { TemplateId } from "./TemplateSelector"
import { InternshipData } from "./InternshipInfoForm"
import { Badge } from "@/components/ui/badge"

interface ProjectSummaryProps {
    template: TemplateId | null
    info: InternshipData
    missions: string[]
    files: File[]
    startFromScratch: boolean
    pageCount: number
    onEditStep: (step: number) => void
    onSubmit: () => void
}

export function ProjectSummary({
    template,
    info,
    missions,
    files,
    startFromScratch,
    pageCount,
    onEditStep,
    onSubmit,
}: ProjectSummaryProps) {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Tout est prêt ! 🚀</h3>
                <p className="text-muted-foreground">
                    Vérifiez les informations avant de générer votre espace de travail.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Template */}
                <div className="bg-card border rounded-xl p-6 relative group hover:border-primary/50 transition-colors">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditStep(1)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                        Template
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="text-base py-1 px-3 border-primary/20 bg-primary/5 text-primary">
                            {template === "bts" && "Rapport BTS / DUT"}
                            {template === "licence" && "Rapport de Licence"}
                            {template === "master" && "Mémoire de Master"}
                            {template === "custom" && "Personnalisé"}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                            {pageCount} pages environ
                        </Badge>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-card border rounded-xl p-6 relative group hover:border-primary/50 transition-colors">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditStep(2)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                        Informations
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Entreprise</dt>
                            <dd className="font-medium">{info.companyName || "-"}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Poste</dt>
                            <dd className="font-medium">{info.role || "-"}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Durée</dt>
                            <dd className="font-medium">{info.duration || "-"}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Domaines</dt>
                            <dd className="font-medium flex flex-wrap gap-1 mt-1">
                                {info.domains.length > 0 ? (
                                    info.domains.map((d, i) => <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>)
                                ) : "-"}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Missions */}
                <div className="bg-card border rounded-xl p-6 relative group hover:border-primary/50 transition-colors">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditStep(3)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                        Missions ({missions.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {missions.length > 0 ? (
                            missions.map((m, i) => <Badge key={i} variant="outline">{m}</Badge>)
                        ) : <span className="text-muted-foreground italic">Aucune mission renseignée</span>}
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-card border rounded-xl p-6 relative group hover:border-primary/50 transition-colors">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditStep(4)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                        Documents
                    </h4>
                    {startFromScratch ? (
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Check className="w-4 h-4" /> Je pars de zéro
                        </div>
                    ) : (
                        <div className="text-sm">
                            <strong>{files.length}</strong> fichier(s) importé(s)
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={onSubmit} size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg h-14 shadow-xl shadow-amber-500/20">
                Générer mon rapport <Check className="w-5 h-5 ml-2" />
            </Button>
        </div>
    )
}
