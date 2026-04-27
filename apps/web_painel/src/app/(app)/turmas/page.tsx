'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Database,
  RefreshCw,
  School,
  Users,
} from 'lucide-react'
import { listEscolas, listTurmas, getSecretaria, ApiError, type Escola, type Turma } from '@/lib/api'
import { setEscolaAtiva as persistEscola, setSecretariaAtiva as persistSecretaria } from '@/lib/auth'
import { toast } from 'sonner'
import { PageHeader, HeaderBadge } from '@/components/layout/PageHeader'
import { OperationalCard } from '@/components/layout/OperationalCard'

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

  function carregarEscolas() {
    const secretariaId = getSecretariaIdFromToken()
    if (!secretariaId) {
      toast.error('Token sem secretaria_id — faça login novamente')
      return
    }
    setLoadingEscolas(true)
    listEscolas(secretariaId)
      .then(setEscolas)
      .catch((e: ApiError) => toast.error(e.message))
      .finally(() => setLoadingEscolas(false))
  }

  useEffect(() => {
    carregarEscolas()
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
      window.dispatchEvent(new Event('cadernedu:context'))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao carregar turmas')
    } finally {
      setLoadingTurmas(false)
    }
  }

  function selecionarTurma(turmaId: string) {
    router.push(`/pedagogico/turmas/${turmaId}/agenda`)
  }

  const anoAtual = new Date().getFullYear()
  const turmasAnoAtual = turmas.filter((turma) => turma.ano_letivo === anoAtual).length

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Painel do professor"
        title="Rotina escolar"
        description="Escolha a escola e a turma para registrar aulas, chamada, atividades de casa e comunicados. Os dados exibidos aqui podem vir de carga inicial ou integração com sistemas oficiais."
        meta={(
          <>
            <HeaderBadge tone="info">Dados locais · integração pendente</HeaderBadge>
            <HeaderBadge tone="neutral">{escolas.length} escola{escolas.length !== 1 ? 's' : ''}</HeaderBadge>
            {escolaAtiva && <HeaderBadge tone="success">{escolaAtiva.nome}</HeaderBadge>}
          </>
        )}
        actions={(
          <button
            type="button"
            onClick={carregarEscolas}
            className="inline-flex items-center gap-2 rounded-btn border border-border bg-card px-3 py-2 text-sm font-semibold text-fg-dim transition-colors hover:bg-bg-alt hover:text-fg"
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        )}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <OperationalCard
          title="Escolas disponíveis"
          value={loadingEscolas ? '...' : String(escolas.length)}
          description="Unidades vinculadas à secretaria do usuário autenticado."
          icon={<School size={18} aria-hidden="true" />}
          tone="green"
        />
        <OperationalCard
          title="Turmas carregadas"
          value={escolaAtiva ? String(turmas.length) : 'Selecione'}
          description="Turmas aparecem após escolher uma escola."
          icon={<Users size={18} aria-hidden="true" />}
          tone="cyan"
        />
        <OperationalCard
          title="Status de dados"
          value="Carga inicial"
          description="Preparado para exibir importações, erros e sincronização oficial."
          icon={<Database size={18} aria-hidden="true" />}
          tone="purple"
        />
      </section>

      <section className="mb-6 rounded-card border border-yellow/30 bg-yellow/10 p-4">
        <div className="flex gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-fg" aria-hidden="true" />
          <div>
            <h2 className="font-display text-sm font-bold text-fg">Próximo passo do piloto</h2>
            <p className="mt-1 text-sm leading-6 text-fg-dim">
              Validar a carga inicial de escolas, turmas e alunos antes de usar o painel
              como rotina diária. Isso evita redigitação e deixa clara a origem dos dados.
            </p>
          </div>
        </div>
      </section>

      {/* Escolas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-card border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-fg">
                <School size={16} />
                Escolas
              </h2>
              <p className="mt-1 text-xs text-fg-dim">Selecione a unidade de trabalho.</p>
            </div>
          </div>

          {loadingEscolas ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-btnLg bg-bg-alt animate-pulse" />
              ))}
            </div>
          ) : escolas.length === 0 ? (
            <p className="rounded-btn bg-bg-alt p-4 text-sm text-fg-dim">
              Nenhuma escola encontrada para este usuário.
            </p>
          ) : (
            <ul className="space-y-2">
              {escolas.map((escola) => (
                <li key={escola.id}>
                  <button
                    onClick={() => selecionarEscola(escola)}
                    className={[
                      'w-full flex items-center justify-between px-4 py-3 rounded-btnLg text-left text-sm transition-all',
                      escolaAtiva?.id === escola.id
                        ? 'bg-green-soft border border-green text-fg font-medium shadow-sm'
                        : 'bg-card border border-border text-fg hover:border-green hover:bg-green-soft',
                    ].join(' ')}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{escola.nome}</span>
                      <span className="mt-0.5 block text-xs text-fg-faint">
                        {escola.ativo ? 'Ativa' : 'Inativa'} · origem local
                      </span>
                    </span>
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

        <section className="rounded-card border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-fg">
                <Users size={16} />
                {escolaAtiva ? `Turmas de ${escolaAtiva.nome}` : 'Turmas'}
              </h2>
              <p className="mt-1 text-xs text-fg-dim">
                {escolaAtiva
                  ? `${turmasAnoAtual} turma${turmasAnoAtual !== 1 ? 's' : ''} no ano letivo atual.`
                  : 'Escolha uma escola para carregar as turmas.'}
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-btn bg-bg-alt px-3 py-2 text-xs text-fg-dim sm:flex">
              <CalendarDays size={14} aria-hidden="true" />
              {anoAtual}
            </div>
          </div>

          {!escolaAtiva ? (
            <div className="rounded-card border border-dashed border-border bg-bg-alt p-8 text-center">
              <p className="font-display font-semibold text-fg">Nenhuma escola selecionada</p>
              <p className="mt-2 text-sm text-fg-dim">
                A lista de turmas aparece aqui depois que você escolher uma escola.
              </p>
            </div>
          ) : loadingTurmas ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-btnLg bg-bg-alt animate-pulse" />
              ))}
            </div>
          ) : turmas.length === 0 ? (
            <p className="rounded-btn bg-bg-alt p-4 text-sm text-fg-dim">
              Nenhuma turma cadastrada para esta escola.
            </p>
          ) : (
            <ul className="space-y-2">
              {turmas.map((turma) => (
                <li key={turma.id}>
                  <button
                    onClick={() => selecionarTurma(turma.id)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-btnLg text-left text-sm bg-card border border-border hover:border-cyan hover:bg-cyan/5 transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-fg">{turma.nome}</span>
                      <span className="ml-2 text-fg-faint">{turma.serie} · {turma.ano_letivo}</span>
                      <p className="mt-1 text-xs text-fg-faint">
                        Agenda, chamada e comunicados disponíveis
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-fg-faint group-hover:text-cyan" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
