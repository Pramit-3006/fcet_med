import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, preferredLanguage } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      preferredLanguage,
    })

    // Create session
    const sessionToken = await createSession(user.id)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredLanguage: user.preferredLanguage,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
