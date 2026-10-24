import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'mla_v2_admin';
const MAX_AGE = 60 * 60 * 12; // half a day; this is a shop, not a bank

/**
 * One shared password, held in an environment variable.
 *
 * Right for one owner looking at their own orders and no more than that: there
 * are no accounts, no roles and no reset flow. If a second person ever needs
 * in, replace this rather than passing the password around.
 */
const secret = () => process.env.ADMIN_PASSWORD ?? '';

export const adminIsConfigured = () => secret().length >= 12;

const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');

const equal = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Constant time, so a wrong password gives nothing away by how long it took. */
export const passwordMatches = (attempt: string) => adminIsConfigured() && equal(attempt, secret());

export async function signIn() {
  const issued = String(Date.now());
  const jar = await cookies();
  jar.set(COOKIE, `${issued}.${sign(issued)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  if (!adminIsConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const [issued, signature] = raw.split('.');
  if (!issued || !signature) return false;
  if (!equal(signature, sign(issued))) return false;

  // Changing ADMIN_PASSWORD changes the signing key, so every existing session
  // stops verifying — which is what you want from changing the password.
  const age = (Date.now() - Number(issued)) / 1000;
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE;
}
