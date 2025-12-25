import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Info } from "lucide-react"

const plans = [
  {
    name: "Découverte",
    price: "0€",
    description: "Pour tester et réaliser un premier petit projet.",
    features: [
      "1 projet inclus",
      "Templates de base",
      "Export PDF (avec filigrane)",
      "Aide communautaire"
    ],
    cta: "Créer un compte gratuit",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Réussite",
    price: "9.90€",
    period: "/mois",
    description: "L'outil complet pour viser le 20/20.",
    features: [
      "Projets illimités",
      "Tous les templates (BTS, Licence, Master)",
      "Exports propres (Word & PDF)",
      "Suggestions de reformulation IA",
      "Support prioritaire"
    ],
    cta: "Débloquer l'assistant",
    popular: true,
    variant: "default" as const
  }
]

export default function Pricing() {
  return (
    <section id="tarifs" className="py-32 bg-secondary/20 border-t border-border/50 overflow-hidden relative">
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Un investissement pour <span className="text-primary relative inline-block">
              votre diplôme
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Moins cher qu'un prof particulier, et disponible 24h/24.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all ${plan.popular
                  ? 'bg-card border-2 border-primary shadow-2xl scale-105 z-10'
                  : 'bg-card/50 border border-border/50 hover:bg-card'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Le choix des étudiants
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground min-h-[50px]">{plan.description}</p>
                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-foreground/80 leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link href="/sign-up" className="block">
                <Button
                  size="lg"
                  variant={plan.variant}
                  className="w-full h-12 rounded-xl text-lg"
                >
                  {plan.cta}
                </Button>
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> Sans engagement, annulable à tout moment
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}