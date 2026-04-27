type Quote = {
  title: string
  text: string
  initial: string
  color: string
  markColor: string
}

const quotes: Quote[] = [
  {
    title: 'Não duplicar trabalho',
    text: 'O piloto precisa reaproveitar cadastros existentes de escolas, turmas, alunos e professores antes de pedir novos formulários para a rede.',
    initial: '1',
    color: '#FB7185',
    markColor: '#0891B2',
  },
  {
    title: 'Começar pequeno',
    text: 'Uma escola-piloto bem instrumentada vale mais do que uma implantação ampla sem dados confiáveis, suporte e rotina clara de correção.',
    initial: '2',
    color: '#1B7B3F',
    markColor: '#1B7B3F',
  },
  {
    title: 'Evoluir com governança',
    text: 'Integrações de escrita, indicadores preditivos e módulos operacionais entram depois de regra de conflito, auditoria e aceite institucional.',
    initial: '3',
    color: '#A78BFA',
    markColor: '#A78BFA',
  },
]

export default function Testimonials() {
  return (
    <section className="py-[120px]" id="depoimentos">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[720px] mx-auto mb-14 text-center">
          <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-cyan mb-4">
            Premissas do piloto
          </span>
          <h2 className="text-section">A implantação precisa respeitar o que já existe.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div
              key={q.title}
              className="bg-card border border-border rounded-[22px] p-8 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="font-display font-bold text-[42px] leading-none" style={{ color: q.markColor }}>
                {q.initial}
              </div>
              <h3 className="font-display font-bold text-[20px]">{q.title}</h3>
              <p className="text-[17px] text-fg leading-[1.55] flex-1">{q.text}</p>
              <div className="h-1.5 rounded-full mt-2" style={{ background: q.color }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
