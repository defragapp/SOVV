// Use relative URLs so requests go through the Next.js proxy
// (avoids direct cross-origin calls to api.defrag.app)

export async function getSession() {
  const res = await fetch('/api/auth/session', {
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}
