'use server'
// ─── Auth action wrappers ─────────────────────────────────────────────────────
// This file re-exports only the RUNTIME server actions from auth.ts,
// explicitly avoiding the type-only SessionUser export that triggers a
// Turbopack 16 bug (registerServerReference(undefined, ...)).

import { loginAction as _login, registerAction as _register, logoutAction as _logout } from '@/lib/auth'
import type { LoginInput, LoginResult, RegisterInput, RegisterResult } from '@/lib/auth'

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  return _login(input)
}

export async function registerAction(input: RegisterInput): Promise<RegisterResult> {
  return _register(input)
}

export async function logoutAction(): Promise<void> {
  return _logout()
}
