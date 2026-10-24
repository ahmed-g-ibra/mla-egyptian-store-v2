'use client';

import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="mt-8 max-w-sm">
      <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
        Password
      </label>
      <input
        name="password"
        type="password"
        autoFocus
        autoComplete="current-password"
        className="mt-2 w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 text-ink-900 focus-visible:border-gold-500"
      />
      {error ? <p className="mt-3 text-sm text-carnelian-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-sm bg-lapis-800 px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-lapis-700 disabled:opacity-60"
      >
        {pending ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}
