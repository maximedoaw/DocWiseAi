"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

// Reuse onboarding components
import { TemplateSelector, TemplateId } from "@/components/onboarding/TemplateSelector"
import { InternshipInfoForm, InternshipData } from "@/components/onboarding/InternshipInfoForm"
import { MissionsInput } from "@/components/onboarding/MissionsInput"
import { DocumentUploader } from "@/components/onboarding/DocumentUploader"
import { ProjectSummary } from "@/components/onboarding/ProjectSummary"
import { cn } from "@/lib/utils"

const STEPS = [
    { id: 1, label: "Modèle", title: "Choix du modèle", desc: "Le point de départ." },
    { id: 2, label: "Infos", title: "Contexte", desc: "Environnement du stage." },
    { id: 3, label: "Missions", title: "Vos missions", desc: "Vos réalisations." },
    { id: 4, label: "Fichier", title: "Import (Optionnel)", desc: "Votre modèle de rapport." },
    { id: 5, label: "Résumé", title: "Confirmation", desc: "Vérification finale." },
]

export function CreateProjectDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // State
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null)
    const [pageCount, setPageCount] = useState<number>(40)
    const [internshipData, setInternshipData] = useState<InternshipData>({
        companyName: "",
        domains: [],
        duration: "",
        role: "",
        objective: "",
    })
    const [missions, setMissions] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])
    const [startFromScratch, setStartFromScratch] = useState(false)

    const createProject = useMutation(api.projects.create)
    const generateUploadUrl = useMutation(api.files.generateUploadUrl)
    const router = useRouter()

    const handleNext = () => setStep(prev => Math.min(prev + 1, 5))
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    const handleGenerate = async () => {
        setIsSubmitting(true)
        try {
            let modelStorageId: string | undefined = undefined

            // Handle File Upload to Convex Storage
            if (files.length > 0) {
                const file = files[0] // Only take the first one for now
                const postUrl = await generateUploadUrl()

                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                })

                if (!result.ok) throw new Error("Upload failed")
                const { storageId } = await result.json()
                modelStorageId = storageId
            }

            const projectId = await createProject({
                title: internshipData.role || "Nouveau Projet",
                type: selectedTemplate || "BTS",
                academicYear: "2024-2025",
                companyName: internshipData.companyName,
                companyDescription: internshipData.objective,
                domains: internshipData.domains,
                duration: internshipData.duration,
                missions: missions,
                numPages: pageCount,
                modelStorageId: modelStorageId, // Pass the storage ID
            })

            setOpen(false)
            router.push(`/projects/${projectId}`)
        } catch (error) {
            console.error("Failed to create project:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setSelectedTemplate(null)
        setInternshipData({ companyName: "", domains: [], duration: "", role: "", objective: "" })
        setMissions([])
        setFiles([])
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setTimeout(resetForm, 300)
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Créer un projet
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl border-none shadow-2xl">
                <div className="flex-1 flex flex-col overflow-y-auto bg-background">
                    {/* Header */}
                    <DialogHeader className="p-6 border-b bg-muted/10">
                        <DialogTitle>Nouveau Projet</DialogTitle>
                        <DialogDescription>Configurez votre rapport en quelques étapes.</DialogDescription>
                    </DialogHeader>

                    {/* Stepper Indicator */}
                    <div className="px-10 py-6 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted -z-10 -translate-y-1/2 rounded-full" />
                            <div
                                className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-300 rounded-full"
                                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                            />
                            {STEPS.map((s) => (
                                <div key={s.id} className="relative flex flex-col items-center bg-background p-1">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all",
                                        step >= s.id ? "border-primary text-primary bg-primary/10" : "border-muted text-muted-foreground"
                                    )}>
                                        {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                                    </div>
                                    <span className={cn(
                                        "absolute -bottom-6 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider",
                                        step >= s.id ? "text-primary" : "text-muted-foreground"
                                    )}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold mb-2">{STEPS[step - 1].title}</h2>
                            <p className="text-muted-foreground mb-8">{STEPS[step - 1].desc}</p>

                            {step === 1 && (
                                <TemplateSelector
                                    selectedTemplate={selectedTemplate}
                                    pageCount={pageCount}
                                    onPageCountChange={setPageCount}
                                    onSelect={setSelectedTemplate}
                                />
                            )}
                            {step === 2 && (
                                <InternshipInfoForm
                                    data={internshipData}
                                    onChange={setInternshipData}
                                />
                            )}
                            {step === 3 && (
                                <MissionsInput
                                    missions={missions}
                                    onChange={setMissions}
                                />
                            )}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                                        💡 <strong>Astuce :</strong> Uploadez un exemple de rapport (PDF ou Word) pour que l'IA respecte sa structure exacte.
                                    </div>
                                    <DocumentUploader
                                        files={files}
                                        onFilesChange={setFiles}
                                        startFromScratch={startFromScratch}
                                        onStartFromScratchChange={setStartFromScratch}
                                    />
                                </div>
                            )}
                            {step === 5 && (
                                <ProjectSummary
                                    template={selectedTemplate}
                                    info={internshipData}
                                    missions={missions}
                                    files={files}
                                    startFromScratch={startFromScratch}
                                    pageCount={pageCount}
                                    onEditStep={setStep}
                                    onSubmit={handleGenerate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-muted/10 flex justify-between shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>

                    {step < 5 ? (
                        <Button
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !selectedTemplate) ||
                                (step === 2 && (!internshipData.companyName || !internshipData.role))
                            }
                        >
                            Suivant <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleGenerate} disabled={isSubmitting} className="min-w-[150px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...
                                </>
                            ) : (
                                <>Générer le projet <Check className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
