import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from 'lucide-react'

export type SortDirection = 'asc' | 'desc'

export function normalizeSearch(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function compareValues(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined,
  direction: SortDirection,
): number {
  const multiplier = direction === 'asc' ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * multiplier
  if (typeof a === 'boolean' && typeof b === 'boolean') return (Number(a) - Number(b)) * multiplier
  return normalizeSearch(a).localeCompare(normalizeSearch(b), 'pt-BR') * multiplier
}

type QuickSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function QuickSearch({ value, onChange, placeholder = 'Buscar rapidamente' }: QuickSearchProps) {
  return (
    <div className="relative w-full sm:w-80">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-cyan/40"
      />
    </div>
  )
}

type SortHeaderProps = {
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
  align?: 'left' | 'center' | 'right'
}

export function SortHeader({ label, active, direction, onClick, align = 'left' }: SortHeaderProps) {
  const justify = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 ${justify} text-xs font-semibold uppercase tracking-wider text-fg-faint transition-colors hover:text-fg`}
    >
      <span>{label}</span>
      <Icon size={13} aria-hidden="true" />
    </button>
  )
}
