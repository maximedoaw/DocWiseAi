'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Coffee, GraduationCap, Library, PenTool, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-32 lg:pt-32">
      {/* Warm ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-sm mb-8"
            >
              <Coffee className="w-4 h-4" />
              <span>Plus de stress, juste de la réussite</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
            >
              Votre rapport, <br />
              <span className="text-primary italic">enfin terminé.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              DocWise est votre compagnon de rédaction. Il vous aide à structurer vos idées, trouver les bons mots et mettre en forme votre expérience. <span className="text-foreground font-medium">Fini le syndrome de la page blanche.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-105">
                  Commencer mon rapport
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-lg hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400">
                  Voir un exemple
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 flex items-center justify-center lg:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition-all"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted-foreground`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">1,500+ étudiants</span> nous font confiance
              </div>
            </motion.div>
          </div>

          {/* Right Content - Friendly Editor Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full max-w-xl lg:max-w-none relative"
          >
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-amber-200/20 to-orange-100/20 dark:from-amber-900/20 dark:to-orange-900/10 rounded-full blur-3xl animate-pulse" />

            {/* The Card */}
            <div className="relative bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/50 flex items-center gap-4 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="h-6 w-32 bg-muted/50 rounded-full mx-auto" />
              </div>

              {/* Editor Content */}
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="h-8 w-3/4 bg-foreground/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-foreground/5 rounded-full" />
                  <div className="h-4 w-5/6 bg-foreground/5 rounded-full" />
                  <div className="h-4 w-4/6 bg-foreground/5 rounded-full" />
                </div>

                {/* User Friend "Suggestion" */}
                <div className="flex gap-4 items-start p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 text-amber-600">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Suggestion de formulation</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "Cette expérience m'a permis de..." est excellent. Tu pourrais ajouter un exemple concret ici pour renforcer ton propos.
                    </p>
                    <button className="text-xs font-semibold text-primary hover:text-primary/80 mt-2">
                      Accepter la suggestion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Achievement */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 bottom-12 bg-card p-4 rounded-2xl shadow-xl border border-border/50 hidden md:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Validé !</div>
                <div className="text-xs text-muted-foreground">Prêt à imprimer</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}