"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface InternshipData {
    companyName: string
    domains: string[]
    duration: string
    role: string
    objective: string
}

interface InternshipInfoFormProps {
    data: InternshipData
    onChange: (data: InternshipData) => void
}

import { TagInput } from "@/components/ui/tag-input"

export function InternshipInfoForm({ data, onChange }: InternshipInfoFormProps) {
    const handleChange = (field: keyof InternshipData, value: any) => {
        onChange({ ...data, [field]: value })
    }

    return (
        <div className="grid gap-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                        id="companyName"
                        placeholder="Ex: Google, Start-up locale..."
                        value={data.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="domains">Domaine / Activité</Label>
                    <TagInput
                        id="domains"
                        placeholder="Ex: Dev Web, Marketing (Entrée pour ajouter)"
                        value={data.domains}
                        onChange={(val) => handleChange("domains", val)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="duration">Durée du stage</Label>
                    <Select
                        value={data.duration}
                        onValueChange={(val) => handleChange("duration", val)}
                    >
                        <SelectTrigger id="duration">
                            <SelectValue placeholder="Sélectionner une durée" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-2">1 à 2 mois</SelectItem>
                            <SelectItem value="3-4">3 à 4 mois</SelectItem>
                            <SelectItem value="5-6">5 à 6 mois</SelectItem>
                            <SelectItem value="6+">Plus de 6 mois</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Intitulé du poste</Label>
                    <Input
                        id="role"
                        placeholder="Ex: Développeur Fullstack Junior"
                        value={data.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="objective">Objectif principal du stage(Votre theme)</Label>
                <Textarea
                    id="objective"
                    placeholder="Ex: Découvrir le monde de l'entreprise et appliquer mes compétences en React..."
                    className="min-h-[100px]"
                    value={data.objective}
                    onChange={(e) => handleChange("objective", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Ceci aidera l'IA à comprendre le contexte global de votre rapport.
                </p>
            </div>
        </div>
    )
}
