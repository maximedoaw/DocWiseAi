"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, FileText, Mic, MicOff, Tag, Hash, RefreshCw, Zap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { getPageSections, Section } from "./plugins/DocumentStructureSidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "../ui/badge"

interface AIGeneratorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onInsert: (html: string, prompt: string) => void
    currentContent: string
}

const SUGGESTED_PROMPTS = [
    { label: "Introduction", prompt: "Rédige une introduction captivante pour ce rapport." },
    { label: "Améliorer", prompt: "Améliore le style de mon texte pour le rendre plus professionnel." },
    { label: "Tableau", prompt: "Génère un tableau comparatif sur ce sujet." },
    { label: "Conclusion", prompt: "Rédige une conclusion impactante." }
]

const TaggedTextarea = ({ value, onChange, placeholder, textareaRef }: {
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) => {
    const tagRegex = /(@"(?:[^"]+)"|@\w+)/g;

    const renderHighlightedContent = () => {
        const parts = value.split(tagRegex);
        return parts.map((part, i) => {
            if (part.match(tagRegex)) {
                return (
                    <span
                        key={i}
                        className="bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-1 py-0.5 rounded border border-orange-500/20"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="relative w-full min-h-[160px] font-sans text-sm leading-relaxed overflow-hidden bg-muted/5 rounded-xl border border-orange-500/10 focus-within:border-orange-500/30 transition-all">
            {/* Background Highlighting Layer */}
            <div
                className="absolute inset-0 p-5 whitespace-pre-wrap break-words pointer-events-none text-transparent"
                aria-hidden="true"
                style={{ font: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' }}
            >
                {renderHighlightedContent()}
                {value.endsWith('\n') ? ' ' : ''}
            </div>

            <Textarea
                ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="relative z-10 min-h-[160px] w-full bg-transparent border-none focus-visible:ring-0 resize-none p-5 transition-all shadow-none caret-orange-500 text-foreground/90"
            />
        </div>
    );
};

export function AIGeneratorDialog({ open, onOpenChange, onInsert, currentContent }: AIGeneratorDialogProps) {
    const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [useContext, setUseContext] = useState(true)
    const [previewContent, setPreviewContent] = useState<string | null>(null)
    const [view, setView] = useState<'input' | 'preview'>('input')
    const [savedRange, setSavedRange] = useState<Range | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Reset view when dialog opens/closes
    useEffect(() => {
        if (open) {
            setView('input')
            setPreviewContent(null)
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                setSavedRange(selection.getRangeAt(0).cloneRange())
            }
        }
    }, [open])

    // Speech Recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition()

    useEffect(() => {
        if (transcript && listening) {
            setPrompt(transcript)
        }
    }, [transcript, listening])

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening()
        } else {
            resetTranscript()
            SpeechRecognition.startListening({ continuous: true, language: 'fr-FR' })
        }
    }

    // Stop listening when dialog closes
    useEffect(() => {
        if (!open) {
            SpeechRecognition.stopListening()
            resetTranscript()
        }
    }, [open, resetTranscript])

    // Tagging / Sections
    const sections = useMemo(() => {
        if (!currentContent) return []
        return getPageSections(currentContent)
    }, [currentContent])

    const insertTag = (section: Section) => {
        // Format as @"Section Name" if it has spaces, else @SectionName
        const name = section.text.includes(" ") ? `@"${section.text}"` : `@${section.text}`;
        const tag = ` ${name} `;
        setPrompt(prev => prev + tag)
        textareaRef.current?.focus()
    }

    // Helper to extract specific section content for the "Before" view
    const getActiveSectionContent = () => {
        const tagMatch = prompt.match(/(@"(?:[^"]+)"|@\w+)/);
        if (!tagMatch) return null;

        const tagName = tagMatch[1].replace(/[@"]/g, "");
        const section = sections.find(s => s.text === tagName);
        if (!section || !currentContent) return null;

        // Roughly extract between headings (simplified logic)
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentContent, 'text/html');
        const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
        const targetHeader = headings.find(h => h.textContent === tagName);

        if (targetHeader) {
            let content = targetHeader.outerHTML;
            let next = targetHeader.nextElementSibling;
            while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
                content += next.outerHTML;
                next = next.nextElementSibling;
            }
            return content;
        }
        return null;
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setIsLoading(true)
        console.log("🚀 [AI Dialog] Generating with prompt:", prompt)

        try {
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    currentContent: useContext ? currentContent : undefined,
                    sections: useContext ? sections : []
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Generation failed")
            }

            if (data.content) {
                console.log("✅ [AI Dialog] HTML Generated")
                onInsert(data.content, prompt) // Pass prompt for tag detection
                onOpenChange(false)
                setPrompt("")
                toast.info("Aperçu généré dans l'éditeur", {
                    description: "Validez ou ignorez les changements directement sur la page."
                })
            }
        } catch (error) {
            console.error("❌ [AI Dialog] Error:", error)
            toast.error("Échec de la génération")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border bg-background shadow-2xl rounded-xl">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin stroke-[2]" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">L&apos;IA réfléchit...</p>
                        </div>
                    </div>
                )}

                <DialogHeader className="px-6 py-5 border-b bg-muted/10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        <DialogTitle className="text-lg font-semibold tracking-tight">Assistant IA Magic</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Utilisez @ pour citer une section. L&apos;aperçu apparaîtra directement dans l&apos;éditeur.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Instructions pour l&apos;IA</label>
                        <TaggedTextarea
                            textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
                            placeholder="Décrivez ce que l'IA doit rédiger (ex: 'Une intro pour @Introduction')..."
                            value={prompt}
                            onChange={setPrompt}
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_PROMPTS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setPrompt(item.prompt)}
                                className="px-3 py-1 text-[11px] rounded-md bg-muted/50 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-700 transition-colors border border-transparent hover:border-orange-500/20"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600">
                                        <Tag className="w-3.5 h-3.5 mr-1.5" />
                                        Citer une section
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel className="text-[10px] text-muted-foreground">Titres de la page</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {sections.length === 0 ? (
                                        <div className="p-2 text-[10px] text-muted-foreground italic text-center">Aucune section détectée</div>
                                    ) : (
                                        sections.map((s, i) => (
                                            <DropdownMenuItem key={i} onClick={() => insertTag(s)} className="text-xs cursor-pointer">
                                                <Hash className="w-3 h-3 mr-2 opacity-50" />
                                                <span className="truncate">{s.text}</span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUseContext(!useContext)}
                                className={cn(
                                    "h-8 px-2 text-xs transition-colors",
                                    useContext ? "text-orange-600 bg-orange-500/10" : "text-muted-foreground"
                                )}
                            >
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                {useContext ? "Contexte inclut" : "Sans contexte"}
                            </Button>

                            {browserSupportsSpeechRecognition && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={toggleListening}
                                    className={cn(
                                        "h-8 px-2 text-xs",
                                        listening ? "text-red-600 bg-red-50 animate-pulse" : "text-muted-foreground"
                                    )}
                                >
                                    {listening ? <MicOff className="w-3.5 h-3.5 mr-1.5" /> : <Mic className="w-3.5 h-3.5 mr-1.5" />}
                                    {listening ? "Dictée..." : "Vocale"}
                                </Button>
                            )}
                        </div>

                        {prompt && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrompt("")}
                                className="h-8 text-[11px] text-muted-foreground hover:text-red-500"
                            >
                                <RefreshCw className="w-3 h-3 mr-1.5" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-9 px-4 text-xs font-semibold">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-6 text-xs font-bold shadow-sm active:scale-95 transition-all"
                    >
                        <Zap className="w-3.5 h-3.5 mr-2 fill-current" />
                        Générer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
