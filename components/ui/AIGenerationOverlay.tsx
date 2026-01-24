"use client"

import { Sparkles, BrainCircuit, FileText } from "lucide-react"

interface AIGenerationOverlayProps {
    isVisible: boolean
    step?: "analysing" | "generating" | "formatting"
}

export function AIGenerationOverlay({ isVisible, step = "analysing" }: AIGenerationOverlayProps) {
    if (!isVisible) return null

    return (
        <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />

                {/* Main Icon Circle */}
                <div className="relative bg-background border-2 border-primary/20 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl mb-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent animate-[spin_8s_linear_infinite]" />

                    {step === "analysing" && (
                        <BrainCircuit className="w-12 h-12 text-primary animate-pulse" />
                    )}
                    {step === "generating" && (
                        <Sparkles className="w-12 h-12 text-amber-500 animate-[bounce_2s_infinite]" />
                    )}
                    {step === "formatting" && (
                        <FileText className="w-12 h-12 text-blue-500 animate-pulse" />
                    )}
                </div>
            </div>

            {/* Processing Steps */}
            <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                    {step === "analysing" && "Analyse de la structure..."}
                    {step === "generating" && "Rédaction intelligente..."}
                    {step === "formatting" && "Mise en page finale..."}
                </h3>
                <p className="text-muted-foreground animate-pulse">
                    L'IA étudie votre modèle pour produire un rapport parfait.
                </p>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-gradient-to-r from-primary to-amber-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left scale-x-50" />
                </div>
            </div>
        </div>
    )
}
