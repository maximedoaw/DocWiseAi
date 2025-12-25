"use client"

import { AnimatePresence, motion } from "framer-motion"
import { PropsWithChildren } from "react"

export function StepTransition({ children }: PropsWithChildren) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    )
}
