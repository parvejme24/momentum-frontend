export function getGoogleClientId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  return raw || null;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getGoogleClientId());
}
