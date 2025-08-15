import { query } from "./storage"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import crypto from "crypto"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  preferredLanguage: string
  themePreference: string
  createdAt: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  preferredLanguage?: string
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)

  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, preferred_language)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name as "firstName", last_name as "lastName", role, preferred_language as "preferredLanguage", theme_preference as "themePreference", created_at as "createdAt"`,
    [userData.email, hashedPassword, userData.firstName, userData.lastName, userData.preferredLanguage || "en"],
  )

  return result.rows[0] as User
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName", role, preferred_language as "preferredLanguage", theme_preference as "themePreference", created_at as "createdAt"
     FROM users 
     WHERE email = $1`,
    [email],
  )

  if (result.rows.length === 0) return null

  const user = result.rows[0] as User & { password_hash: string }
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) return null

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await query(
    `INSERT INTO sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, sessionToken, expiresAt],
  )

  return sessionToken
}

export async function getSessionUser(sessionToken: string): Promise<User | null> {
  const result = await query(
    `SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.role, u.preferred_language as "preferredLanguage", u.theme_preference as "themePreference", u.created_at as "createdAt"
     FROM users u
     JOIN sessions s ON u.id = s.user_id
     WHERE s.session_token = $1 AND s.expires_at > NOW()`,
    [sessionToken],
  )

  return result.rows.length > 0 ? (result.rows[0] as User) : null
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  return getSessionUser(sessionToken)
}

export async function deleteSession(sessionToken: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken])
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
