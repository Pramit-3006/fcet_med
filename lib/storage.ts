interface StorageData {
  users: Array<{
    id: number
    email: string
    password_hash: string
    first_name: string
    last_name: string
    role: string
    preferred_language: string
    theme_preference: string
    created_at: string
  }>
  sessions: Array<{
    id: number
    user_id: number
    session_token: string
    expires_at: string
  }>
  medical_reports: Array<{
    id: number
    user_id: number
    original_image_url: string
    enhanced_image_url: string
    image_type: string
    body_part: string
    analysis_results: any
    confidence_score: number
    created_at: string
  }>
}

// In-memory storage (in production, this would be replaced with a real database)
const storage: StorageData = {
  users: [],
  sessions: [],
  medical_reports: [],
}

let nextUserId = 1
let nextSessionId = 1
let nextReportId = 1

export async function query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
  // Simple query parser for basic operations
  const sqlLower = sql.toLowerCase().trim()

  if (sqlLower.startsWith("insert into users")) {
    const [email, password_hash, first_name, last_name, preferred_language] = params
    const user = {
      id: nextUserId++,
      email,
      password_hash,
      first_name,
      last_name,
      role: "user",
      preferred_language: preferred_language || "en",
      theme_preference: "system",
      created_at: new Date().toISOString(),
    }
    storage.users.push(user)
    return { rows: [user] }
  }

  if (sqlLower.startsWith("select") && sqlLower.includes("from users") && sqlLower.includes("where email")) {
    const [email] = params
    const user = storage.users.find((u) => u.email === email)
    return { rows: user ? [user] : [] }
  }

  if (sqlLower.startsWith("insert into sessions")) {
    const [user_id, session_token, expires_at] = params
    const session = {
      id: nextSessionId++,
      user_id,
      session_token,
      expires_at: expires_at.toISOString(),
    }
    storage.sessions.push(session)
    return { rows: [session] }
  }

  if (sqlLower.includes("join sessions") && sqlLower.includes("session_token")) {
    const [session_token] = params
    const session = storage.sessions.find(
      (s) => s.session_token === session_token && new Date(s.expires_at) > new Date(),
    )
    if (session) {
      const user = storage.users.find((u) => u.id === session.user_id)
      return { rows: user ? [user] : [] }
    }
    return { rows: [] }
  }

  if (sqlLower.startsWith("delete from sessions")) {
    const [session_token] = params
    storage.sessions = storage.sessions.filter((s) => s.session_token !== session_token)
    return { rows: [] }
  }

  if (sqlLower.startsWith("insert into medical_reports")) {
    const [user_id, original_image_url, enhanced_image_url, image_type, body_part, analysis_results, confidence_score] =
      params
    const report = {
      id: nextReportId++,
      user_id,
      original_image_url,
      enhanced_image_url,
      image_type,
      body_part,
      analysis_results,
      confidence_score,
      created_at: new Date().toISOString(),
    }
    storage.medical_reports.push(report)
    return { rows: [report] }
  }

  if (sqlLower.includes("from medical_reports") && sqlLower.includes("user_id")) {
    const [user_id] = params
    const reports = storage.medical_reports.filter((r) => r.user_id === user_id)
    return { rows: reports }
  }

  return { rows: [] }
}
