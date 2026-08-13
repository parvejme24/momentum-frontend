import { cookies } from "next/headers";

import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "@/lib/auth/constants";

export { REFRESH_COOKIE_NAME, refreshCookieOptions };

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value;
}

export async function setRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

export async function clearRefreshToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE_NAME);
}
