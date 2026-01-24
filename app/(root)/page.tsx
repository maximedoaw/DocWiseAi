"use client"

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import HowItWorks from "@/components/HowItWorks"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import Testimonials from "@/components/Testimonials"
import Pricing from "@/components/Pricing"

export default function HomePage() {
  const { userId } = useAuth()
  const router = useRouter()

  // Middleware handles redirection now

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background Decor System */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-500/10 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Footer />
      </div>
    </div>
  )
}