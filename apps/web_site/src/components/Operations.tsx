const ops = [
  {
    icon: '🚌',
    title: 'Transporte escolar',
    desc: 'Módulo opcional para rotas, frota e comunicação com famílias quando a prefeitura tiver dados ou fornecedor integrável.',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
  {
    icon: '🍽️',
    title: 'Cardápio da merenda',
    desc: 'Publicação de cardápio e informações nutricionais a partir de cadastro próprio ou importação do sistema usado pela secretaria.',
    color: '#1B7B3F',
    bg: '#E6F4EA',
  },
  {
    icon: '📊',
    title: 'Frequência e presença',
    desc: 'Chamada digital para piloto e consolidação por escola, com política clara sobre qual sistema é fonte oficial.',
    color: '#A78BFA',
    bg: '#EDE9FE',
  },
  {
    icon: '📢',
    title: 'Comunicados oficiais',
    desc: 'Canal institucional para comunicados da escola e da secretaria, com segmentação por turma, série ou escola.',
    color: '#FB7185',
    bg: '#FFE4E6',
  },
]

export default function Operations() {
  return (
    <section className="py-24 bg-bg-alt">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[640px] mb-14">
          <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-cyan mb-4">
            Operação escolar essencial
          </span>
          <h2 className="text-[clamp(28px,3.2vw,44px)] font-display font-bold tracking-[-0.02em] mb-4">
            Feito para conviver com a realidade da escola pública.
          </h2>
          <p className="text-[17px] text-fg-dim leading-[1.6]">
            O CadernEdu começa pelo que reduz ruído no cotidiano: chamada, agenda,
            comunicados e carga inicial de dados. Merenda, transporte e indicadores
            entram por módulos e integrações conforme a rede estiver pronta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ops.map((op) => (
            <div
              key={op.title}
              className="bg-card rounded-[20px] p-6 border border-border hover:-translate-y-1 transition-transform"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] mb-4"
                style={{ background: op.bg }}
                aria-hidden="true"
              >
                {op.icon}
              </div>
              <h3 className="font-display font-bold text-[17px] mb-2" style={{ color: op.color }}>
                {op.title}
              </h3>
              <p className="text-[14px] text-fg-dim leading-[1.55]">{op.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
