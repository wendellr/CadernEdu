'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { BookOpen, MessageSquare, LayoutGrid, LogOut, ClipboardList } from 'lucide-react'
import {
  clearToken,
  getUser, setEscolaAtiva, setSecretariaAtiva,
  getEscolaAtiva, getSecretariaAtiva,
  type StoredUser, type StoredEscola, type StoredSecretaria,
} from '@/lib/auth'
import { getTurma, getEscola, getSecretaria, type Turma } from '@/lib/api'

type NavItem = { label: string; href: string; icon: React.ReactNode }

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams<{ turmaId?: string }>()
  const router = useRouter()
  const turmaId = params?.turmaId

  const [turma, setTurma] = useState<Turma | null>(null)
  const [user, setUser] = useState<StoredUser | null>(null)
  const [escola, setEscola] = useState<StoredEscola | null>(null)
  const [secretaria, setSecretaria] = useState<StoredSecretaria | null>(null)

  useEffect(() => {
    let u = getUser()
    // Fallback: decodifica JWT para sessões anteriores ao setUser() no login
    if (!u) {
      try {
        const token = localStorage.getItem('ce_token')
        if (token) {
          const p = JSON.parse(atob(token.split('.')[1]))
          if (p.name) u = { name: p.name, email: p.email ?? '' }
        }
      } catch { /* ignora */ }
    }
    setUser(u)
    setEscola(getEscolaAtiva())
    setSecretaria(getSecretariaAtiva())
  }, [])

  useEffect(() => {
    if (!turmaId) { setTurma(null); return }
    getTurma(turmaId).then(setTurma).catch(() => {})
  }, [turmaId])

  // Quando a turma carrega, garante que escola e secretaria estejam no estado
  useEffect(() => {
    if (!turma) return
    const cached = getEscolaAtiva()
    const cachedSecretaria = getSecretariaAtiva()
    if (cached?.id === turma.escola_id) {
      // Já em cache — apenas sincroniza o estado (pode estar desatualizado)
      setEscola(cached)
      if (cachedSecretaria) setSecretaria(cachedSecretaria)
      return
    }
    getEscola(turma.escola_id).then((e) => {
      const stored: StoredEscola = { id: e.id, nome: e.nome, secretaria_id: e.secretaria_id }
      setEscolaAtiva(stored)
      setEscola(stored)
      return getSecretaria(e.secretaria_id)
    }).then((s) => {
      if (!s) return
      const stored: StoredSecretaria = { id: s.id, nome: s.nome }
      setSecretariaAtiva(stored)
      setSecretaria(stored)
    }).catch(() => {})
  }, [turma])

  const items: NavItem[] = turmaId
    ? [
        { label: 'Turmas',      href: '/turmas',                                    icon: <LayoutGrid size={16} /> },
        { label: 'Agenda',      href: `/pedagogico/turmas/${turmaId}/agenda`,        icon: <BookOpen size={16} /> },
        { label: 'Chamada',     href: `/pedagogico/turmas/${turmaId}/chamada`,       icon: <ClipboardList size={16} /> },
        { label: 'Comunicados', href: `/comunicacao/turmas/${turmaId}`,              icon: <MessageSquare size={16} /> },
      ]
    : [
        { label: 'Turmas', href: '/turmas', icon: <LayoutGrid size={16} /> },
      ]

  function logout() {
    clearToken()
    router.replace('/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-bg-alt border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border">
        <BrandMark />
        <span className="font-display font-bold text-base tracking-tight">
          <span className="text-green">Cadern</span>
          <span className="text-cyan">Edu</span>
        </span>
      </div>

      {/* Contexto de turma */}
      {turma && (
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs text-fg-faint uppercase tracking-wider font-medium mb-0.5">Turma</p>
          <p className="text-sm font-semibold text-fg truncate">{turma.nome}</p>
          <p className="text-xs text-fg-faint">{turma.serie} · {turma.ano_letivo}</p>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto" aria-label="Navegação principal">
        {items.map((item) => {
          const active = item.href === '/turmas'
            ? pathname === '/turmas'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition-colors mb-0.5',
                active
                  ? 'border-l-[3px] border-cyan bg-card font-semibold text-fg pl-[9px]'
                  : 'border-l-[3px] border-transparent text-fg-dim hover:bg-card hover:text-fg',
              ].join(' ')}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Identidade + Logout */}
      <div className="p-3 border-t border-border space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <UserAvatar name={user.name} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate" title={user.name}>
                {user.name}
              </p>
              {escola && (
                <p className="text-xs text-fg-dim truncate" title={escola.nome}>
                  {escola.nome}
                </p>
              )}
              {secretaria && (
                <p className="text-[11px] text-fg-faint truncate" title={secretaria.nome}>
                  {secretaria.nome}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-btn text-sm text-fg-dim hover:text-fg hover:bg-card transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div
      className="w-8 h-8 shrink-0 rounded-full bg-cyan/20 flex items-center justify-center text-xs font-bold text-cyan select-none"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="14" y="26" width="34" height="48" rx="4" fill="#1B7B3F" />
      <rect x="52" y="26" width="34" height="48" rx="4" fill="#0891B2" />
      <line x1="20" y1="38" x2="42" y2="38" stroke="#fff" strokeWidth="2.5" />
      <line x1="20" y1="46" x2="42" y2="46" stroke="#fff" strokeWidth="2.5" />
      <line x1="20" y1="54" x2="38" y2="54" stroke="#fff" strokeWidth="2.5" />
    </svg>
  )
}
