import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from "convex/browser";
import { api } from '@/convex/_generated/api'

export async function GET(request: NextRequest) {
    const { userId, getToken } = await auth();

    if (!userId) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify against DB
    const token = await getToken({ template: "convex" });
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
        convex.setAuth(token);
    }
    const userStatus = await convex.query(api.users.getUserStatus, {});

    if (userStatus?.onboardingCompleted) {
        const cookieStore = await cookies();
        cookieStore.set("onboarding_complete", "true", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365, // 1 Year
            path: "/",
        });

        // Redirect to projects
        return NextResponse.redirect(new URL('/projects', request.url));
    }

    // If not onboarded, go back to onboarding?
    return NextResponse.redirect(new URL('/onboarding', request.url));
}
