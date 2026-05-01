'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { getSecretariaAtiva, getUser } from '@/lib/auth'
import { criarUsuario, listEscolas, listUsuarios, removerUsuario, type Escola, type PerfilUsuario, type Usuario } from '@/lib/api'
import { Field, Modal, inputClass, selectClass } from '@/components/ui/Modal'

type Tab = 'alunos' | 'professores' | 'direcao' | 'responsaveis' | 'secretaria'

const TABS: { key: Tab; label: string; perfil: PerfilUsuario }[] = [
  { key: 'alunos', label: 'Alunos', perfil: 'aluno' },
  { key: 'professores', label: 'Professores', perfil: 'professor' },
  { key: 'direcao', label: 'Direção/Coordenação', perfil: 'diretor' },
  { key: 'responsaveis', label: 'Responsáveis', perfil: 'responsavel' },
  { key: 'secretaria', label: 'Secretaria', perfil: 'secretaria' },
]

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  responsavel: 'Responsável',
  diretor: 'Diretor',
  coordenador: 'Coordenador',
  gestor_escola: 'Gestor escolar',
  secretaria: 'Secretaria',
}

export default function PessoasPage() {
  const searchParams = useSearchParams()
  const tabParam = (searchParams.get('tab') as Tab) ?? 'alunos'

  const [tab, setTab] = useState<Tab>(tabParam)
  const [usuarios, setUsuarios] = useState<Record<Tab, Usuario[]>>({
    alunos: [], professores: [], direcao: [], responsaveis: [], secretaria: [],
  })
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', perfil: 'aluno' as PerfilUsuario, escola_id: '' })
  const [erros, setErros] = useState<Record<string, string>>({})

  const secretaria = getSecretariaAtiva()
  const user = getUser()
  const isSecretaria = user?.perfil === 'secretaria'
  const tabsVisiveis = isSecretaria ? TABS : TABS.filter((t) => t.key !== 'secretaria')

  const carregar = useCallback(async () => {
    if (!secretaria) return
    setLoading(true)
    try {
      const [alunos, professores, diretores, coordenadores, responsaveis, secretariaUsers, lista] = await Promise.all([
        listUsuarios(secretaria.id, 'aluno'),
        listUsuarios(secretaria.id, 'professor'),
        listUsuarios(secretaria.id, 'diretor'),
        listUsuarios(secretaria.id, 'coordenador'),
        listUsuarios(secretaria.id, 'responsavel'),
        isSecretaria ? listUsuarios(secretaria.id, 'secretaria') : Promise.resolve([]),
        listEscolas(secretaria.id),
      ])
      setUsuarios({ alunos, professores, direcao: [...diretores, ...coordenadores], responsaveis, secretaria: secretariaUsers })
      setEscolas(lista)
    } finally {
      setLoading(false)
    }
  }, [secretaria?.id, isSecretaria])

  useEffect(() => { carregar() }, [carregar])

  function validar() {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'E-mail inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar() || !secretaria) return
    setSalvando(true)
    try {
      await criarUsuario({
        keycloak_id: `manual-${crypto.randomUUID()}`,
        nome: form.nome.trim(),
        email: form.email.trim(),
        perfil: form.perfil,
        secretaria_id: secretaria.id,
        escola_id: form.escola_id || null,
      })
      toast.success('Pessoa cadastrada com sucesso.')
      setModal(false)
      setForm({ nome: '', email: '', perfil: 'aluno', escola_id: '' })
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao cadastrar.')
    } finally {
      setSalvando(false)
    }
  }

  const lista = usuarios[tab]

  const perfilCorMap: Record<PerfilUsuario, string> = {
    aluno: 'bg-purple-100 text-purple-600',
    professor: 'bg-amber-100 text-amber-600',
    responsavel: 'bg-rose-100 text-rose-600',
    diretor: 'bg-cyan/10 text-cyan',
    coordenador: 'bg-cyan/10 text-cyan',
    gestor_escola: 'bg-cyan/10 text-cyan',
    secretaria: 'bg-green/10 text-green',
  }

  async function inativar(usuario: Usuario) {
    if (!confirm(`Inativar ${usuario.nome}?`)) return
    try {
      await removerUsuario(usuario.id)
      toast.success('Pessoa inativada.')
      await carregar()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao inativar pessoa.')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-faint mb-1">Secretaria</p>
          <h1 className="text-xl font-bold text-fg">Pessoas</h1>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-cyan text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-deep transition-colors"
        >
          <Plus size={16} />
          Cadastrar pessoa
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-alt rounded-lg p-1 w-fit mb-6">
        {tabsVisiveis.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-card text-fg shadow-sm'
                : 'text-fg-dim hover:text-fg',
            ].join(' ')}
          >
            {t.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-cyan/10 text-cyan' : 'bg-border text-fg-faint'}`}>
              {loading ? '…' : usuarios[t.key].length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-bg-alt rounded-xl animate-pulse" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <Users size={36} className="text-fg-faint" />
          <p className="text-fg-dim text-sm">Nenhum registro encontrado.</p>
          <button
            onClick={() => { setForm((f) => ({ ...f, perfil: TABS.find((t) => t.key === tab)!.perfil })); setModal(true) }}
            className="text-cyan text-sm font-medium hover:underline"
          >
            Cadastrar agora
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-alt border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">E-mail</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Perfil</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((u) => (
                <tr key={u.id} className="hover:bg-bg-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-fg">{u.nome}</td>
                  <td className="px-4 py-3 text-fg-faint text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${perfilCorMap[u.perfil]}`}>
                      {PERFIL_LABEL[u.perfil]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? 'bg-green/10 text-green' : 'bg-bg-alt text-fg-faint'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => inativar(u)}
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
        <Modal title="Cadastrar pessoa" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Perfil" required>
              <select
                className={selectClass}
                value={form.perfil}
                onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value as PerfilUsuario }))}
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="diretor">Diretor</option>
                <option value="coordenador">Coordenador</option>
                <option value="responsavel">Responsável</option>
                {isSecretaria && <option value="secretaria">Secretaria</option>}
              </select>
            </Field>
            <Field label="Nome completo" required error={erros.nome}>
              <input
                className={inputClass}
                placeholder="Ex: Maria da Silva"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </Field>
            <Field label="E-mail" required error={erros.email}>
              <input
                className={inputClass}
                type="email"
                placeholder="pessoa@escola.edu.br"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            {escolas.length > 0 && (
              <Field label="Escola">
                <select
                  className={selectClass}
                  value={form.escola_id}
                  onChange={(e) => setForm((f) => ({ ...f, escola_id: e.target.value }))}
                >
                  <option value="">Sem vínculo específico</option>
                  {escolas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </Field>
            )}
            <p className="text-xs text-fg-faint bg-bg-alt rounded-lg px-3 py-2">
              O acesso ao app será ativado após o primeiro login via convite da escola.
            </p>
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
                {salvando ? 'Salvando…' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
