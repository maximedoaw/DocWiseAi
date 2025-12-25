"use client"

import { Rocket } from "lucide-react"
import { TagInput } from "@/components/ui/tag-input"
import { Label } from "@/components/ui/label"

interface MissionsInputProps {
    missions: string[]
    onChange: (missions: string[]) => void
}

export function MissionsInput({ missions, onChange }: MissionsInputProps) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                    <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">Le cerveau de votre rapport</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Listez vos missions principales. Appuyez sur <strong>Entrée</strong> ou <strong>Espace</strong> pour ajouter une mission.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Label>Liste des missions</Label>
                <TagInput
                    value={missions}
                    onChange={onChange}
                    placeholder="Ajouter une mission (ex: Gestion de projet, Dév API...)"
                    className="min-h-[150px] items-start content-start"
                />
            </div>
        </div>
    )
}
