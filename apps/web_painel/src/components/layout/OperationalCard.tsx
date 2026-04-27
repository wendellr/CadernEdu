import type { ReactNode } from 'react'

type OperationalCardProps = {
  title: string
  value: string
  description: string
  icon: ReactNode
  tone?: 'green' | 'cyan' | 'coral' | 'purple' | 'yellow'
}

const toneClass = {
  green: 'bg-green-soft text-green border-green/20',
  cyan: 'bg-cyan/5 text-cyan border-cyan/20',
  coral: 'bg-coral/10 text-coral border-coral/20',
  purple: 'bg-purple/10 text-purple border-purple/20',
  yellow: 'bg-yellow/10 text-fg border-yellow/30',
}

export function OperationalCard({
  title,
  value,
  description,
  icon,
  tone = 'cyan',
}: OperationalCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-faint">
            {title}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-fg">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-btn border ${toneClass[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm leading-5 text-fg-dim">{description}</p>
    </div>
  )
}
