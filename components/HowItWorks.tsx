import { Download, FileEdit, Lightbulb, Sparkles, MoveRight, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "L'Étincelle",
    description: "Confiez-nous vos notes de terrain, vos réflexions de stagiaire, ou même de simples souvenirs. Chaque détail est une graine de succès.",
    rotation: "rotate-3",
    position: "mr-auto",
    pinX: "left-1/2",
    delay: 0
  },
  {
    number: "02",
    icon: Sparkles,
    title: "L'Épure",
    description: "DocWise analyse vos données pour bâtir un plan académique solide, conforme aux exigences les plus strictes de vos jurys.",
    rotation: "-rotate-2",
    position: "ml-auto",
    pinX: "left-1/2",
    delay: 0.1
  },
  {
    number: "03",
    icon: FileEdit,
    title: "Le Verbe",
    description: "L'IA devient votre plume, suggérant des formulations élégantes et précises tout en préservant votre authenticité.",
    rotation: "rotate-1",
    position: "mr-auto md:ml-20",
    pinX: "left-1/2",
    delay: 0.2
  },
  {
    number: "04",
    icon: Download,
    title: "Le Sésame",
    description: "Téléchargez votre document final impeccablement mis en page. Une présentation digne des plus grands cabinets.",
    rotation: "-rotate-3",
    position: "ml-auto md:mr-20",
    pinX: "left-1/2",
    delay: 0.3
  }
]

const Pin = ({ className }: { className?: string }) => (
  <div className={cn("absolute -top-3 w-6 h-6 z-20 flex items-center justify-center", className)}>
    {/* Metal Pin Body */}
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg border-t border-white/40 flex items-center justify-center">
      <div className="w-1 h-1 rounded-full bg-white/60" />
    </div>
    {/* Pin Shadow */}
    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/20 blur-[1px] -z-10" />
  </div>
)

export default function HowItWorks() {
  return (
    <section id="comment-ça-marche" className="py-24 md:py-48 relative overflow-hidden bg-background">
      {/* Background Harmonization & Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=\'100\'_height=\'100\'_viewBox=\'0 0 100 100\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M11_18c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm48_25c3.866_0_7-3.134_7-7s-3.134-7-7-7-7_3.134-7_7_3.134_7_7_7zm-43-7c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm63_31c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM34_90c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zm56-76c1.657_0_3-1.343_3-3s-1.343-3-3-3-3_1.343-3_3_1.343_3_3_3zM12_86c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm28-65c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm23-11c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-6_60c2.21_0_4-1.79_4-4s-1.79-4-4-4-4_1.79-4_4_1.79_4_4_4zm29_22c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zM32_63c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm57-13c2.76_0_5-2.24_5-5s-2.24-5-5-5-5_2.24-5_5_2.24_5_5_5zm-9-21c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2 2 .895_2_2_2zM60_91c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM35_41c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2zM12_60c1.105_0_2-.895_2-2s-.895-2-2-2-2 .895-2_2_.895_2_2_2z\'_fill=\'%23f0f0f0\'_fill-opacity=\'0.03\'_fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-30 dark:opacity-10 pointer-events-none" />

      <div className="container px-4 mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-24 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative inline-block"
          >
            <div className="absolute -top-2 -left-4 w-10 h-10 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
            <div className="absolute -bottom-2 -right-4 w-10 h-10 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />
            <span className="text-sm font-medium tracking-[0.3em] uppercase text-foreground/70 px-6 py-2">
              Le Carnet de Route
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-serif text-foreground tracking-tight leading-[1.1]"
          >
            Donner vie à <br />
            <span className="italic text-primary font-normal">votre parcours.</span>
          </motion.h2>
        </div>

        <div className="relative pt-20">
          {/* Zigzag Connecting Path (Dashed) */}
          <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-20 dark:opacity-30" viewBox="0 0 1000 1200" preserveAspectRatio="none">
            <motion.path
              d="M500 0 L 250 300 L 750 600 L 250 900 L 750 1200"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="12 12"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          <div className="space-y-32 flex flex-col items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, rotate: index % 2 === 0 ? -5 : 5 }}
                whileInView={{ opacity: 1, x: 0, rotate: index % 2 === 0 ? -2 : 2 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: step.delay }}
                className={cn(
                  "relative w-full max-w-md group",
                  step.position
                )}
              >
                {/* The Paper Scrap */}
                <div className={cn(
                  "relative p-8 md:p-10 transition-all duration-500",
                  "bg-[#fffdfa] dark:bg-gray-900",
                  "border border-gray-200 dark:border-gray-800",
                  "shadow-[5px_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-2xl",
                  "rounded-none", // Sharp like a torn scrap
                  step.rotation
                )}>
                  {/* Pin placed according to user request */}
                  <Pin className={cn("-translate-x-1/2", step.pinX)} />

                  {/* Scribble decor */}
                  <div className="absolute bottom-4 right-6 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Heart className="w-12 h-12 text-primary" strokeWidth={1} />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-serif italic text-primary/40">
                        {step.number}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                      <step.icon className="w-6 h-6 text-primary/60" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif font-medium text-foreground tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-light text-base italic">
                        « {step.description} »
                      </p>
                    </div>

                    {/* Handwriting style signature/footer */}
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
                      <span>DocWise Plume</span>
                      <span>Stage {new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-32 text-center"
        >
          <Link href="/sign-up">
            <Button size="lg" className="h-20 px-16 rounded-full text-xl font-serif italic font-medium shadow-2xl transition-all hover:scale-110 bg-primary text-primary-foreground">
              Rédiger mon chef-d'œuvre
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}