"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function PageThumbnail({ content, title, onClick, isActive }: { content: string, title?: string, onClick?: () => void, isActive: boolean }) {
    // A4 aspect ratio 210mm x 297mm = ~0.707
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative w-20 mx-auto bg-white rounded-md shadow-sm border transition-all duration-200 cursor-pointer overflow-hidden",
                isActive ? "ring-2 ring-primary border-primary shadow-md scale-[1.02]" : "hover:border-primary/50 hover:shadow-md"
            )}
            style={{ aspectRatio: '210/297' }}
        >
            {/* Scaled Preview */}
            <div className="absolute inset-0 overflow-hidden bg-white">
                <div className="origin-top-left transform scale-[0.1] w-[210mm] h-[297mm] p-[20mm] bg-white text-black">
                    <div
                        className="prose max-w-none text-[12px] leading-snug"
                        dangerouslySetInnerHTML={{ __html: content || "" }}
                    />
                </div>
            </div>

            {/* Interaction Overlay */}
            <div className={cn("absolute inset-0 transition-colors", isActive ? "bg-primary/5" : "group-hover:bg-black/5")} />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-1">
                <p className={cn("text-[8px] truncate text-center", isActive ? "font-medium text-primary" : "text-muted-foreground")}>
                    {title || "Page"}
                </p>
            </div>
        </div>
    )
}
