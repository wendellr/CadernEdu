'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { format, startOfWeek, endOfWeek, parseISO, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { listAulas, listAtividades, criarAula, atualizarAula, criarAtividade, atualizarAtividade, removerAula, getTurma, ApiError, type Aula, type Atividade, type Turma } from '@/lib/api'

// ── Cores por disciplina ───────────────────────────────────────────────────────
// Hash determinístico: mesma disciplina → mesma cor sempre

const PALETA = [
  { bg: '#E0F2FE', border: '#7DD3FC', tag: '#0369A1' }, // sky
  { bg: '#E6F4EA', border: '#86EFAC', tag: '#145E2E' }, // green
  { bg: '#FEF9C3', border: '#FDE047', tag: '#854D0E' }, // amber
  { bg: '#EDE9FE', border: '#C4B5FD', tag: '#5B21B6' }, // violet
  { bg: '#CCFBF1', border: '#5EEAD4', tag: '#0F766E' }, // teal
  { bg: '#FFEDD5', border: '#FED7AA', tag: '#9A3412' }, // orange
  { bg: '#DCFCE7', border: '#6EE7B7', tag: '#065F46' }, // emerald
]

function corDisciplina(disciplina: string) {
  let h = 0
  for (const c of disciplina.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return PALETA[Math.abs(h) % PALETA.length]
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

type AulaForm = {
  data: string
  disciplina: string
  conteudo: string
  observacoes?: string
  temAtividade: boolean
  atv_descricao?: string
  atv_prazo?: string
  atv_peso?: string
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function AgendaPage() {
  const { turmaId } = useParams<{ turmaId: string }>()
  const [turma, setTurma] = useState<Turma | null>(null)
  const [aulas, setAulas] = useState<Aula[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [semana, setSemana] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aulaEditando, setAulaEditando] = useState<Aula | null>(null)
  const [atividadeEditandoId, setAtividadeEditandoId] = useState<string | null>(null)

  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const fim = endOfWeek(semana, { weekStartsOn: 1 })
  const dataInicio = format(inicio, 'yyyy-MM-dd')
  const dataFim = format(fim, 'yyyy-MM-dd')
  const hoje = format(new Date(), 'yyyy-MM-dd')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<AulaForm>()
  const temAtividade = watch('temAtividade', false)

  useEffect(() => {
    getTurma(turmaId).then(setTurma).catch(() => {})
  }, [turmaId])

  const carregarAulas = useCallback(async () => {
    setLoading(true)
    try {
      const [aulasData, atividadesData] = await Promise.all([
        listAulas(turmaId, dataInicio, dataFim),
        listAtividades(turmaId, dataInicio, dataFim),
      ])
      setAulas(aulasData)
      setAtividades(atividadesData)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao carregar aulas')
    } finally {
      setLoading(false)
    }
  }, [turmaId, dataInicio, dataFim])

  useEffect(() => { carregarAulas() }, [carregarAulas])

  function abrirModal(dataPre?: string, aulaExistente?: Aula) {
    setAulaEditando(aulaExistente ?? null)
    const atv = aulaExistente
      ? (atividades.find((a) => a.aula_id === aulaExistente.id) ?? null)
      : null
    setAtividadeEditandoId(atv?.id ?? null)
    reset({
      data: aulaExistente?.data ?? dataPre ?? hoje,
      disciplina: aulaExistente?.disciplina ?? '',
      conteudo: aulaExistente?.conteudo ?? '',
      observacoes: aulaExistente?.observacoes ?? '',
      temAtividade: !!atv,
      atv_descricao: atv?.descricao ?? '',
      atv_prazo: atv?.prazo ?? aulaExistente?.data ?? dataPre ?? hoje,
      atv_peso: atv?.peso != null ? String(atv.peso) : '',
    })
    setModalOpen(true)
  }

  async function onSalvar(values: AulaForm) {
    setSalvando(true)
    try {
      let aulaId: string
      if (aulaEditando) {
        await atualizarAula(aulaEditando.id, {
          data: values.data,
          disciplina: values.disciplina,
          conteudo: values.conteudo,
          observacoes: values.observacoes || null,
        })
        aulaId = aulaEditando.id
        toast.success('Aula atualizada!')
      } else {
        const aula = await criarAula(turmaId, {
          data: values.data,
          disciplina: values.disciplina,
          conteudo: values.conteudo,
          observacoes: values.observacoes || null,
        })
        aulaId = aula.id
        toast.success('Aula registrada!')
      }

      if (values.temAtividade && values.atv_descricao && values.atv_prazo) {
        if (atividadeEditandoId) {
          await atualizarAtividade(atividadeEditandoId, {
            disciplina: values.disciplina,
            descricao: values.atv_descricao,
            prazo: values.atv_prazo,
            peso: values.atv_peso ? parseFloat(values.atv_peso) : null,
          })
        } else {
          await criarAtividade(turmaId, {
            aula_id: aulaId,
            disciplina: values.disciplina,
            descricao: values.atv_descricao,
            prazo: values.atv_prazo,
            peso: values.atv_peso ? parseFloat(values.atv_peso) : null,
          })
        }
      }

      setModalOpen(false)
      carregarAulas()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar aula')
    } finally {
      setSalvando(false)
    }
  }

  async function onRemover(aulaId: string) {
    if (!confirm('Remover esta aula?')) return
    try {
      await removerAula(aulaId)
      toast.success('Aula removida')
      setAulas((prev) => prev.filter((a) => a.id !== aulaId))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao remover aula')
    }
  }

  // 7 dias da semana (seg → dom)
  // Domingo (índice 6) é sempre não-letivo; sábado (índice 5) pode ter atividade
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return format(d, 'yyyy-MM-dd')
  })

  const aulasPorDia = aulas.reduce<Record<string, Aula[]>>((acc, a) => {
    acc[a.data] = [...(acc[a.data] ?? []), a]
    return acc
  }, {})

  const aulaIdsComAtividade = new Set(
    atividades.map((atv) => atv.aula_id).filter((id): id is string => id !== null)
  )

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">
            Agenda{turma ? ` — ${turma.nome}` : ''}
          </h1>
          <p className="text-sm text-fg-dim mt-0.5">
            {format(inicio, "d 'de' MMMM", { locale: ptBR })}
            {' '}–{' '}
            {format(fim, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSemana((s) => subWeeks(s, 1))}
            className="p-1.5 rounded-btn border border-border bg-card hover:bg-bg-alt transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setSemana(new Date())}
            className="text-xs font-medium text-fg-dim hover:text-fg px-3 py-1.5 rounded-btn border border-border bg-card hover:bg-bg-alt transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setSemana((s) => addWeeks(s, 1))}
            className="p-1.5 rounded-btn border border-border bg-card hover:bg-bg-alt transition-colors"
            aria-label="Próxima semana"
          >
            <ChevronRight size={16} />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-1.5 bg-cyan text-white text-sm font-semibold px-4 py-2 rounded-btn hover:bg-cyan-deep transition-colors"
          >
            <Plus size={15} />
            Nova Aula
          </button>
        </div>
      </div>

      {/* ── Grade semanal ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-7 gap-3">
          {diasSemana.map((d) => (
            <div key={d} className="rounded-card bg-bg-alt animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3 items-start overflow-x-auto pb-2">
          {diasSemana.map((dia, idx) => {
            const eDomingo = idx === 6
            const eSabado = idx === 5
            const aulasNoDia = aulasPorDia[dia] ?? []
            const eHoje = dia === hoje
            const parsed = parseISO(dia)
            const diaSemana = format(parsed, 'EEE', { locale: ptBR }).toUpperCase().replace('.', '')
            const diaMes = format(parsed, 'd')
            const mes = format(parsed, 'MMM', { locale: ptBR })

            return (
              <div key={dia} className="flex flex-col min-w-[120px]">
                {/* Cabeçalho do dia */}
                <div
                  className={[
                    'rounded-btnLg px-3 py-2.5 mb-2 text-center transition-colors',
                    eDomingo
                      ? 'bg-bg text-fg-faint opacity-50'
                      : eHoje
                        ? 'bg-cyan text-white'
                        : eSabado
                          ? 'bg-amber-50 border border-amber-200 text-fg-dim'
                          : 'bg-bg-alt text-fg-dim',
                  ].join(' ')}
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                    {diaSemana}
                  </p>
                  <p className={`text-2xl font-bold leading-tight ${eHoje ? 'text-white' : eDomingo ? 'text-fg-faint' : 'text-fg'}`}>
                    {diaMes}
                  </p>
                  <p className="text-[11px] capitalize opacity-70">{mes}</p>
                  {eSabado && (
                    <p className="text-[9px] text-amber-600 font-medium uppercase tracking-wide mt-0.5">
                      Letivo eventual
                    </p>
                  )}
                </div>

                {/* Cards de aula (não renderiza se domingo) */}
                {!eDomingo && (
                  <>
                    <div className="flex flex-col gap-2 flex-1">
                      {aulasNoDia.map((aula) => (
                        <AulaCard
                          key={aula.id}
                          aula={aula}
                          hasAtividade={aulaIdsComAtividade.has(aula.id)}
                          onEditar={(a) => abrirModal(undefined, a)}
                          onRemover={onRemover}
                        />
                      ))}
                    </div>

                    {/* Botão adicionar no dia */}
                    <button
                      onClick={() => abrirModal(dia)}
                      className={[
                        'mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-btnLg',
                        'text-xs font-medium transition-colors border border-dashed',
                        eHoje
                          ? 'border-cyan/40 text-cyan hover:bg-cyan/5'
                          : eSabado
                            ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                            : 'border-border text-fg-faint hover:text-fg hover:border-fg-faint hover:bg-bg-alt',
                      ].join(' ')}
                      aria-label={`Adicionar aula em ${format(parsed, "d 'de' MMMM", { locale: ptBR })}`}
                    >
                      <Plus size={12} />
                      Aula
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal nova aula ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nova aula"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-card rounded-card shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-fg">
                {aulaEditando ? 'Editar Aula' : 'Nova Aula'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-fg-faint hover:text-fg transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSalvar)} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-fg mb-1">Data</label>
                  <input
                    type="date"
                    className={inputCls(!!errors.data)}
                    {...register('data', { required: 'Data obrigatória' })}
                  />
                  {errors.data && (
                    <p className="mt-0.5 text-xs text-coral">{errors.data.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg mb-1">Disciplina</label>
                  <input
                    type="text"
                    placeholder="Matemática"
                    className={inputCls(!!errors.disciplina)}
                    {...register('disciplina', { required: 'Obrigatória' })}
                  />
                  {errors.disciplina && (
                    <p className="mt-0.5 text-xs text-coral">{errors.disciplina.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-fg mb-1">Conteúdo</label>
                <textarea
                  rows={3}
                  placeholder="O que foi trabalhado na aula…"
                  className={inputCls(!!errors.conteudo) + ' resize-none'}
                  {...register('conteudo', { required: 'Obrigatório' })}
                />
                {errors.conteudo && (
                  <p className="mt-0.5 text-xs text-coral">{errors.conteudo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-fg mb-1">
                  Observações{' '}
                  <span className="text-fg-faint font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Materiais, recados…"
                  className={inputCls(false)}
                  {...register('observacoes')}
                />
              </div>

              {/* Atividade de casa */}
              <div className="rounded-btnLg border border-border overflow-hidden">
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-alt transition-colors select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-cyan rounded"
                      {...register('temAtividade')}
                    />
                    <div>
                      <p className="text-sm font-medium text-fg">Atividade de casa</p>
                      <p className="text-xs text-fg-faint">Vincula uma atividade a esta aula</p>
                    </div>
                  </label>

                  {temAtividade && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border bg-bg-alt/50">
                      <div className="pt-3">
                        <label className="block text-xs font-medium text-fg mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          placeholder="O que o aluno deve fazer…"
                          className={inputCls(!!errors.atv_descricao) + ' resize-none'}
                          {...register('atv_descricao', {
                            validate: (v) =>
                              !temAtividade || (!!v && v.trim().length > 0) || 'Obrigatória',
                          })}
                        />
                        {errors.atv_descricao && (
                          <p className="mt-0.5 text-xs text-coral">{errors.atv_descricao.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-fg mb-1">Prazo de entrega</label>
                          <input
                            type="date"
                            className={inputCls(!!errors.atv_prazo)}
                            {...register('atv_prazo', {
                              validate: (v) =>
                                !temAtividade || !!v || 'Obrigatório',
                            })}
                          />
                          {errors.atv_prazo && (
                            <p className="mt-0.5 text-xs text-coral">{errors.atv_prazo.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-fg mb-1">
                            Peso{' '}
                            <span className="text-fg-faint font-normal">(opcional)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Ex: 2,5"
                            className={inputCls(false)}
                            {...register('atv_peso')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-btn border border-border text-sm font-medium text-fg-dim hover:text-fg hover:bg-bg-alt transition-colors py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-btn bg-cyan text-white text-sm font-semibold py-2 hover:bg-cyan-deep transition-colors disabled:opacity-60"
                >
                  {salvando ? 'Salvando…' : aulaEditando ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ── Card de aula ───────────────────────────────────────────────────────────────

function AulaCard({ aula, hasAtividade, onEditar, onRemover }: { aula: Aula; hasAtividade: boolean; onEditar: (aula: Aula) => void; onRemover: (id: string) => void }) {
  const cor = corDisciplina(aula.disciplina)

  return (
    <div
      className="rounded-btnLg p-3 border-l-4 relative group"
      style={{
        backgroundColor: cor.bg,
        borderLeftColor: cor.border,
        borderTopColor: `${cor.border}60`,
        borderRightColor: `${cor.border}60`,
        borderBottomColor: `${cor.border}60`,
        borderWidth: '1px',
        borderLeftWidth: '4px',
      }}
    >
      {/* Tag disciplina */}
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1.5 py-0.5 rounded"
        style={{ backgroundColor: `${cor.border}80`, color: cor.tag }}
      >
        {aula.disciplina}
      </span>

      {/* Conteúdo */}
      <p className="text-xs text-fg leading-snug">{aula.conteudo}</p>

      {/* Observações */}
      {aula.observacoes && (
        <p className="text-[11px] text-fg-dim mt-1.5 leading-snug">{aula.observacoes}</p>
      )}

      {/* Indicador de atividade de casa */}
      {hasAtividade && (
        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
          📋 Atividade de casa
        </span>
      )}

      {/* Ações (visíveis ao hover) */}
      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onEditar(aula)}
          className="p-0.5 text-fg-faint hover:text-cyan transition-colors rounded"
          aria-label="Editar aula"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onRemover(aula.id)}
          className="p-0.5 text-fg-faint hover:text-coral transition-colors rounded"
          aria-label="Remover aula"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Util ───────────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-btn border px-3 py-2 text-sm text-fg bg-card',
    'placeholder:text-fg-faint',
    'focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent',
    hasError ? 'border-coral' : 'border-border',
  ].join(' ')
}
