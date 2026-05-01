'use client'

import { Utensils } from 'lucide-react'
import { getUser } from '@/lib/auth'

export default function CardapioPage() {
  const user = getUser()
  const escopo = user?.perfil === 'secretaria' ? 'secretaria' : 'escola'

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-fg-faint">
          {escopo === 'secretaria' ? 'Secretaria' : 'Escola'}
        </p>
        <h1 className="text-xl font-bold text-fg">Cardápio</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-green/10 text-green">
          <Utensils size={22} />
        </div>
        <h2 className="font-display text-base font-bold text-fg">Módulo preparado para o escopo de {escopo}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-dim">
          Secretaria gerencia o cardápio de toda a rede. Direção e coordenação gerenciam
          o cardápio da escola. Professores, alunos e responsáveis visualizam as
          informações conforme suas turmas, filhos ou matrícula.
        </p>
      </div>
    </div>
  )
}
