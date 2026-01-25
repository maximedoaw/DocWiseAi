import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Info } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Découverte",
    price: "0",
    description: "Idéal pour explorer DocWise et faire briller vos premières idées.",
    features: [
      "1 projet complet",
      "Éditeur intelligent",
      "Templates standards",
      "Aperçu temps réel"
    ],
    cta: "Essayer gratuitement",
    popular: false,
    variant: "ghost" as const
  },
  {
    name: "Excellence",
    price: "6 500",
    period: "/mois",
    description: "L&apos;arsenal complet pour transformer votre stage en mention.",
    features: [
      "Projets illimités",
      "IA générative premium",
      "Tous les templates (BTS à Master)",
      "Exports PDF & Word sans filigrane",
      "Support prioritaire 24/7"
    ],
    cta: "Obtenir mon diplôme",
    popular: true,
    variant: "default" as const
  }
]

const PatternBackground = ({ type, className }: { type: string, className?: string }) => {
  if (type === "dots") {
    return (
      <svg className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}>
        <pattern id="pricing-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#pricing-dots)" />
      </svg>
    )
  }
  return null
}

export default function Pricing() {
  return (
    <section id="tarifs" className="py-24 md:py-48 relative overflow-hidden bg-transparent">
      {/* Background Harmonization */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-24 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative inline-block"
          >
            <div className="absolute -top-2 -left-4 w-8 h-8 border-l border-t border-primary/20 rounded-tl-lg" />
            <div className="absolute -bottom-2 -right-4 w-8 h-8 border-r border-b border-primary/20 rounded-br-lg" />
            <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-foreground/70 px-6 py-2">
              Un investissement pour l&apos;avenir
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-[1.1]"
          >
            Le compagnon <br />
            <span className="italic text-primary font-normal">de votre carrière.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto"
          >
            Un tarif juste pour un avenir brillant. Sans engagement, avec tout l&apos;accompagnement
            dont vous avez besoin pour obtenir votre mention.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col p-8 md:p-12 rounded-3xl border transition-all duration-500 overflow-hidden",
                "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)]",
                plan.popular
                  ? "bg-card border-primary/30 shadow-2xl shadow-primary/10 scale-105 z-10"
                  : "bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm border-border/60"
              )}
            >
              <PatternBackground type="dots" className="text-primary opacity-[0.03]" />

              {plan.popular && (
                <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Recommandé
                </div>
              )}

              <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-serif font-medium text-foreground mb-3">{plan.name}</h3>
                <p className="text-muted-foreground text-base font-light leading-relaxed mb-8">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-serif font-light text-foreground tracking-tighter">{plan.price}</span>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-primary uppercase tracking-wide">FCFA</span>
                    {plan.period && <span className="text-xs font-light text-muted-foreground uppercase tracking-widest">{plan.period}</span>}
                  </div>
                </div>
              </div>

              <div className="flex-1 mb-12 relative z-10">
                <ul className="space-y-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                        plan.popular ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-foreground/80 font-light text-base">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 relative z-10">
                <Link href="/sign-up" className="block w-full">
                  <Button
                    size="lg"
                    variant={plan.variant}
                    className={cn(
                      "w-full h-14 rounded-xl text-lg font-serif italic font-medium transition-all hover:scale-[1.02]",
                      plan.popular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/50 hover:bg-muted text-foreground border border-border/50"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-light">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                  Accès instantané après paiement
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}