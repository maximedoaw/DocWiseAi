import { Download, FileEdit, Lightbulb, Sparkles, MoveRight, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Partagez vos idées",
    description: "Confiez-nous vos notes, vos réflexions, ou même de simples souvenirs de stage. Chaque détail compte.",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/20 dark:to-gray-900/30",
    borderColor: "border-amber-200/60 dark:border-amber-800/40",
    delay: 0,
    pattern: "diagonal"
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Structure sur mesure",
    description: "DocWise élabore un plan académique solide, parfaitement adapté aux exigences de vos professeurs.",
    color: "text-blue-800 dark:text-blue-300",
    bgColor: "bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-950/20 dark:to-gray-900/30",
    borderColor: "border-blue-200/60 dark:border-blue-800/40",
    delay: 0.1,
    pattern: "grid"
  },
  {
    number: "03",
    icon: FileEdit,
    title: "Rédaction assistée",
    description: "L'IA vous accompagne pas à pas, suggérant des formulations élégantes tout en préservant votre style.",
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-gradient-to-br from-rose-50/40 to-white dark:from-rose-950/20 dark:to-gray-900/30",
    borderColor: "border-rose-200/60 dark:border-rose-800/40",
    delay: 0.2,
    pattern: "dots"
  },
  {
    number: "04",
    icon: Download,
    title: "Rapport accompli",
    description: "Téléchargez votre document final impeccablement mis en page, prêt à faire forte impression.",
    color: "text-emerald-800 dark:text-emerald-300",
    bgColor: "bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-gray-900/30",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
    delay: 0.3,
    pattern: "lines"
  }
]

const PatternBackground = ({ type, className }: { type: string, className?: string }) => {
  if (type === "diagonal") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="diagonal-step" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 20L20 0" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#diagonal-step)" />
      </svg>
    )
  }

  if (type === "grid") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="grid-step" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M15 0H0V15" stroke="currentColor" strokeWidth="0.3" opacity="0.08" fill="none" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-step)" />
      </svg>
    )
  }

  if (type === "dots") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="dots-step" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots-step)" />
      </svg>
    )
  }

  if (type === "lines") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="lines-step" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10H20" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#lines-step)" />
      </svg>
    )
  }

  return null
}

export default function HowItWorks() {
  return (
    <section id="comment-ça-marche" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Texture de papier subtile */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=\'100\'_height=\'100\'_viewBox=\'0 0 100 100\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M11_18c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm48_25c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm-43-7c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm63_31c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM34_90c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm56-76c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM12_86c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm28-65c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm23-11c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-6_60c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm29_22c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zM32_63c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm57-13c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-9-21c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2 2 .895_2_2_2zM60_91c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM35_41c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM12_60c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2z\'_fill=\'%23f0f0f0\'_fill-opacity=\'0.03\'_fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-30 dark:opacity-10" />

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-8"
          >
            <div className="absolute -top-2 -left-4 w-10 h-10 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
            <div className="absolute -bottom-2 -right-4 w-10 h-10 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />
            <span className="text-sm font-medium tracking-[0.3em] uppercase text-foreground/70 px-6 py-2">
              Le Chemin de la Réussite
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-[1.1] mb-6"
          >
            <span className="font-light">Une méthode</span>
            <br />
            <span className="italic text-primary font-normal">claire et sereine</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Ligne de connexion manuscrite (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-current/10 -z-10" />

          {steps.map((step, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay, duration: 0.7 }}
              className="group relative"
            >
              <div className={cn(
                "h-full relative rounded-2xl border transition-all duration-500",
                "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)]",
                step.bgColor,
                step.borderColor,
                "hover:shadow-xl group-hover:border-current/40"
              )}>
                <PatternBackground type={step.pattern} className="text-current opacity-5 dark:opacity-10" />

                <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center bg-white/60 dark:bg-gray-900/40 shadow-sm border border-white/50",
                      "transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    )}>
                      <step.icon className={cn("w-8 h-8", step.color)} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif italic text-sm shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-light text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 text-center"
        >
          <Link href="/sign-up">
            <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-serif italic font-medium shadow-xl transition-all hover:scale-105 bg-primary text-primary-foreground">
              Commencer l'aventure <MoveRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}