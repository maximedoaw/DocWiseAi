import React from 'react'
// cookies import removed
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
    // 3. If Onboarded -> To Route Handler (to set cookie)
    if (userStatus?.onboardingCompleted) {
        redirect('/api/auth/sync-onboarding')
    }

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <NewProjectStepper />
        </div>
    )
}

export default OnboardingPage