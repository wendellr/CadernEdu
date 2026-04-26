const stats = [
  { num: '47,3M', label: 'alunos na rede pública básica no Brasil', colorClass: 'text-yellow' },
  { num: '38%',   label: 'das escolas municipais sem plataforma própria', colorClass: 'text-cyan' },
  { num: '3h+',   label: 'por semana de controles manuais por professor', colorClass: 'text-coral' },
  { num: '100%',  label: 'acessível — Libras, leitor de tela, alto contraste', colorClass: 'text-purple' },
]

export default function Stats() {
  return (
    <section className="py-20 bg-fg text-white">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.num}>
              <div className={`font-display font-bold tracking-[-0.03em] leading-none text-[clamp(48px,5vw,72px)] ${s.colorClass}`}>
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
