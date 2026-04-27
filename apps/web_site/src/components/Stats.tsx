const stats = [
  { num: 'Integra', label: 'com sistemas oficiais antes de propor substituição', colorClass: 'text-yellow' },
  { num: 'Importa', label: 'dados por CSV/XLSX ou API, com validação e histórico', colorClass: 'text-cyan' },
  { num: 'Reconcilia', label: 'duplicidades, vínculos quebrados e erros de origem', colorClass: 'text-coral' },
  { num: 'Audita', label: 'acessos e alterações em dados sensíveis de menores', colorClass: 'text-purple' },
]

export default function Stats() {
  return (
    <section className="py-20 bg-fg text-white">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.num}>
              <div className={`font-display font-bold tracking-[-0.03em] leading-none text-[clamp(34px,4vw,52px)] ${s.colorClass}`}>
                {s.num}
              </div>
              <p className="mt-3.5 text-[16px] text-white/65 max-w-[220px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
