const TOKEN_KEY = 'ce_token'
const USER_KEY = 'ce_user'
const ESCOLA_KEY = 'ce_escola'
const SECRETARIA_KEY = 'ce_secretaria'

export type StoredEscola = { id: string; nome: string; secretaria_id: string }
export type StoredSecretaria = { id: string; nome: string }

export type StoredUser = {
  name: string
  email: string
  perfil?: string
  secretaria_id?: string
  escola_id?: string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ESCOLA_KEY)
  localStorage.removeItem(SECRETARIA_KEY)
}

export function getEscolaAtiva(): StoredEscola | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ESCOLA_KEY)
  return raw ? (JSON.parse(raw) as StoredEscola) : null
}

export function setEscolaAtiva(escola: StoredEscola): void {
  localStorage.setItem(ESCOLA_KEY, JSON.stringify(escola))
}

export function getSecretariaAtiva(): StoredSecretaria | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SECRETARIA_KEY)
  return raw ? (JSON.parse(raw) as StoredSecretaria) : null
}

export function setSecretariaAtiva(secretaria: StoredSecretaria): void {
  localStorage.setItem(SECRETARIA_KEY, JSON.stringify(secretaria))
}

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
