'use server'

import { clerkClient } from "@clerk/nextjs/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"
import { cookies } from "next/headers"

export async function completeOnboarding() {
  const { userId } = await auth()

  if (!userId) {
    return { message: 'No Logged In User' }
  }

  const client = await clerkClient()
  const cookieStore = await cookies()

  try {
    // 1. Update Clerk Metadata (Backup)
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    })

    // 2. Update Convex
    const token = await (await auth()).getToken({ template: "convex" })
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
        convex.setAuth(token);
    }
    await convex.mutation(api.users.completeOnboarding, {});

    // 3. Set Cookie
    cookieStore.set("onboarding_complete", "true", {
      httpOnly: false, // Allow client reading if needed (though middleware is server-side)
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 Year
      path: "/",
    })

    return { message: 'User metadata updated' }
  } catch (error) {
    console.log(error)
    return { message: 'Error updating user metadata' }
  }
}
