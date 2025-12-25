import { Download, FileEdit, Lightbulb, Sparkles } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Racontez votre expérience",
    description: "Décrivez simplement ce que vous avez fait en stage. Vos notes, vos souvenirs, même en vrac.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Obtenez un plan structuré",
    description: "DocWise organise vos idées selon les standards de votre école (BTS, Licence ou Master).",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    number: "03",
    icon: FileEdit,
    title: "Rédigez avec fluidité",
    description: "Nos suggestions vous aident à trouver le ton juste et le vocabulaire professionnel adéquat.",
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
  },
  {
    number: "04",
    icon: Download,
    title: "Imprimez avec fierté",
    description: "Téléchargez votre document parfaitement mis en page. Il est prêt à être relié et rendu.",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
  }
]

export default function HowItWorks() {
  return (
    <section id="comment-ça-marche" className="py-32 bg-secondary/30 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Du brouillon au <span className="text-primary">chef-d'œuvre</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Un processus simple qui respecte votre style tout en sublimant votre travail.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Center Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border transform -translate-x-1/2 dashed-line" />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3 justify-center md:justify-start">
                    <span className="flex md:hidden w-8 h-8 rounded-full bg-primary/10 items-center justify-center text-sm text-primary">{step.number}</span>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{step.description}</p>
                </div>

                {/* Icon/Marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-6`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}