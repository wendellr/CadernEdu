'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, GraduationCap, School, Users } from 'lucide-react'
import { getSecretariaAtiva } from '@/lib/auth'
import { listEscolas, listTurmas, listUsuarios } from '@/lib/api'

interface Stats {
  escolas: number
  turmas: number
  alunos: number
  professores: number
  gestores: number
  responsaveis: number
}

export default function SecretariaPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const secretaria = getSecretariaAtiva()

  useEffect(() => {
    if (!secretaria) return
    async function load() {
      try {
        const [escolas, usuarios] = await Promise.all([
          listEscolas(secretaria!.id),
          listUsuarios(secretaria!.id),
        ])
        const turmasArr = await Promise.all(escolas.map((e) => listTurmas(e.id)))
        const turmas = turmasArr.flat()
        setStats({
          escolas: escolas.length,
          turmas: turmas.length,
          alunos: usuarios.filter((u) => u.perfil === 'aluno').length,
          professores: usuarios.filter((u) => u.perfil === 'professor').length,
          gestores: usuarios.filter((u) => ['diretor', 'coordenador', 'gestor_escola'].includes(u.perfil)).length,
          responsaveis: usuarios.filter((u) => u.perfil === 'responsavel').length,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [secretaria?.id])

  if (!secretaria) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-fg-dim text-sm">Selecione uma escola para acessar o painel da secretaria.</p>
        <Link href="/turmas" className="text-cyan text-sm font-medium hover:underline">
          Ir para seleção de turma
        </Link>
      </div>
    )
  }

  const cards = [
    { label: 'Escolas', value: stats?.escolas, icon: <Building2 size={20} />, href: '/secretaria/escolas', color: 'bg-cyan/10 text-cyan' },
    { label: 'Turmas', value: stats?.turmas, icon: <School size={20} />, href: '/secretaria/turmas', color: 'bg-green/10 text-green' },
    { label: 'Alunos', value: stats?.alunos, icon: <GraduationCap size={20} />, href: '/secretaria/pessoas?tab=alunos', color: 'bg-purple-100 text-purple-600' },
    { label: 'Professores', value: stats?.professores, icon: <Users size={20} />, href: '/secretaria/pessoas?tab=professores', color: 'bg-amber-100 text-amber-600' },
    { label: 'Direção', value: stats?.gestores, icon: <Users size={20} />, href: '/secretaria/pessoas?tab=direcao', color: 'bg-cyan/10 text-cyan' },
    { label: 'Responsáveis', value: stats?.responsaveis, icon: <Users size={20} />, href: '/secretaria/pessoas?tab=responsaveis', color: 'bg-rose-100 text-rose-600' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-fg-faint mb-1">Secretaria</p>
        <h1 className="text-2xl font-bold text-fg">{secretaria.nome}</h1>
        <p className="text-sm text-fg-dim mt-1">Visão geral e acesso rápido aos módulos administrativos.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-cyan/40 hover:shadow-sm transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-fg">
              {loading ? <span className="inline-block w-6 h-5 bg-bg-alt rounded animate-pulse" /> : (c.value ?? 0)}
            </p>
            <p className="text-xs text-fg-faint mt-0.5">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Escolas e turmas', desc: 'Gerencie escolas e crie novas turmas.', href: '/secretaria/escolas' },
          { label: 'Pessoas', desc: 'Cadastre alunos, professores e responsáveis.', href: '/secretaria/pessoas' },
          { label: 'Cardápio', desc: 'Publique o cardápio semanal.', href: '/secretaria/cardapio' },
          { label: 'Transporte', desc: 'Gerencie rotas e vínculos dos alunos.', href: '/secretaria/transporte' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-card border border-border rounded-xl p-5 hover:border-cyan/40 hover:shadow-sm transition-all">
            <p className="text-sm font-semibold text-fg mb-1">{item.label}</p>
            <p className="text-xs text-fg-faint">{item.desc}</p>
            <span className="inline-block mt-3 text-xs text-cyan font-medium">Acessar →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
