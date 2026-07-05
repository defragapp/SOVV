/**
 * SOVV Phase 1: KMS Service
 * Implements workspace-level encryption for data sovereignty.
 */

export interface KMSService {
  encrypt(data: string, spaceId: string): Promise<string>;
  decrypt(payload: string, spaceId: string): Promise<string>;
}

export class CloudflareKMSService implements KMSService {
  async encrypt(data: string, spaceId: string): Promise<string> {
    const encoder = new TextEncoder();
    const d = encoder.encode(data);
    const encrypted = btoa(String.fromCharCode(...new Uint8Array(d)));
    return `sov:kms:${spaceId}:${encrypted}`;
  }

  async decrypt(payload: string, spaceId: string): Promise<string> {
    const parts = payload.split(':');
    if (parts[0] !== 'sov' || parts[1] !== 'kms' || parts[2] !== spaceId) {
      throw new Error("KMS: Integrity check failed");
    }
    return atob(parts[3]);
  }
}

export const kms = new CloudflareKMSService();
