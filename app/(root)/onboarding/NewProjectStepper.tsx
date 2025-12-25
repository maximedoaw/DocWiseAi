"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

import { Check, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Sub-components
import { TemplateSelector, TemplateId } from "@/components/onboarding/TemplateSelector"
import { InternshipInfoForm, InternshipData } from "@/components/onboarding/InternshipInfoForm"
import { MissionsInput } from "@/components/onboarding/MissionsInput"
import { DocumentUploader } from "@/components/onboarding/DocumentUploader"
import { ProjectSummary } from "@/components/onboarding/ProjectSummary"
import { StepTransition } from "@/components/onboarding/StepTransition"
import { useState } from "react"

const STEPS = [
    { id: 1, label: "Template", title: "Choix du modèle", desc: "Le point de départ de votre rapport." },
    { id: 2, label: "Infos", title: "Contexte du stage", desc: "Dites-nous en plus sur votre environnement." },
    { id: 3, label: "Missions", title: "Vos missions", desc: "Le cœur de votre expérience." },
    { id: 4, label: "Documents", title: "Documents (Optionnel)", desc: "Enrichissez le contexte pour l'IA." },
    { id: 5, label: "Résumé", title: "Confirmation", desc: "Vérifiez et générez votre projet." },
]

export default function NewProjectStepper() {
    const [step, setStep] = useState(1)

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

    const handleNext = () => {
        // Validation simple
        if (step === 1 && !selectedTemplate) return
        if (step === 2 && (!internshipData.companyName || !internshipData.role)) return

        setStep((prev) => Math.min(prev + 1, 5))
    }

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1))
    }

    const createProject = useMutation(api.projects.create)
    const router = useRouter()

    const handleGenerate = async () => {
        try {
            const projectId = await createProject({
                title: internshipData.role || "Nouveau Projet", // Fallback title
                type: selectedTemplate || "BTS",
                academicYear: "2024-2025", // Default for now
                companyName: internshipData.companyName,
                companyDescription: internshipData.objective, // Using objective as desc for now
                missions: missions,
                numPages: pageCount,
            })

            router.push(`/projects/${projectId}`)
        } catch (error) {
            console.error("Failed to create project:", error)
            // You might want to add a toast notification here
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-4">
            {/* Stepper Header */}
            <div className="relative flex justify-between items-center mb-12 w-full max-w-3xl mx-auto">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out rounded-full"
                    style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((s) => (
                    <div key={s.id} className="relative flex flex-col items-center bg-background p-2 z-10">
                        <div
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-bold transition-all duration-300 bg-background",
                                step >= s.id
                                    ? "border-primary text-primary shadow-[0_0_10px_rgba(255,191,0,0.3)] scale-110"
                                    : "border-muted text-muted-foreground"
                            )}
                        >
                            {step > s.id ? <Check className="w-6 h-6 animate-in zoom-in" /> : s.id}
                        </div>
                        <span
                            className={cn(
                                "absolute -bottom-8 whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors duration-300",
                                step >= s.id ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <span className="hidden sm:inline">{s.label}</span>
                        </span>
                    </div>
                ))}
            </div>

            <StepTransition key={step}>
                <Card className="min-h-[500px] flex flex-col bg-card/80 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />

                    <CardHeader className="border-b bg-muted/10 pb-8">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            {STEPS[step - 1].title}
                        </CardTitle>
                        <CardDescription className="text-lg">
                            {STEPS[step - 1].desc}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 p-8">
                        {step === 1 && (
                            <TemplateSelector
                                selectedTemplate={selectedTemplate}
                                pageCount={pageCount}
                                onPageCountChange={setPageCount}
                                onSelect={(id) => {
                                    setSelectedTemplate(id)
                                }}
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
                            <DocumentUploader
                                files={files}
                                onFilesChange={setFiles}
                                startFromScratch={startFromScratch}
                                onStartFromScratchChange={setStartFromScratch}
                            />
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
                    </CardContent>

                    {step < 5 && (
                        <CardFooter className="flex justify-between border-t pt-6 bg-muted/20 p-8">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={step === 1}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ChevronLeft className="w-4 h-4" /> Retour
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedTemplate) ||
                                    (step === 2 && (!internshipData.companyName || !internshipData.role))
                                }
                                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                            >
                                Suivant <ChevronRight className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </StepTransition>
        </div>
    )
}
