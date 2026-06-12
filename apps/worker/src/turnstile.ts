/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string, secretKey: string): Promise<boolean> {
  if (!token || !secretKey) return false;

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const result = await fetch(url, {
    body: formData,
    method: 'POST',
  });

  const outcome: any = await result.json();
  return outcome.success;
}