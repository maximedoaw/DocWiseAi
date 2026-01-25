import { Library, Sparkles, Heart, CheckCircle2, Calendar, Download } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Library,
    title: "Structures Académiques",
    description: "Des plans rigoureux pour BTS, Licence et Master, validés selon les normes académiques en vigueur.",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/20 dark:to-gray-900/30",
    borderColor: "border-amber-200/60 dark:border-amber-800/40",
    delay: 0,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "diagonal"
  },
  {
    icon: Sparkles,
    title: "Analyse de Terrain",
    description: "Une aide précieuse pour transformer vos missions quotidiennes en analyses professionnelles pertinentes.",
    color: "text-blue-800 dark:text-blue-300",
    bgColor: "bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-950/20 dark:to-gray-900/30",
    borderColor: "border-blue-200/60 dark:border-blue-800/40",
    delay: 0.1,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "grid"
  },
  {
    icon: Heart,
    title: "Bilan Serein",
    description: "Rédigez votre conclusion et vos remerciements avec humanité et intelligence, étape par étape.",
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-gradient-to-br from-rose-50/40 to-white dark:from-rose-950/20 dark:to-gray-900/30",
    borderColor: "border-rose-200/60 dark:border-rose-800/40",
    delay: 0.15,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "dots"
  },
  {
    icon: CheckCircle2,
    title: "Mise en page Fine",
    description: "Exportations PDF et Word impeccables, avec une typographie soignée prête pour la reliure.",
    color: "text-emerald-800 dark:text-emerald-300",
    bgColor: "bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-gray-900/30",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
    delay: 0.2,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "lines"
  },
  {
    icon: Calendar,
    title: "Gestion d&apos;Échéance",
    description: "Organisez votre temps de rédaction pour éviter la précipitation des derniers jours avant le rendu.",
    color: "text-violet-800 dark:text-violet-300",
    bgColor: "bg-gradient-to-br from-violet-50/40 to-white dark:from-violet-950/20 dark:to-gray-900/30",
    borderColor: "border-violet-200/60 dark:border-violet-800/40",
    delay: 0.25,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "cross"
  },
  {
    icon: Download,
    title: "Correction de Style",
    description: "Une relecture IA qui gomme les maladresses pour un ton académique juste et professionnel.",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-gradient-to-br from-orange-50/40 to-white dark:from-orange-950/20 dark:to-gray-900/30",
    borderColor: "border-orange-200/60 dark:border-orange-800/40",
    delay: 0.3,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    pattern: "waves"
  },
]

const PatternBackground = ({ type, className }: { type: string, className?: string }) => {
  if (type === "diagonal") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-diagonal" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 20L20 0" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-diagonal)" />
      </svg>
    )
  }

  if (type === "grid") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-grid" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M15 0H0V15" stroke="currentColor" strokeWidth="0.3" opacity="0.08" fill="none" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-grid)" />
      </svg>
    )
  }

  if (type === "dots") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-dots)" />
      </svg>
    )
  }

  if (type === "lines") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-lines" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10H20" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-lines)" />
      </svg>
    )
  }

  if (type === "cross") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-cross" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-cross)" />
      </svg>
    )
  }

  if (type === "waves") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="feat-waves" width="30" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5C5 0 10 10 15 5S25 0 30 5" stroke="currentColor" strokeWidth="0.5" opacity="0.1" fill="none" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#feat-waves)" />
      </svg>
    )
  }

  return null
}

export default function Features() {
  return (
    <section id="fonctionnalités" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Texture de papier subtile en arrière-plan */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=\'100\'_height=\'100\'_viewBox=\'0 0 100 100\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M11_18c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm48_25c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm-43-7c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm63_31c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM34_90c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm56-76c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM12_86c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm28-65c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm23-11c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-6_60c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm29_22c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zM32_63c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm57-13c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-9-21c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2 2 .895_2_2_2zM60_91c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM35_41c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM12_60c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2z\'_fill=\'%23f0f0f0\'_fill-opacity=\'0.03\'_fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-30 dark:opacity-10" />

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        {/* Header avec accent calligraphique */}
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
              L'art de bien écrire
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-[1.1] mb-6"
          >
            <span className="font-light">Votre plume</span>
            <br />
            <span className="italic text-primary font-normal">naturellement libérée</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
          >
            Une approche humaine de la technologie, où chaque fonctionnalité
            est pensée comme un compagnon d'écriture.
          </motion.p>
        </div>

        {/* Grille de cartes artisanales */}
        <div className="grid grid-cols-12 gap-5 md:gap-7">
          {features.map((feature, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: feature.delay,
                duration: 0.7,
                ease: [0.19, 1, 0.22, 1]
              }}
              whileHover={{
                y: -6,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }
              }}
              className={cn(
                "group relative overflow-hidden",
                "transform-gpu",
                feature.span
              )}
            >
              {/* Fond avec texture */}
              <div className={cn(
                "h-full relative rounded-xl md:rounded-2xl",
                "border transition-all duration-500",
                "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.2)]",
                "hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]",
                feature.bgColor,
                feature.borderColor,
                "group-hover:border-current/40 group-hover:border-opacity-30"
              )}>
                {/* Pattern subtil */}
                <PatternBackground type={feature.pattern} className="text-current opacity-5 dark:opacity-10" />

                {/* Effet de papier froissé */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-black/5 pointer-events-none" />

                {/* Contenu */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                  {/* En-tête avec numéro manuscrit */}
                  <div className="flex items-start justify-between mb-6 md:mb-8">
                    <div className="relative">
                      <div className={cn(
                        "w-14 h-14 rounded-lg md:rounded-xl",
                        "flex items-center justify-center",
                        "transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        "bg-white/60 dark:bg-gray-900/40",
                        "shadow-sm border border-white/50 dark:border-gray-800/50"
                      )}>
                        <feature.icon
                          className={cn(
                            "w-6 h-6 md:w-7 md:h-7 transition-all duration-500",
                            feature.color
                          )}
                        />
                      </div>
                      {/* Trait de plume décoratif */}
                      <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-current" viewBox="0 0 24 24">
                          <path d="M3 17C6 14 9 11 12 8L21 17" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
                        </svg>
                      </div>
                    </div>

                    {/* Numéro manuscrit */}
                    <div className="relative">
                      <span className="text-2xl md:text-3xl font-serif text-current/20 dark:text-current/30 font-light">
                        0{index + 1}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-serif text-current/60 font-medium">
                          0{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Corps du texte */}
                  <div className="flex-1 space-y-4 md:space-y-5 mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground tracking-tight leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-light text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>

                  {/* Ligne de séparation artisanale */}
                  <div className="mt-auto pt-4 md:pt-6 border-t border-current/10 dark:border-current/20">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current/20 to-transparent" />
                      <svg className="w-4 h-4 text-current/40" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current/20 to-transparent" />
                    </div>

                    {/* Note manuscrite */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/60 font-light italic">
                        pensée pour vous
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 h-1 rounded-full transition-all duration-300",
                              "bg-current/30 group-hover:bg-current/60",
                              i === 0 ? "group-hover:translate-y-1" :
                                i === 2 ? "group-hover:translate-y-1" : ""
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Éclat de lumière au survol */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-700 pointer-events-none",
                  "bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5"
                )} />
              </div>

              {/* Ombre portée subtile */}
              <div className="absolute inset-0 rounded-xl md:rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.article>
          ))}
        </div>

        {/* Note finale calligraphiée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-20 md:mt-28 max-w-xl mx-auto relative"
        >
          {/* Encadrement décoratif */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l border-t border-primary/30 rounded-tl" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-r border-t border-primary/30 rounded-tr" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l border-b border-primary/30 rounded-bl" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r border-b border-primary/30 rounded-br" />

          <div className="relative">
            <Heart className="w-6 h-6 mx-auto mb-4 text-rose-500/60 animate-pulse" />
            <p className="text-muted-foreground font-serif italic text-lg leading-relaxed">
              « Parce que chaque mot mérite d'être écrit avec soin et attention. »
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-foreground/20" />
              <span className="text-xs text-muted-foreground/50 font-light">l'équipe Plume</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-foreground/20" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}