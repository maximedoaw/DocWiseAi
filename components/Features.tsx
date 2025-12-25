import { BookOpen, Calendar, CheckCircle2, FileText, Heart, Library } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Library,
    title: "Modèles Universitaires",
    description: "Accédez à une bibliothèque de templates validés par des enseignants pour BTS, Licence et Master.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    delay: 0.1,
  },
  {
    icon: FileText,
    title: "Rédaction Fluide",
    description: "Des phrases d'amorces et des connecteurs logiques pour ne jamais manquer d'inspiration.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    delay: 0.2,
  },
  {
    icon: Heart,
    title: "Sans Stress",
    description: "Un accompagnement bienveillant qui transforme une corvée en une simple check-list.",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    delay: 0.3,
  },
  {
    icon: CheckCircle2,
    title: "Correction Instantanée",
    description: "Orthographe, grammaire et syntaxe vérifiées en temps réel pour un rendu impeccable.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    delay: 0.4,
  },
  {
    icon: Calendar,
    title: "Planning Automatique",
    description: "Nous générons un planning rétroactif pour être sûr de rendre votre devoir à l'heure.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    delay: 0.5,
  },
  {
    icon: BookOpen,
    title: "Export Pro",
    description: "PDF ou Word, votre document sort parfaitement mis en page, prêt à être relié.",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    delay: 0.6,
  },
]

export default function Features() {
  return (
    <section id="fonctionnalités" className="py-32 relative overflow-hidden bg-background">
      <div className="container relative z-10 px-6 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Tout pour <span className="text-primary">votre réussite</span>
            <br /> sans la complexité.
          </h2>
          <p className="text-xl text-muted-foreground">
            Nous avons simplifié chaque étape de la rédaction pour que vous puissiez vous concentrer sur le fond.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              className="bg-card p-8 rounded-3xl border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}