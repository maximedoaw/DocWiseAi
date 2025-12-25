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

  useEffect(() => {
    if (userId) {
      router.push("/onboarding")
    }
  }, [userId, router])

  if (userId) return null

  return (
    <div className="min-h-screen bg-gray-900 selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  )
}