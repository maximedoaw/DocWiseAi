import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from "convex/browser";
import { api } from '@/convex/_generated/api'
import NewProjectStepper from '@/app/(root)/onboarding/NewProjectStepper'

const OnboardingPage = async () => {
    // 1. Check Authentication
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/')
    }

    // 2. Check Convex Status (Source of Truth)
    // 2. Check Convex Status (Source of Truth)
    const token = await getToken({ template: "convex" })
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
        convex.setAuth(token);
    }
    const userStatus = await convex.query(api.users.getUserStatus, {});

    // 3. If Onboarded -> Sync Cookie & Redirect
    if (userStatus?.onboardingCompleted) {
        const cookieStore = await cookies()
        cookieStore.set("onboarding_complete", "true", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365, // 1 Year
            path: "/",
        })

        redirect('/projects')
    }

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <NewProjectStepper />
        </div>
    )
}

export default OnboardingPage