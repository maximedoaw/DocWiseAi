"use client"

import { Upload, FileText, X, FilePlus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DocumentUploaderProps {
    files: File[]
    onFilesChange: (files: File[]) => void
    startFromScratch: boolean
    onStartFromScratchChange: (val: boolean) => void
}

export function DocumentUploader({
    files,
    onFilesChange,
    startFromScratch,
    onStartFromScratchChange
}: DocumentUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files)
            onFilesChange([...files, ...newFiles])
            onStartFromScratchChange(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const removeFile = (index: number) => {
        const newFiles = [...files]
        newFiles.splice(index, 1)
        onFilesChange(newFiles)
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer h-full min-h-[250px]",
                        isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:bg-muted/50",
                        startFromScratch ? "opacity-50 grayscale" : "opacity-100"
                    )}
                >
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                        <Upload className={cn("w-8 h-8", isDragOver ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        Importer des documents
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                        CV, notes, anciens rapports... (PDF, Word, Images)
                    </p>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) {
                                onFilesChange([...files, ...Array.from(e.target.files)])
                                onStartFromScratchChange(false)
                            }
                        }}
                    />
                </div>

                {/* Start from Scratch Zone */}
                <div
                    onClick={() => {
                        onStartFromScratchChange(!startFromScratch)
                        if (!startFromScratch) onFilesChange([])
                    }}
                    className={cn(
                        "border-2 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer h-full min-h-[250px]",
                        startFromScratch
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "border-muted hover:border-primary/50 hover:bg-muted/50"
                    )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-200",
                        startFromScratch ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                        <FilePlus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        Partir de zéro
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                        Je n'ai pas de documents, je veux commencer la rédaction directement.
                    </p>
                    {startFromScratch && <div className="text-primary font-medium text-sm flex items-center gap-2 animate-in fade-in zoom-in"><Check className="w-4 h-4" /> Sélectionné</div>}
                </div>
            </div>

            {files.length > 0 && !startFromScratch && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fichiers sélectionnés</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center p-3 bg-card border rounded-lg group relative overflow-hidden">
                                <FileText className="w-8 h-8 text-primary/80 mr-3" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(idx)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
