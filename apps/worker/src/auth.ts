import { kms } from "./kms.js";

/**
 * KMS-backed encryption for sensitive data.
 */
export async function encryptSensitiveData(data: string, spaceId: string): Promise<string> {
  return await kms.encrypt(data, spaceId);
}

export async function decryptSensitiveData(payload: string, spaceId: string): Promise<string> {
  return await kms.decrypt(payload, spaceId);
}

