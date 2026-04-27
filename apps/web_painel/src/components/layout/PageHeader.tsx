import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[28px] font-bold tracking-tight text-fg">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-dim">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function HeaderBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'info' | 'warning'
}) {
  const toneClass = {
    neutral: 'border-border bg-bg-alt text-fg-dim',
    success: 'border-green/20 bg-green-soft text-green',
    info: 'border-cyan/20 bg-cyan/5 text-cyan',
    warning: 'border-yellow/30 bg-yellow/10 text-fg',
  }[tone]

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}
