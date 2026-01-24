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
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Dynamic Mesh Background - Adapts to Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-12">

          {/* Headline Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm mx-auto"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">L&apos;IA qui comprend votre parcours</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground"
            >
              Votre rapport de stage <br />
              <span className="text-primary italic">sublimé par l&apos;IA.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Passez de simples notes en vrac à un document académique d&apos;exception.
              Fini le stress, DocWise s&apos;occupe de tout.
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
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.03] bg-primary text-primary-foreground">
                Commencer gratuitement
              </Button>
            </Link>
          </motion.div>

          {/* Image Showcase - Startup Style */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 relative"
          >
            {/* The Border & Glow Frame */}
            <div className="relative mx-auto rounded-[2.5rem] p-2 bg-gradient-to-b from-primary/50 to-transparent shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)]">
              <div className="relative rounded-[2rem] overflow-hidden border border-border/50 bg-background/50 backdrop-blur-2xl">
                <img
                  src="/img1.PNG"
                  alt="DocWise Interface"
                  className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-700"
                />
              </div>
            </div>

            {/* Subtle decorative flare below image */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}