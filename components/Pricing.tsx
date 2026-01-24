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

export default function Pricing() {
  return (
    <section id="tarifs" className="py-24 md:py-48 relative overflow-hidden bg-transparent">
      {/* Background Harmonization */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
      {/* Dynamic light accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-32 space-y-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none"
          >
            Le meilleur allié <br />
            <span className="text-primary italic">de votre carrière.</span>
          </motion.h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Un tarif juste pour un avenir brillant. Sans engagement, résiliable en un clic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={cn(
                "relative flex flex-col p-10 md:p-14 rounded-[3.5rem] border transition-all duration-700 hover:shadow-2xl overflow-hidden",
                plan.popular
                  ? "bg-card border-primary/40 shadow-2xl shadow-primary/10 scale-105 z-10"
                  : "bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/20"
              )}
            >
              {plan.popular && (
                <div className="absolute top-8 right-8 bg-primary text-primary-foreground px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  Populaire
                </div>
              )}

              <div className="mb-12">
                <h3 className="text-3xl font-black text-foreground mb-4">{plan.name}</h3>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">{plan.description}</p>
                <div className="flex items-baseline gap-2 mt-10">
                  <span className="text-6xl font-black text-foreground tracking-tighter">{plan.price}</span>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-primary">FCFA</span>
                    {plan.period && <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{plan.period}</span>}
                  </div>
                </div>
              </div>

              <div className="flex-1 mb-14">
                <ul className="space-y-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110",
                        plan.popular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="w-3.5 h-3.5 stroke-[4]" />
                      </div>
                      <span className="text-foreground/90 font-semibold text-lg">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <Link href="/sign-up" className="block w-full">
                  <Button
                    size="lg"
                    variant={plan.variant}
                    className={cn(
                      "w-full h-16 rounded-[2rem] text-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl",
                      plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20" : "bg-muted/50 hover:bg-muted text-foreground border border-border/50"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Paiement sécurisé par Stripe
                </div>
              </div>

              {/* Decorative accent for popular card */}
              {plan.popular && (
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Comparison Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mt-20 text-muted-foreground text-sm font-medium"
        >
          Des questions sur nos offres ? <span className="text-foreground underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">Discutez avec un conseiller.</span>
        </motion.p>
      </div>
    </section>
  )
}