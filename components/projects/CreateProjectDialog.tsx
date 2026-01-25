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
import { Plus, Check, ChevronLeft, ChevronRight, Loader2, Heart, Sparkles, X } from "lucide-react"
import { motion } from "framer-motion"

// Reuse onboarding components
import { TemplateSelector, TemplateId } from "@/components/onboarding/TemplateSelector"
import { InternshipInfoForm, InternshipData } from "@/components/onboarding/InternshipInfoForm"
import { MissionsInput } from "@/components/onboarding/MissionsInput"
import { DocumentUploader } from "@/components/onboarding/DocumentUploader"
import { ProjectSummary } from "@/components/onboarding/ProjectSummary"
import { cn } from "@/lib/utils"

const STEPS = [
    { id: 1, label: "Modèle", title: "L'Écrin", desc: "Le format de votre réussite." },
    { id: 2, label: "Infos", title: "Le Contexte", desc: "Votre environnement professionnel." },
    { id: 3, label: "Missions", title: "L'Action", desc: "Le coeur de votre expérience." },
    { id: 4, label: "Import", title: "L'Inspiration", desc: "Votre modèle (optionnel)." },
    { id: 5, label: "Résumé", title: "Vérification", desc: "Relecture des fondations." },
    { id: 6, label: "Plan", title: "La Structure", desc: "Le plan imaginé par l'intelligence." },
]

export function CreateProjectDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null)

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

    const handleNext = () => {
        if (step === 5) {
            handleGeneratePlan()
        } else {
            setStep(prev => Math.min(prev + 1, 6))
        }
    }
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    const handleGeneratePlan = async () => {
        setIsGeneratingPlan(true)
        setStep(6)
        try {
            let modelStorageId: string | undefined = undefined

            // Handle File Upload if exists to get structure context
            if (files.length > 0) {
                const file = files[0]
                const postUrl = await generateUploadUrl()
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                })
                if (result.ok) {
                    const { storageId } = await result.json()
                    modelStorageId = storageId
                }
            }

            const planPrompt = `
                ACTION: Génère un PLAN DÉTAILLÉ (Table des matières) UNIQUE et NON-RÉPÉTITIF pour un rapport de stage.
                ${modelStorageId ? "IMPORTANT: Analyse la structure du fichier joint. REPRODUIT EXACTEMENT sa structure logique sans ajouter de sections superflues ou répétitives." : ""}
                
                DÉTAILS DU PROJET:
                - Rôle: ${internshipData.role}
                - Entreprise: ${internshipData.companyName}
                - Missions: ${missions.join("; ")}
                - Type de diplôme: ${selectedTemplate}
                
                CONSIGNES CRITIQUES:
                - NE RÉPÈTE JAMAIS la même section. Chaque titre doit être unique.
                - Organise logiquement : Intro -> Présentation -> Missions -> Analyse -> Conclusion.
                - Retourne uniquement le code HTML (h2, h3, ul, li).
                - Assure-toi que les titres sont explicites et professionnels.
            `;

            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: planPrompt,
                    modelStorageId,
                    projectDetails: {
                        title: internshipData.role,
                        companyName: internshipData.companyName,
                        domains: internshipData.domains,
                        missions: missions,
                    }
                })
            })

            const data = await response.json()
            if (data.content) {
                setGeneratedPlan(data.content)
            }
        } catch (error) {
            console.error("Plan generation failed:", error)
        } finally {
            setIsGeneratingPlan(false)
        }
    }

    const handleFinalCreate = async () => {
        setIsSubmitting(true)
        try {
            // We might reuse the modelStorageId if we had it, but let's re-upload or track it
            // For now, simplicity: if we generated plan, we probably already have a model reference or don't need to re-upload.
            // But let's be safe and check if we need to re-upload (if user changed files).

            let finalModelId: string | undefined = undefined;
            if (files.length > 0) {
                const file = files[0]
                const postUrl = await generateUploadUrl()
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                })
                if (result.ok) {
                    const { storageId } = await result.json()
                    finalModelId = storageId
                }
            }

            const projectId = await createProject({
                title: internshipData.role || "Nouveau Projet",
                type: selectedTemplate || "BTS",
                academicYear: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
                companyName: internshipData.companyName,
                companyDescription: internshipData.objective,
                domains: internshipData.domains,
                duration: internshipData.duration,
                missions: missions,
                numPages: pageCount,
                modelStorageId: finalModelId,
                initialContent: generatedPlan || undefined
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
        setGeneratedPlan(null)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setTimeout(resetForm, 300)
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2 font-serif italic text-white rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                        <Plus className="w-4 h-4" /> Nouveau Projet
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[95vw] md:max-w-6xl h-full sm:h-[92vh] flex flex-col p-0 overflow-hidden sm:rounded-[2.5rem] border-none shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] bg-background">
                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-6 right-6 z-50 p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Visual Accent */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Header with Artisanal Style */}
                    {/* Header removed to gain space */}
                    <div className="sr-only">
                        <DialogTitle>Nouveau Projet</DialogTitle>
                        <DialogDescription>Configuration de votre rapport de stage.</DialogDescription>
                    </div>

                    {/* Stepper Indicator - Immersive */}
                    <div className="px-4 md:px-12 py-6 md:py-10 border-b bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
                        <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/60 -z-10 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-0 h-[1px] bg-primary -z-10 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                            />
                            {STEPS.map((s) => (
                                <div key={s.id} className="relative flex flex-col items-center bg-background px-1 md:px-4">
                                    <div className={cn(
                                        "w-8 h-8 md:w-11 md:h-11 rounded-xl flex items-center justify-center border transition-all duration-500",
                                        step >= s.id
                                            ? "border-primary bg-primary/5 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.4)] rotate-3"
                                            : "border-border/50 bg-muted/10 text-muted-foreground/40"
                                    )}>
                                        {step > s.id ? <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" /> : <span className="font-serif italic text-xs md:text-base">{s.id}</span>}
                                    </div>
                                    <span className={cn(
                                        "absolute -bottom-6 md:bottom-[-2rem] whitespace-nowrap text-[8px] md:text-[10px] font-medium uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 hidden sm:block",
                                        step >= s.id ? "text-primary opacity-100 translate-y-0" : "text-muted-foreground/40 opacity-0 translate-y-1"
                                    )}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area - Expansive */}
                    <div className="flex-1 p-8 md:p-16 overflow-y-auto bg-background relative">
                        {/* Subtle background flourishes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="max-w-5xl mx-auto min-h-[450px]">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                            >
                                <div className="mb-16 space-y-2">
                                    <h2 className="text-4xl font-serif font-medium text-foreground tracking-tight">{STEPS[step - 1].title}</h2>
                                    <p className="text-xl text-muted-foreground font-light italic leading-relaxed">{STEPS[step - 1].desc}</p>
                                </div>

                                <div className="space-y-10 pb-10">
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
                                        <div className="space-y-10">
                                            <div className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-gray-950 border border-primary/10 p-8 rounded-[2rem] flex items-center gap-8 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=\'20\'_height=\'20\'_viewBox=\'0 0 20 20\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M0 0H20V20H0V0ZM1 1H19V19H1V1Z\'_fill=\'currentColor\'_fill-opacity=\'0.03\'/%3E%3C/svg%3E')] opacity-30" />
                                                <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-gray-900/50 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 border border-white/40">
                                                    <Heart className="w-8 h-8 text-primary shadow-sm" />
                                                </div>
                                                <div className="space-y-1 relative z-10">
                                                    <h4 className="text-lg font-serif font-medium">Analyse structurelle</h4>
                                                    <p className="text-base text-foreground/70 leading-relaxed font-light italic">
                                                        Uploadez un exemple de rapport (PDF ou Word) pour que l&apos;intelligence
                                                        respecte scrupuleusement la structure de votre école.
                                                    </p>
                                                </div>
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
                                            onSubmit={handleNext}
                                        />
                                    )}
                                    {step === 6 && (
                                        <div className="space-y-10 pb-20">
                                            {isGeneratingPlan ? (
                                                <div className="flex flex-col items-center justify-center py-32 space-y-8">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin" />
                                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                                                        <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <p className="text-2xl font-serif italic text-foreground animate-pulse">L&apos;IA déchiffre la structure...</p>
                                                        <p className="text-sm text-muted-foreground font-light italic">Fusion de votre parcours et du modèle académique.</p>
                                                    </div>
                                                </div>
                                            ) : generatedPlan ? (
                                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
                                                    <div className="bg-[#fffdfa] dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-[20px_20px_60px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                                        {/* Paper texture overlay */}
                                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=\'100\'_height=\'100\'_viewBox=\'0 0 100 100\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M11_18c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm48_25c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm-43-7c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm63_31c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3z\'_fill=\'%23000\'_fill-opacity=\'0.01\'/%3E%3C/svg%3E')] opacity-50" />

                                                        <div className="prose prose-lg prose-stone dark:prose-invert max-w-none font-serif italic relative z-10 leading-relaxed text-slate-800 dark:text-slate-200">
                                                            <div dangerouslySetInnerHTML={{ __html: generatedPlan }} className="[&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:mb-8 [&>h2]:mt-12 [&>h2]:text-primary [&>h3]:text-lg md:[&>h3]:text-xl [&>h3]:mt-6 [&>ul]:space-y-4 [&>ul]:mt-4 [&>ul>li]:text-sm md:[&>ul>li]:text-base [&>ul>li]:font-light" />
                                                        </div>

                                                        {/* Handwritten note style */}
                                                        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-muted-foreground/40 font-medium uppercase tracking-[0.2em]">
                                                            <span>Proposition de plan DocWise</span>
                                                            <span>Version 1.0</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-12 flex flex-col items-center gap-3">
                                                        <p className="text-sm text-foreground/50 font-light italic text-center max-w-md">
                                                            Ce plan servira de squelette à votre rédaction. Vous pourrez librement l&apos;ajuster dans l&apos;écrin de l&apos;éditeur.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-32 space-y-6 bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/40">
                                                    <p className="text-2xl font-serif text-destructive/70 italic">La structure n&apos;a pu être esquissée.</p>
                                                    <Button onClick={handleGeneratePlan} variant="outline" className="rounded-full px-10 h-14 font-serif italic hover:bg-primary hover:text-white transition-all">Tenter une nouvelle fois</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Elegant */}
                <div className="p-6 md:p-10 border-t bg-muted/5 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-md -z-10" />

                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting || isGeneratingPlan}
                        className="rounded-full px-10 h-12 md:h-14 font-serif italic text-base md:text-lg hover:bg-primary/5 w-full md:w-auto"
                    >
                        <ChevronLeft className="w-5 h-5 mr-3" /> Revenir en arrière
                    </Button>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                        {step < 5 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedTemplate) ||
                                    (step === 2 && (!internshipData.companyName || !internshipData.role))
                                }
                                className="h-12 md:h-14 px-12 rounded-full font-serif italic text-base md:text-lg transition-all active:scale-95 shadow-lg shadow-black/5 w-full md:w-auto"
                            >
                                Continuer <ChevronRight className="w-5 h-5 ml-3" />
                            </Button>
                        ) : step === 5 ? (
                            <Button onClick={handleGeneratePlan} className="h-14 md:h-16 px-14 rounded-full font-serif italic text-lg md:text-xl shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.03] transition-all bg-primary text-primary-foreground w-full md:w-auto">
                                Esquisser le Plan <Sparkles className="w-5 h-5 ml-3" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinalCreate}
                                disabled={isSubmitting || isGeneratingPlan || !generatedPlan}
                                className="h-14 md:h-16 px-16 rounded-full font-serif italic text-lg md:text-xl shadow-[0_25px_60px_-15px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.03] transition-all bg-primary text-primary-foreground w-full md:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Éclosion...
                                    </>
                                ) : (
                                    <>Accéder à l&apos;Éditeur <Check className="w-5 h-5 ml-3" /></>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
