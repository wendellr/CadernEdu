'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, School } from 'lucide-react'
import { toast } from 'sonner'
import { getSecretariaAtiva } from '@/lib/auth'
import { criarTurma, listEscolas, listTurmas, removerTurma, type Escola, type Turma } from '@/lib/api'
import { Field, Modal, inputClass, selectClass } from '@/components/ui/Modal'
import { QuickSearch, SortHeader, compareValues, normalizeSearch, type SortDirection } from '@/components/ui/listing'

interface TurmaComEscola extends Turma {
  escolaNome: string
}

type SortKey = 'nome' | 'serie' | 'escolaNome' | 'ano_letivo' | 'ativo'

const SERIES = [
  '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
  '6º Ano', '7º Ano', '8º Ano', '9º Ano',
  'EJA I', 'EJA II',
]

export default function TurmasPage() {
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [turmas, setTurmas] = useState<TurmaComEscola[]>([])
  const [escolaFiltro, setEscolaFiltro] = useState<string>('')
  const [busca, setBusca] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'nome', direction: 'asc' })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ escola_id: '', nome: '', serie: '', ano_letivo: String(new Date().getFullYear()) })
  const [erros, setErros] = useState<Record<string, string>>({})

  const secretaria = getSecretariaAtiva()

  async function carregar() {
    if (!secretaria) return
    setLoading(true)
    try {
      const lista = await listEscolas(secretaria.id)
      setEscolas(lista)
      const todas = await Promise.all(
        lista.map(async (e) => {
          const ts = await listTurmas(e.id).catch(() => [])
          return ts.map((t) => ({ ...t, escolaNome: e.nome }))
        }),
      )
      setTurmas(todas.flat())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [secretaria?.id])

  function validar() {
    const e: Record<string, string> = {}
    if (!form.escola_id) e.escola_id = 'Selecione uma escola'
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.serie) e.serie = 'Selecione a série'
    const ano = Number(form.ano_letivo)
    if (!ano || ano < 2020 || ano > 2100) e.ano_letivo = 'Ano inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return
    setSalvando(true)
    try {
      await criarTurma(form.escola_id, {
        nome: form.nome.trim(),
        serie: form.serie,
        ano_letivo: Number(form.ano_letivo),
      })
      toast.success('Turma criada com sucesso.')
      setModal(false)
      setForm({ escola_id: '', nome: '', serie: '', ano_letivo: String(new Date().getFullYear()) })
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao criar turma.')
    } finally {
      setSalvando(false)
    }
  }

  async function inativar(turma: Turma) {
    if (!confirm(`Inativar ${turma.nome}?`)) return
    try {
      await removerTurma(turma.id)
      toast.success('Turma inativada.')
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao inativar turma.')
    }
  }

  function ordenarPor(key: SortKey) {
    setSort((atual) => ({
      key,
      direction: atual.key === key && atual.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const turmasFiltradas = useMemo(() => {
    const termo = normalizeSearch(busca)
    return turmas
      .filter((t) => !escolaFiltro || t.escola_id === escolaFiltro)
      .filter((t) => {
        if (!termo) return true
        return [t.nome, t.serie, t.escolaNome, t.ano_letivo, t.ativo ? 'ativa' : 'inativa']
          .some((valor) => normalizeSearch(valor).includes(termo))
      })
      .sort((a, b) => compareValues(a[sort.key], b[sort.key], sort.direction))
  }, [busca, escolaFiltro, sort, turmas])

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-faint mb-1">Secretaria</p>
          <h1 className="text-xl font-bold text-fg">Turmas</h1>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-cyan text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-deep transition-colors"
        >
          <Plus size={16} />
          Nova turma
        </button>
      </div>

      {/* Filtro por escola */}
      {!loading && turmas.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <QuickSearch
              value={busca}
              onChange={setBusca}
              placeholder="Buscar turma, série ou escola"
            />
            {escolas.length > 1 && (
          <select
            className="rounded-lg border border-border bg-card text-sm text-fg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan/40"
            value={escolaFiltro}
            onChange={(e) => setEscolaFiltro(e.target.value)}
          >
            <option value="">Todas as escolas</option>
            {escolas.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
            )}
          </div>
          <p className="text-xs text-fg-faint">
            {turmasFiltradas.length} de {turmas.length} turma{turmas.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-bg-alt rounded-xl animate-pulse" />
          ))}
        </div>
      ) : turmasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <School size={36} className="text-fg-faint" />
          <p className="text-fg-dim text-sm">
            {turmas.length === 0 ? 'Nenhuma turma encontrada.' : 'Nenhuma turma encontrada para os filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-alt border-b border-border">
              <tr>
                <th className="px-4 py-3"><SortHeader label="Turma" active={sort.key === 'nome'} direction={sort.direction} onClick={() => ordenarPor('nome')} /></th>
                <th className="px-4 py-3"><SortHeader label="Série" active={sort.key === 'serie'} direction={sort.direction} onClick={() => ordenarPor('serie')} /></th>
                <th className="px-4 py-3"><SortHeader label="Escola" active={sort.key === 'escolaNome'} direction={sort.direction} onClick={() => ordenarPor('escolaNome')} /></th>
                <th className="px-4 py-3"><SortHeader label="Ano Letivo" active={sort.key === 'ano_letivo'} direction={sort.direction} onClick={() => ordenarPor('ano_letivo')} align="center" /></th>
                <th className="px-4 py-3"><SortHeader label="Status" active={sort.key === 'ativo'} direction={sort.direction} onClick={() => ordenarPor('ativo')} align="center" /></th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {turmasFiltradas.map((t) => (
                <tr key={t.id} className="hover:bg-bg-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-fg">{t.nome}</td>
                  <td className="px-4 py-3 text-fg-dim">{t.serie}</td>
                  <td className="px-4 py-3 text-fg-faint text-xs">{t.escolaNome}</td>
                  <td className="px-4 py-3 text-center text-fg-dim">{t.ano_letivo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green/10 text-green">
                      Ativa
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => inativar(t)}
                      className="text-xs font-medium text-coral hover:underline"
                    >
                      Inativar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nova turma" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Escola" required error={erros.escola_id}>
              <select
                className={selectClass}
                value={form.escola_id}
                onChange={(e) => setForm((f) => ({ ...f, escola_id: e.target.value }))}
              >
                <option value="">Selecione…</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Nome da turma" required error={erros.nome}>
              <input
                className={inputClass}
                placeholder="Ex: 5º Ano A"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Série" required error={erros.serie}>
                <select
                  className={selectClass}
                  value={form.serie}
                  onChange={(e) => setForm((f) => ({ ...f, serie: e.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {SERIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Ano letivo" required error={erros.ano_letivo}>
                <input
                  className={inputClass}
                  type="number"
                  min={2020}
                  max={2100}
                  value={form.ano_letivo}
                  onChange={(e) => setForm((f) => ({ ...f, ano_letivo: e.target.value }))}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 text-sm text-fg-dim hover:text-fg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="px-4 py-2 bg-cyan text-white text-sm font-medium rounded-lg hover:bg-cyan-deep disabled:opacity-60 transition-colors"
              >
                {salvando ? 'Salvando…' : 'Criar turma'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
