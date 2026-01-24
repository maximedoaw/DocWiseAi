"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { PageContainer } from "./PageContainer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CustomEditorProps {
    projectId: Id<"projects">
    pages: any[]
    onPageSelect: (id: string) => void
    onPagesChange?: (pages: any[]) => void
}

export const CustomEditor = forwardRef<any, CustomEditorProps>(({ projectId, pages: initialPages, onPageSelect, onPagesChange }, ref) => {
    // Local state for pages to allow instant UI updates
    const [pages, setPages] = useState<any[]>(initialPages)
    const [activePageId, setActivePageId] = useState<string | null>(initialPages[0]?.id || null)
    const [aiDraft, setAiDraft] = useState<{ content: string, pageId: string } | null>(null)

    // Refs for accessing page components
    const pageRefs = useRef<{ [key: string]: any }>({})
    const containerRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const updatePageContent = useMutation(api.projects.updatePageContent)
    const addPage = useMutation(api.projects.addPage)
    const deletePage = useMutation(api.projects.deletePage)

    const [isSaving, setIsSaving] = useState(false)

    // Scroll Sync Logic
    useEffect(() => {
        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            // Find the entry with the highest intersection ratio
            const visibleEntry = entries.reduce((prev, current) => {
                return (prev.intersectionRatio > current.intersectionRatio) ? prev : current
            })

            if (visibleEntry.isIntersecting && visibleEntry.intersectionRatio > 0.3) {
                // Extract ID from page-ID (e.g. "page-page-123" -> "page-123")
                // Usually ID is "page-123", result of id=`page-${id}` is "page-page-123"
                // We want to remove ONLY the FIRST "page-" prefix.
                const pageId = visibleEntry.target.id.startsWith('page-') ? visibleEntry.target.id.substring(5) : visibleEntry.target.id;
                if (pageId && pageId !== activePageId) {
                    // We need to be careful not to trigger a scroll loop if we just clicked.
                    // But since this is purely "active state" update, it should be fine.
                    // However, onPageSelect might trigger routing.

                    // To avoid jitter, we can check if it's "mostly" visible?
                    // The threshold 0.3 means 30% visible.

                    // Let's set it.
                    setActivePageId(pageId)
                    onPageSelect(pageId)
                }
            }
        }

        observerRef.current = new IntersectionObserver(handleIntersect, {
            root: containerRef.current, // Use the editor container as viewport
            threshold: [0.3, 0.5, 0.7] // Check at multiple thresholds
        })

        // Observe all pages
        pages.forEach(page => {
            const el = document.getElementById(`page-${page.id}`)
            if (el) observerRef.current?.observe(el)
        })

        return () => {
            observerRef.current?.disconnect()
        }
    }, [pages, activePageId, onPageSelect]) // re-run if pages change

    // Sync from props (Convex Real-time)
    useEffect(() => {
        if (JSON.stringify(initialPages) !== JSON.stringify(pages)) {
            setPages(initialPages)
        }
    }, [initialPages])

    useImperativeHandle(ref, () => ({
        save: async () => {
            // Save all dirty pages? Or just active?
            // For now save active
            if (activePageId) {
                const content = pageRefs.current[activePageId]?.getContent()
                if (content) {
                    setIsSaving(true)
                    await updatePageContent({ projectId, pageId: activePageId, content })
                    setIsSaving(false)
                }
            }
        },
        insertHTML: (htmlString: string) => {
            if (!activePageId) return

            const pageHandle = pageRefs.current[activePageId]
            if (!pageHandle) return

            // 1. Ensure the page is focused
            pageHandle.focus()

            // 2. Try to use execCommand for cursor-insertion
            const success = document.execCommand('insertHTML', false, htmlString)

            if (!success) {
                // Fallback to append if execCommand fails (e.g. no selection even after focus)
                const wrapper = document.createElement('div')
                wrapper.innerHTML = htmlString
                const nodes = Array.from(wrapper.childNodes)
                pageHandle.appendNodes(nodes)
            }

            // 3. Sync state
            const newContent = pageHandle.getContent()
            handleContentChange(activePageId, newContent)
        },
        insertAIDraft: (htmlString: string) => {
            if (!activePageId) return
            setAiDraft({ content: htmlString, pageId: activePageId })
        },
        scrollToPage: (pageId: string) => {
            const pageEl = pageRefs.current[pageId]
            if (pageEl) {
                // We can access DOM node if we expose it or use id
                // Actually pageRefs store PageContainer imperative handle.
                // Let's add scrollIntoView to PageContainer handle or just use ID
                // Easier: document.getElementById using the ID we know
                const el = document.getElementById(`page-${pageId}`)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setActivePageId(pageId)
                    // onPageSelect(pageId) // Update URL? Yes. But wait, if we scroll to it, the observer will pick it up anyway?
                    // Explicit select is good.
                    onPageSelect(pageId)
                }
            }
        }
    }))

    const handleContentChange = (pageId: string, html: string) => {
        // Update local state
        const newPages = pages.map(p => p.id === pageId ? { ...p, content: html } : p)
        setPages(newPages)

        // Notify parent for real-time sidebar updates
        if (onPagesChange) {
            onPagesChange(newPages)
        }

        // Debounced auto-save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        setIsSaving(true)
        saveTimeoutRef.current = setTimeout(async () => {
            await updatePageContent({ projectId, pageId, content: html })
            setIsSaving(false)
        }, 2000)
    }

    const handleOverflow = async (sourcePageId: string, overflowNodes: Node[]) => {
        const index = pages.findIndex(p => p.id === sourcePageId)
        if (index === -1) return

        if (index < pages.length - 1) {
            // Move to next page
            const nextPage = pages[index + 1]
            if (pageRefs.current[nextPage.id]) {
                pageRefs.current[nextPage.id].prependNodes(overflowNodes)
                handleContentChange(nextPage.id, pageRefs.current[nextPage.id].getContent())
            }
        } else {
            // Create new page first, then add overflow content
            const newTitle = "Nouvelle Page"

            // Create page in backend first
            const realId = await addPage({ projectId, title: newTitle })

            if (realId) {
                // Add page to local state with real ID
                const newPage = { id: realId, title: newTitle, content: "" }
                setPages(prev => [...prev, newPage])

                // Wait for React to render the new page, then prepend overflow nodes
                setTimeout(() => {
                    if (pageRefs.current[realId]) {
                        pageRefs.current[realId].prependNodes(overflowNodes)
                        handleContentChange(realId, pageRefs.current[realId].getContent())
                    }
                }, 100)
            }
        }
    }

    const handleUnderflow = (pageId: string) => {
        const index = pages.findIndex(p => p.id === pageId)
        if (index === -1 || index === pages.length - 1) return

        const nextPage = pages[index + 1]
        const nextHandle = pageRefs.current[nextPage.id]
        if (nextHandle) {
            const pulledNode = nextHandle.pullFirstNode()
            if (pulledNode) {
                pageRefs.current[pageId].appendNodes([pulledNode])
                handleContentChange(pageId, pageRefs.current[pageId].getContent())

                // If next page is now empty, delete it
                const nextContent = nextHandle.getContent()
                if (nextContent.trim() === "" || nextContent === "<p><br></p>") {
                    const newPages = pages.filter(p => p.id !== nextPage.id)
                    setPages(newPages)
                    deletePage({ projectId, pageId: nextPage.id })
                    if (onPagesChange) onPagesChange(newPages)
                }
            }
        }
    }

    const handleBackspace = (pageId: string) => {
        // Merge with previous page if empty?
        const index = pages.findIndex(p => p.id === pageId)
        if (index > 0) {
            const prevPage = pages[index - 1]
            if (pageRefs.current[prevPage.id]) {
                pageRefs.current[prevPage.id].focusEnd()
            }
        }
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 flex flex-col bg-muted/10 items-center overflow-y-auto p-4 sm:p-8 pb-32"
        >
            {pages.map((page, i) => (
                <PageContainer
                    key={page.id}
                    id={page.id}
                    ref={(el) => pageRefs.current[page.id] = el}
                    title={page.title}
                    content={page.content}
                    pageNumber={i + 1}
                    isActive={activePageId === page.id}
                    onContentChange={(html) => handleContentChange(page.id, html)}
                    onFocus={() => {
                        setActivePageId(page.id)
                        onPageSelect(page.id)
                    }}
                    onOverflow={(nodes) => handleOverflow(page.id, nodes)}
                    onUnderflow={() => handleUnderflow(page.id)}
                    onBackspaceFromStart={() => handleBackspace(page.id)}
                    aiDraft={aiDraft?.pageId === page.id ? {
                        content: aiDraft?.content || "",
                        onAccept: () => {
                            if (!aiDraft) return
                            const html = aiDraft.content
                            const targetTag = aiDraft.targetTagName
                            setAiDraft(null)
                            setTimeout(() => {
                                const handle = pageRefs.current[page.id]
                                if (handle) {
                                    if (targetTag) {
                                        // Replacement logic for tagged section
                                        const currentHTML = handle.getContent()
                                        const parser = new DOMParser()
                                        const doc = parser.parseFromString(currentHTML, 'text/html')
                                        const headings = Array.from(doc.querySelectorAll('h1, h2, h3'))
                                        const target = headings.find(h => h.textContent === targetTag)

                                        if (target) {
                                            // Remove section content
                                            let next = target.nextElementSibling
                                            while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
                                                const toRemove = next
                                                next = next.nextElementSibling
                                                toRemove.remove()
                                            }
                                            // Replace header itself or insert before? 
                                            // Usually AI returns the whole section including header.
                                            const wrapper = document.createElement('div')
                                            wrapper.innerHTML = html
                                            target.replaceWith(...Array.from(wrapper.childNodes))
                                        } else {
                                            // If target tag not found, append as usual
                                            const wrapper = document.createElement('div')
                                            wrapper.innerHTML = html
                                            handle.appendNodes(Array.from(wrapper.childNodes))
                                        }
                                    } else {
                                        const wrapper = document.createElement('div')
                                        wrapper.innerHTML = html
                                        handle.appendNodes(Array.from(wrapper.childNodes))
                                    }
                                    handleContentChange(page.id, handle.getContent())
                                }
                            }, 0)
                        },
                        onReject: () => setAiDraft(null)
                    } : undefined}
                />
            ))}

            <div className="mt-8 flex flex-col items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => addPage({ projectId, title: "Nouvelle Page" })}
                >
                    <Plus className="w-4 h-4 mr-2" /> Ajouter une page
                </Button>
                {isSaving && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                        Enregistrement...
                    </span>
                )}
            </div>
        </div>
    )
})
CustomEditor.displayName = "CustomEditor"
