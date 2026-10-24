'use server';

import { revalidatePath } from 'next/cache';
import { isSignedIn, passwordMatches, signIn, signOut } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';
import { nextStatus } from '@/lib/orders/labels';
import { isOrderStatus } from '@/lib/orders/types';

export async function login(_previous: string | null, form: FormData) {
  const attempt = String(form.get('password') ?? '');
  if (!passwordMatches(attempt)) return 'That password is not right.';
  await signIn();
  revalidatePath('/admin', 'layout');
  return null;
}

export async function logout() {
  await signOut();
  revalidatePath('/admin', 'layout');
}

/** Every mutation re-checks the session. The page guard is not the lock. */
export async function updateStatus(form: FormData) {
  if (!(await isSignedIn())) return;
  const store = getOrderStore();
  const reference = String(form.get('reference') ?? '');
  const status = String(form.get('status') ?? '');
  if (!store || !reference || !isOrderStatus(status)) return;
  await store.setStatus(reference, status);
  revalidatePath('/admin', 'layout');
}

export async function updateTracking(form: FormData) {
  if (!(await isSignedIn())) return;
  const store = getOrderStore();
  const reference = String(form.get('reference') ?? '');
  const tracking = String(form.get('tracking') ?? '').trim().slice(0, 120);
  if (!store || !reference) return;
  await store.setTracking(reference, tracking || null);
  revalidatePath('/admin', 'layout');
}

export async function addNote(form: FormData) {
  if (!(await isSignedIn())) return;
  const store = getOrderStore();
  const reference = String(form.get('reference') ?? '');
  const body = String(form.get('note') ?? '').trim().slice(0, 1000);
  if (!store || !reference || !body) return;
  await store.addNote(reference, body);
  revalidatePath('/admin', 'layout');
}

/** The one-click button: move this order on to whatever normally comes next. */
export async function advanceStatus(form: FormData) {
  if (!(await isSignedIn())) return;
  const store = getOrderStore();
  const reference = String(form.get('reference') ?? '');
  const from = String(form.get('from') ?? '');
  if (!store || !reference || !isOrderStatus(from)) return;
  const to = nextStatus[from];
  if (!to) return;
  await store.setStatus(reference, to);
  revalidatePath('/admin', 'layout');
}
