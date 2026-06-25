const API_BASE = process.env.API_BASE || 'https://api.defrag.app'

export async function getSession() {
  const res = await fetch(`${API_BASE}/api/auth/session`, {
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
