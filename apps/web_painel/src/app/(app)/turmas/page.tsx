'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, School, Users } from 'lucide-react'
import { listEscolas, listTurmas, getSecretaria, ApiError, type Escola, type Turma } from '@/lib/api'
import { setEscolaAtiva as persistEscola, setSecretariaAtiva as persistSecretaria } from '@/lib/auth'
import { toast } from 'sonner'

function getSecretariaIdFromToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('ce_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.secretaria_id ?? null
  } catch {
    return null
  }
}

export default function HomePage() {
  const router = useRouter()
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [escolaAtiva, setEscolaAtiva] = useState<Escola | null>(null)
  const [loadingEscolas, setLoadingEscolas] = useState(true)
  const [loadingTurmas, setLoadingTurmas] = useState(false)

  useEffect(() => {
    const secretariaId = getSecretariaIdFromToken()
    if (!secretariaId) {
      toast.error('Token sem secretaria_id — faça login novamente')
      return
    }
    listEscolas(secretariaId)
      .then(setEscolas)
      .catch((e: ApiError) => toast.error(e.message))
      .finally(() => setLoadingEscolas(false))
  }, [])

  async function selecionarEscola(escola: Escola) {
    setEscolaAtiva(escola)
    persistEscola({ id: escola.id, nome: escola.nome, secretaria_id: escola.secretaria_id })
    setTurmas([])
    setLoadingTurmas(true)
    try {
      const [turmasData, secretariaData] = await Promise.all([
        listTurmas(escola.id),
        getSecretaria(escola.secretaria_id),
      ])
      setTurmas(turmasData)
      persistSecretaria({ id: secretariaData.id, nome: secretariaData.nome })
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao carregar turmas')
    } finally {
      setLoadingTurmas(false)
    }
  }

  function selecionarTurma(turmaId: string) {
    router.push(`/pedagogico/turmas/${turmaId}/agenda`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-fg mb-1">Selecione a turma</h1>
      <p className="text-sm text-fg-dim mb-8">
        Escolha a escola e depois a turma para acessar a agenda e os comunicados.
      </p>

      {/* Escolas */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-xs font-semibold text-fg-faint uppercase tracking-wider mb-3">
          <School size={14} />
          Escolas
        </h2>

        {loadingEscolas ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-btnLg bg-bg-alt animate-pulse" />
            ))}
          </div>
        ) : escolas.length === 0 ? (
          <p className="text-sm text-fg-dim">Nenhuma escola encontrada.</p>
        ) : (
          <ul className="space-y-1.5">
            {escolas.map((escola) => (
              <li key={escola.id}>
                <button
                  onClick={() => selecionarEscola(escola)}
                  className={[
                    'w-full flex items-center justify-between px-4 py-3 rounded-btnLg text-left text-sm transition-colors',
                    escolaAtiva?.id === escola.id
                      ? 'bg-green-soft border border-green text-fg font-medium'
                      : 'bg-card border border-border text-fg hover:border-green hover:bg-green-soft',
                  ].join(' ')}
                >
                  <span>{escola.nome}</span>
                  <ChevronRight
                    size={16}
                    className={escolaAtiva?.id === escola.id ? 'text-green' : 'text-fg-faint'}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Turmas — visível após selecionar escola */}
      {escolaAtiva && (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-semibold text-fg-faint uppercase tracking-wider mb-3">
            <Users size={14} />
            Turmas de {escolaAtiva.nome}
          </h2>

          {loadingTurmas ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-btnLg bg-bg-alt animate-pulse" />
              ))}
            </div>
          ) : turmas.length === 0 ? (
            <p className="text-sm text-fg-dim">Nenhuma turma cadastrada para esta escola.</p>
          ) : (
            <ul className="space-y-1.5">
              {turmas.map((turma) => (
                <li key={turma.id}>
                  <button
                    onClick={() => selecionarTurma(turma.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-btnLg text-left text-sm bg-card border border-border hover:border-cyan hover:bg-cyan/5 transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-fg">{turma.nome}</span>
                      <span className="ml-2 text-fg-faint">{turma.serie} · {turma.ano_letivo}</span>
                    </div>
                    <ChevronRight size={16} className="text-fg-faint group-hover:text-cyan" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
