export const ALLOWED_ORIGINS = [
  'https://defrag.app',
  'https://www.defrag.app',
  'https://app.defrag.app',
  'https://sovereign.defrag.app',
  'https://premium.defrag.app',
];

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://defrag.app';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
