'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CalendarDays, Database, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  getEscolaAtiva,
  getSecretariaAtiva,
  type StoredEscola,
  type StoredSecretaria,
} from '@/lib/auth'

const ROUTE_LABELS: Record<string, string> = {
  turmas: 'Turmas',
  pedagogico: 'Pedagógico',
  comunicacao: 'Comunicação',
  chamada: 'Chamada',
  agenda: 'Agenda',
  config: 'Configurações',
  integracoes: 'Integrações',
}

export function Topbar() {
  const pathname = usePathname()
  const [escola, setEscola] = useState<StoredEscola | null>(null)
  const [secretaria, setSecretaria] = useState<StoredSecretaria | null>(null)

  useEffect(() => {
    function syncContext() {
      setEscola(getEscolaAtiva())
      setSecretaria(getSecretariaAtiva())
    }

    syncContext()
    window.addEventListener('focus', syncContext)
    window.addEventListener('storage', syncContext)
    window.addEventListener('cadernedu:context', syncContext)
    return () => {
      window.removeEventListener('focus', syncContext)
      window.removeEventListener('storage', syncContext)
      window.removeEventListener('cadernedu:context', syncContext)
    }
  }, [pathname])

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return ['Início']

    return parts
      .filter((part) => !looksLikeId(part))
      .map((part) => ROUTE_LABELS[part] ?? humanize(part))
  }, [pathname])

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-5 px-6 lg:px-8">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-fg-faint" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-fg-dim' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate font-semibold text-fg">
              {escola?.nome ?? 'Nenhuma escola selecionada'}
            </span>
            {secretaria && (
              <>
                <span className="text-fg-faint" aria-hidden="true">•</span>
                <span className="truncate text-fg-dim">{secretaria.nome}</span>
              </>
            )}
          </div>
        </div>

        <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-btn border border-border bg-bg-alt px-3 py-2 text-sm text-fg-faint lg:flex">
          <Search size={15} className="mr-2 shrink-0" aria-hidden="true" />
          <span>Buscar turma, aluno ou comunicado</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-btn border border-border bg-bg-alt px-3 py-2 text-xs text-fg-dim md:flex">
            <CalendarDays size={14} aria-hidden="true" />
            <span className="capitalize">{today}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-btn border border-cyan/20 bg-cyan/5 px-3 py-2 text-xs font-semibold text-cyan">
            <Database size={14} aria-hidden="true" />
            Dados locais · integração pendente
          </div>
        </div>
      </div>
    </header>
  )
}

function looksLikeId(value: string) {
  return value.length > 20 || /^[0-9a-f-]{12,}$/i.test(value)
}

function humanize(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
