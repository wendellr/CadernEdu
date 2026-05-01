'use client'

import { Bus } from 'lucide-react'
import { getUser } from '@/lib/auth'

export default function TransportePage() {
  const user = getUser()
  const escopo = user?.perfil === 'secretaria' ? 'secretaria' : 'escola'

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-fg-faint">
          {escopo === 'secretaria' ? 'Secretaria' : 'Escola'}
        </p>
        <h1 className="text-xl font-bold text-fg">Transporte</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
          <Bus size={22} />
        </div>
        <h2 className="font-display text-base font-bold text-fg">Módulo preparado para o escopo de {escopo}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-dim">
          Secretaria gerencia rotas e contratos de toda a rede. Direção e coordenação
          acompanham rotas da escola. Professores, alunos e responsáveis visualizam
          transporte associado aos alunos dentro do próprio escopo.
        </p>
      </div>
    </div>
  )
}
