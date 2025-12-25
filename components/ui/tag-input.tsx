"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
}

export function TagInput({ value, onChange, placeholder, className, ...props }: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1)
        }
    }

    const addTag = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInputValue("")
        }
    }

    const removeTag = (index: number) => {
        const newValue = [...value]
        newValue.splice(index, 1)
        onChange(newValue)
    }

    return (
        <div className={cn("flex flex-col gap-2 p-3 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background transition-all", className)}>
            <div className="flex flex-wrap gap-2">
                {value.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1 text-sm py-1 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 animate-in zoom-in duration-200">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="rounded-full hover:bg-amber-500/20 p-0.5 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="flex gap-2 items-center">
                <input
                    className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground min-w-[200px] text-sm py-1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    // onBlur={addTag} // Removed onBlur to allow clicking away without adding incomplete thoughts, or keep it? User asked for button validation. Let's keep manual or Enter.
                    placeholder={value.length === 0 ? placeholder : "Ajouter une autre..."}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addTag}
                    disabled={!inputValue.trim()}
                    className={cn("h-8 w-8 p-0 rounded-full", inputValue.trim() ? "text-primary hover:bg-primary/10" : "text-muted-foreground")}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
