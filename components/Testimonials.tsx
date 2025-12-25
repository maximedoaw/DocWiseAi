import { Star, Quote, GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    content: "J'avais tellement d'idées mais je n'arrivais pas à les organiser. DocWise m'a aidé à structurer mon plan et à rendre mon rapport cohérent.",
    author: "Léa",
    role: "BTS MCO",
    rating: 5,
    initials: "LM"
  },
  {
    content: "Le correcteur intégré est génial. Il ne corrige pas juste les fautes, il propose des tournures de phrases plus professionnelles.",
    author: "Thomas",
    role: "Licence Eco-Gestion",
    rating: 5,
    initials: "TR"
  },
  {
    content: "J'ai gagné un week-end entier grâce à l'export automatique. La mise en page est nickel du premier coup.",
    author: "Samia",
    role: "Master Marketing",
    rating: 5,
    initials: "SB"
  }
]

export default function Testimonials() {
  return (
    <section id="témoignages" className="py-32 bg-background border-t border-border/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-sm mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span>4.9/5 par nos utilisateurs</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Ils ont validé <span className="text-primary italic">haut la main</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Rejoignez la communauté des étudiants qui ne redoutent plus la fin du semestre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border/50 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
              <div>
                <Quote className="w-8 h-8 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
                <p className="text-lg text-foreground/80 leading-relaxed mb-8 font-medium">
                  "{t.content}"
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-bold">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-foreground">{t.author}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}