import { describe, it, expect } from 'vitest';
import worker from './index.js';

describe('CORS behavior', () => {
  const env: any = {};
  const ctx: any = {
    waitUntil: () => {},
    passThroughOnException: () => {}
  };

  it('should include Access-Control-Allow-Origin for allowed origins', async () => {
    const request = new Request('https://api.defrag.app/', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://defrag.app',
      }
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://defrag.app');
  });

  it('should NOT include Access-Control-Allow-Origin for disallowed origins', async () => {
    const request = new Request('https://api.defrag.app/', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://evil.com',
      }
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('should NOT include Access-Control-Allow-Origin when Origin header is missing', async () => {
    const request = new Request('https://api.defrag.app/', {
      method: 'OPTIONS'
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
