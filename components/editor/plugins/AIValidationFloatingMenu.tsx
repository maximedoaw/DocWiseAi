"use client"

import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AIValidationFloatingMenuProps {
    show: boolean
    onAccept: () => void
    onReject: () => void
    position?: { top: number; left: number } | null
}

export function AIValidationFloatingMenu({ show, onAccept, onReject, position }: AIValidationFloatingMenuProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    drag
                    dragMomentum={false}
                    dragConstraints={{ left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight }} // Constrain to viewport
                    whileDrag={{ cursor: 'grabbing' }}
                    className="fixed z-50 flex items-center gap-2 p-1.5 bg-background/90 backdrop-blur-md border shadow-lg rounded-full cursor-grab"
                    style={position ? {
                        top: position.top,
                        left: position.left,
                        transform: 'translate(-50%, -100%)' // Center horizontally, place above
                    } : {
                        top: '50%',
                        right: '2rem',
                        transform: 'translateY(-50%)'
                    }}
                >
                    <div className="pl-3 pr-2 text-sm font-medium text-muted-foreground select-none">
                        Tout valider ?
                    </div>


                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={onReject}
                            title="Rejeter (Annuler)"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 w-8 rounded-full p-0 bg-green-600 hover:bg-green-700 text-white"
                            onClick={onAccept}
                            title="Accepter"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
