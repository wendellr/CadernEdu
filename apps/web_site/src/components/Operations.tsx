const ops = [
  {
    icon: '🚌',
    title: 'Transporte escolar',
    desc: 'Rastreamento em tempo real, rotas e comunicação com motoristas — família sabe onde o ônibus está antes de chegar ao ponto.',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
  {
    icon: '🍽️',
    title: 'Cardápio da merenda',
    desc: 'Cardápio semanal publicado pela secretaria, com informações nutricionais e registro de alérgenos por turma.',
    color: '#1B7B3F',
    bg: '#E6F4EA',
  },
  {
    icon: '📊',
    title: 'Frequência e presença',
    desc: 'Chamada digital com alertas automáticos de ausência para as famílias. Relatórios consolidados por escola e rede.',
    color: '#A78BFA',
    bg: '#EDE9FE',
  },
  {
    icon: '📢',
    title: 'Comunicados oficiais',
    desc: 'Canal único para comunicados da escola e da secretaria. Confirmação de leitura, segmentação por turma ou série.',
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
            Feito para a realidade da escola pública — não para ERP de escola particular.
          </h2>
          <p className="text-[17px] text-fg-dim leading-[1.6]">
            CadernEdu resolve as operações do dia a dia que nenhuma plataforma de gestão trata com seriedade: o ônibus, a merenda, a chamada e o comunicado que a família precisa receber.
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
