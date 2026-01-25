'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Coffee, GraduationCap, Library, PenTool, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-transparent pt-32 pb-20">
      {/* Background Harmonization */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Dynamic Mesh Background - Adapts to Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-12">

          {/* Headline Section with Calligraphic Touch */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative inline-block"
            >
              <div className="absolute -top-2 -left-4 w-8 h-8 border-l border-t border-primary/20 rounded-tl-lg" />
              <div className="absolute -bottom-2 -right-4 w-8 h-8 border-r border-b border-primary/20 rounded-br-lg" />
              <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-foreground/70 px-6 py-2">
                Votre réussite est un art
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl md:text-8xl font-serif text-foreground tracking-tight leading-[1.05]"
            >
              Le <span className="font-light">rapport de stage</span> <br />
              <span className="text-primary italic font-normal">dont vous serez fier.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light"
            >
              Transformez vos notes de terrain en un récit académique d&apos;exception.
              Une plume précise, une structure impeccable, sans le stress du curseur qui clignote.
            </motion.p>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="h-16 px-12 rounded-xl text-lg font-serif italic font-medium shadow-xl transition-all hover:scale-[1.03] bg-primary text-primary-foreground">
                Commencer ma rédaction
              </Button>
            </Link>
          </motion.div>

          {/* Image Showcase - Refined Frame */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-16 relative"
          >
            {/* The Border & Glow Frame - More Refined */}
            <div className="relative mx-auto rounded-[2rem] p-1.5 bg-gradient-to-b from-primary/30 to-transparent shadow-[0_0_40px_-15px_rgba(var(--primary-rgb),0.2)]">
              <div className="relative rounded-[1.5rem] overflow-hidden border border-white/10 bg-background/50 backdrop-blur-2xl">
                <img
                  src="/img1.PNG"
                  alt="DocWise Interface"
                  className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-700"
                />
              </div>
            </div>

            {/* Subtitle / Note */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <Coffee className="w-4 h-4 text-primary/40" />
              <span className="text-xs text-muted-foreground italic font-light">Conçue pour des sessions d&apos;écriture sereines.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}