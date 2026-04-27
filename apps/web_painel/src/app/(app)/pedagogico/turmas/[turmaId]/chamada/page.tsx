'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, FileText, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  getChamada, lancarChamada, listAlunosDaTurma, getTurma,
  ApiError,
  type ChamadaItem, type StatusPresenca, type Turma, type Aluno,
} from '@/lib/api'

type Estado = Record<string, StatusPresenca>   // aluno_id → status
type Obs = Record<string, string>              // aluno_id → observação

const STATUS_CONFIG: Record<StatusPresenca, { label: string; icon: React.ReactNode; cls: string }> = {
  presente: { label: 'Presente', icon: <CheckCircle2 size={16} />, cls: 'bg-green-soft text-green border-green/30' },
  falta:    { label: 'Falta',    icon: <XCircle size={16} />,      cls: 'bg-coral/10 text-coral border-coral/30' },
  atestado: { label: 'Atestado', icon: <FileText size={16} />,     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function ChamadaPage() {
  const { turmaId } = useParams<{ turmaId: string }>()
  const hoje = format(new Date(), 'yyyy-MM-dd')

  const [turma, setTurma] = useState<Turma | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [data, setData] = useState(hoje)
  const [estado, setEstado] = useState<Estado>({})
  const [obs, setObs] = useState<Obs>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [chamadaFeita, setChamadaFeita] = useState(false)

  useEffect(() => {
    getTurma(turmaId).then(setTurma).catch(() => {})
    listAlunosDaTurma(turmaId).then(setAlunos).catch(() => {})
  }, [turmaId])

  const carregarChamada = useCallback(async () => {
    setLoading(true)
    try {
      const chamada = await getChamada(turmaId, data)
      if (chamada.itens.length > 0) {
        const e: Estado = {}
        const o: Obs = {}
        chamada.itens.forEach((item) => {
          e[item.aluno_id] = item.status
          if (item.observacoes) o[item.aluno_id] = item.observacoes
        })
        setEstado(e)
        setObs(o)
        setChamadaFeita(true)
      } else {
        // Pré-seleciona todos como presente
        const e: Estado = {}
        alunos.forEach((a) => { e[a.id] = 'presente' })
        setEstado(e)
        setObs({})
        setChamadaFeita(false)
      }
    } catch {
      // Chamada ainda não lançada — inicia com todos presentes
      const e: Estado = {}
      alunos.forEach((a) => { e[a.id] = 'presente' })
      setEstado(e)
      setObs({})
      setChamadaFeita(false)
    } finally {
      setLoading(false)
    }
  }, [turmaId, data, alunos])

  useEffect(() => {
    if (alunos.length > 0) carregarChamada()
  }, [carregarChamada, alunos])

  function toggleStatus(alunoId: string) {
    setEstado((prev) => {
      const atual = prev[alunoId] ?? 'presente'
      const ciclo: StatusPresenca[] = ['presente', 'falta', 'atestado']
      const prox = ciclo[(ciclo.indexOf(atual) + 1) % ciclo.length]
      return { ...prev, [alunoId]: prox }
    })
  }

  async function salvar() {
    if (alunos.length === 0) return
    setSalvando(true)
    try {
      await lancarChamada(turmaId, {
        data,
        presencas: alunos.map((a) => ({
          aluno_id: a.id,
          status: estado[a.id] ?? 'presente',
          observacoes: obs[a.id] || null,
        })),
      })
      toast.success('Chamada salva!')
      setChamadaFeita(true)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar chamada')
    } finally {
      setSalvando(false)
    }
  }

  const presentes = alunos.filter((a) => (estado[a.id] ?? 'presente') === 'presente').length
  const faltas = alunos.filter((a) => estado[a.id] === 'falta').length
  const atestados = alunos.filter((a) => estado[a.id] === 'atestado').length

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">
            Chamada{turma ? ` — ${turma.nome}` : ''}
          </h1>
          <p className="text-sm text-fg-dim mt-0.5">Clique no aluno para alternar o status.</p>
        </div>
        <button
          onClick={salvar}
          disabled={salvando || alunos.length === 0}
          className="flex items-center gap-2 bg-cyan text-white text-sm font-semibold px-4 py-2 rounded-btn hover:bg-cyan-deep transition-colors disabled:opacity-60"
        >
          <Save size={15} />
          {salvando ? 'Salvando…' : chamadaFeita ? 'Atualizar chamada' : 'Salvar chamada'}
        </button>
      </div>

      {/* Navegação de data */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setData(format(subDays(parseISO(data), 1), 'yyyy-MM-dd'))}
          className="p-1.5 rounded-btn border border-border bg-card hover:bg-bg-alt transition-colors"
          aria-label="Dia anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-btn border border-border bg-card px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-cyan"
        />
        <span className="text-sm text-fg-dim capitalize">
          {format(parseISO(data), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </span>
        <button
          onClick={() => setData(format(addDays(parseISO(data), 1), 'yyyy-MM-dd'))}
          className="p-1.5 rounded-btn border border-border bg-card hover:bg-bg-alt transition-colors"
          aria-label="Próximo dia"
        >
          <ChevronRight size={16} />
        </button>
        {data !== hoje && (
          <button
            onClick={() => setData(hoje)}
            className="text-xs text-cyan hover:underline"
          >
            Hoje
          </button>
        )}
      </div>

      {/* Resumo */}
      {alunos.length > 0 && (
        <div className="flex gap-3 mb-5">
          <Pill label={`${presentes} presentes`} color="text-green bg-green-soft border-green/20" />
          <Pill label={`${faltas} falta${faltas !== 1 ? 's' : ''}`} color="text-coral bg-coral/10 border-coral/20" />
          {atestados > 0 && (
            <Pill label={`${atestados} atestado${atestados !== 1 ? 's' : ''}`} color="text-amber-700 bg-amber-50 border-amber-200" />
          )}
          {chamadaFeita && (
            <span className="text-xs text-fg-faint self-center ml-auto">✓ Chamada já lançada</span>
          )}
        </div>
      )}

      {/* Lista de alunos */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-card bg-bg-alt animate-pulse" />
          ))}
        </div>
      ) : alunos.length === 0 ? (
        <div className="text-center py-16 text-fg-dim text-sm">
          Nenhum aluno matriculado nesta turma.
        </div>
      ) : (
        <ul className="space-y-2">
          {alunos.map((aluno, idx) => {
            const s = estado[aluno.id] ?? 'presente'
            const cfg = STATUS_CONFIG[s]
            return (
              <li key={aluno.id}>
                <button
                  onClick={() => toggleStatus(aluno.id)}
                  className={[
                    'w-full flex items-center gap-4 px-4 py-3 rounded-card border transition-all text-left',
                    'hover:-translate-y-px hover:shadow-sm',
                    cfg.cls,
                  ].join(' ')}
                >
                  <span className="text-sm font-medium text-fg-faint w-6 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-medium text-[15px]">{aluno.nome}</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold shrink-0">
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </button>
                {s === 'atestado' && (
                  <input
                    type="text"
                    placeholder="Observação (opcional)"
                    value={obs[aluno.id] ?? ''}
                    onChange={(e) => setObs((prev) => ({ ...prev, [aluno.id]: e.target.value }))}
                    className="mt-1 ml-10 w-[calc(100%-2.5rem)] rounded-btn border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-amber-300"
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {label}
    </span>
  )
}
