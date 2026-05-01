'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { login, loginOptions, getSecretaria, getEscola, ApiError, type LoginOption } from '@/lib/api'
import { setToken, setUser, setSecretariaAtiva, setEscolaAtiva } from '@/lib/auth'

type FormValues = { email: string; senha: string }

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [opcoes, setOpcoes] = useState<LoginOption[]>([])
  const [credenciais, setCredenciais] = useState<FormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  async function concluirLogin(values: FormValues, usuarioId: string) {
    const { accessToken } = await login(values.email, values.senha, usuarioId)
    setToken(accessToken)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setUser({
        name: payload.name ?? values.email,
        email: payload.email ?? values.email,
        perfil: payload.perfil,
        secretaria_id: payload.secretaria_id,
        escola_id: payload.escola_id,
      })
      await Promise.allSettled([
        payload.secretaria_id
          ? getSecretaria(payload.secretaria_id).then((s) => setSecretariaAtiva({ id: s.id, nome: s.nome }))
          : Promise.resolve(),
        payload.escola_id
          ? getEscola(payload.escola_id).then((e) => setEscolaAtiva({ id: e.id, nome: e.nome, secretaria_id: e.secretaria_id }))
          : Promise.resolve(),
      ])
    } catch {
      setUser({ name: values.email, email: values.email })
    }
    router.replace('/')
  }

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setOpcoes([])
    try {
      const perfis = await loginOptions(values.email, values.senha)
      if (perfis.length === 1) {
        await concluirLogin(values, perfis[0].usuario_id)
        return
      }
      setCredenciais(values)
      setOpcoes(perfis)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao conectar com o servidor'
      setErro(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function escolherPerfil(opcao: LoginOption) {
    if (!credenciais) return
    setLoading(true)
    try {
      await concluirLogin(credenciais, opcao.usuario_id)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao conectar com o servidor'
      setErro(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <BrandMark />
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-green">Cadern</span>
            <span className="text-cyan">Edu</span>
            <span className="text-fg-faint font-normal text-base"> · Painel</span>
          </span>
        </div>

        <div className="bg-card rounded-card shadow-md p-8">
          <h1 className="font-display font-bold text-xl text-fg mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-fg-dim mb-6">Entre com seu e-mail e senha para acessar o painel.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fg mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="professor@escola.edu.br"
                className={inputCls(!!errors.email)}
                {...register('email', {
                  required: 'E-mail obrigatório',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-coral">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-fg mb-1">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls(!!errors.senha)}
                {...register('senha', {
                  required: 'Senha obrigatória',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              {errors.senha && <p className="mt-1 text-xs text-coral">{errors.senha.message}</p>}
            </div>

            {erro && (
              <div className="rounded-btn bg-coral/10 border border-coral/30 px-3 py-2.5 text-sm text-coral">
                {erro}
              </div>
            )}

            {opcoes.length > 1 && (
              <div className="rounded-btn border border-border bg-bg-alt p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-faint">
                  Escolha o perfil
                </p>
                <div className="space-y-2">
                  {opcoes.map((opcao) => (
                    <button
                      key={opcao.usuario_id}
                      type="button"
                      disabled={loading}
                      onClick={() => escolherPerfil(opcao)}
                      className="w-full rounded-btn border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-cyan hover:bg-cyan/5 disabled:opacity-60"
                    >
                      <span className="block font-semibold text-fg">{perfilLabel(opcao.perfil)}</span>
                      <span className="mt-0.5 block text-xs text-fg-faint">
                        {[opcao.nome, opcao.escola_nome, opcao.secretaria_nome].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={() => { setErro(null); setOpcoes([]) }}
              className="mt-2 w-full rounded-btn bg-cyan text-white font-semibold text-sm py-2.5 hover:bg-cyan-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-fg-faint mt-6">
          Acesso por convite da secretaria municipal.
        </p>
      </div>
    </main>
  )
}

function perfilLabel(perfil: string) {
  const map: Record<string, string> = {
    aluno: 'Aluno',
    responsavel: 'Responsável',
    professor: 'Professor',
    diretor: 'Diretor',
    coordenador: 'Coordenador',
    gestor_escola: 'Gestor escolar',
    secretaria: 'Secretaria',
  }
  return map[perfil] ?? perfil
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-btn border px-3 py-2 text-sm text-fg bg-card',
    'placeholder:text-fg-faint',
    'focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent',
    hasError ? 'border-coral' : 'border-border',
  ].join(' ')
}

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="14" y="26" width="34" height="48" rx="4" fill="#1B7B3F" />
      <rect x="52" y="26" width="34" height="48" rx="4" fill="#0891B2" />
      <line x1="20" y1="38" x2="42" y2="38" stroke="#fff" strokeWidth="2" />
      <line x1="20" y1="46" x2="42" y2="46" stroke="#fff" strokeWidth="2" />
      <line x1="20" y1="54" x2="38" y2="54" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}
