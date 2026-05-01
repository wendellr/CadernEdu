'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getSecretariaAtiva } from '@/lib/auth'
import { criarEscola, listEscolas, listTurmas, removerEscola, type Escola } from '@/lib/api'
import { Field, Modal, inputClass } from '@/components/ui/Modal'

interface EscolaComTurmas extends Escola {
  totalTurmas?: number
}

export default function EscolasPage() {
  const [escolas, setEscolas] = useState<EscolaComTurmas[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', codigo_inep: '' })
  const [erros, setErros] = useState<Record<string, string>>({})

  const secretaria = getSecretariaAtiva()

  async function carregar() {
    if (!secretaria) return
    setLoading(true)
    try {
      const lista = await listEscolas(secretaria.id)
      const comTurmas = await Promise.all(
        lista.map(async (e) => {
          const turmas = await listTurmas(e.id).catch(() => [])
          return { ...e, totalTurmas: turmas.length }
        }),
      )
      setEscolas(comTurmas)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [secretaria?.id])

  function validar() {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (form.codigo_inep && !/^\d{8}$/.test(form.codigo_inep))
      e.codigo_inep = 'Deve ter 8 dígitos numéricos'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar() || !secretaria) return
    setSalvando(true)
    try {
      await criarEscola(secretaria.id, {
        nome: form.nome.trim(),
        codigo_inep: form.codigo_inep || undefined,
      })
      toast.success('Escola criada com sucesso.')
      setModal(false)
      setForm({ nome: '', codigo_inep: '' })
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao criar escola.')
    } finally {
      setSalvando(false)
    }
  }

  async function inativar(escola: Escola) {
    if (!confirm(`Inativar ${escola.nome}?`)) return
    try {
      await removerEscola(escola.id)
      toast.success('Escola inativada.')
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao inativar escola.')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-faint mb-1">Secretaria</p>
          <h1 className="text-xl font-bold text-fg">Escolas</h1>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-cyan text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-deep transition-colors"
        >
          <Plus size={16} />
          Nova escola
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-bg-alt rounded-xl animate-pulse" />
          ))}
        </div>
      ) : escolas.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <Building2 size={36} className="text-fg-faint" />
          <p className="text-fg-dim text-sm">Nenhuma escola cadastrada.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-alt border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Cód. INEP</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Turmas</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {escolas.map((e) => (
                <tr key={e.id} className="hover:bg-bg-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-fg">{e.nome}</td>
                  <td className="px-4 py-3 text-fg-faint font-mono text-xs">{e.codigo_inep ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-fg-dim">{e.totalTurmas ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.ativo ? 'bg-green/10 text-green' : 'bg-bg-alt text-fg-faint'}`}>
                      {e.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => inativar(e)}
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
        <Modal title="Nova escola" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Nome da escola" required error={erros.nome}>
              <input
                className={inputClass}
                placeholder="EMEF Prof. João Silva"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </Field>
            <Field label="Código INEP" error={erros.codigo_inep}>
              <input
                className={inputClass}
                placeholder="12345678 (8 dígitos)"
                maxLength={8}
                value={form.codigo_inep}
                onChange={(e) => setForm((f) => ({ ...f, codigo_inep: e.target.value }))}
              />
            </Field>
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
                {salvando ? 'Salvando…' : 'Criar escola'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
