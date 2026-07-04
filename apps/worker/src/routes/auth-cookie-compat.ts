export function registerAuthCookieCompatRoutes(router: any) {
  router.post('/api/auth/send-verification', async (request: Request, ...args: unknown[]) => {
    if (request.headers.get('x-sov-cookie-normalized') === '1') {
      return undefined
    }

    const cookie = request.headers.get('Cookie') || ''
    if (cookie.includes('__sov_session=')) {
      return undefined
    }

    const legacyMatch = cookie.match(/(?:^|;\s*)session=([^;]+)/)
    if (!legacyMatch?.[1]) {
      return undefined
    }

    const headers = new Headers(request.headers)
    const normalizedCookie = cookie
      ? `${cookie}; __sov_session=${legacyMatch[1]}`
      : `__sov_session=${legacyMatch[1]}`

    headers.set('Cookie', normalizedCookie)
    headers.set('x-sov-cookie-normalized', '1')

    const normalizedRequest = new Request(request, { headers })
    return router.fetch(normalizedRequest, ...args)
  })
}
