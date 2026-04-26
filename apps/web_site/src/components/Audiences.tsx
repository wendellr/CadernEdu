type AudCard = {
  color: string
  dotColor: string
  title: string
  role: string
  items: string[]
}

const cards: AudCard[] = [
  {
    color: 'bg-green',
    dotColor: '#1B7B3F',
    title: 'Aluno',
    role: 'Aprender',
    items: ['Trilhas BNCC por série', 'Tarefas e entregas', 'Biblioteca digital', 'Comunidade da turma', 'Conquistas e recompensas'],
  },
  {
    color: 'bg-coral',
    dotColor: '#FB7185',
    title: 'Professor',
    role: 'Ensinar',
    items: ['Planejamento de aula', 'Chamada e diário', 'Correção com feedback', 'Mural da turma', 'Relatórios pedagógicos'],
  },
  {
    color: 'bg-purple',
    dotColor: '#A78BFA',
    title: 'Família',
    role: 'Acompanhar',
    items: ['Boletim em tempo real', 'Mural de comunicados', 'Autorizações digitais', 'Merenda e cardápio', 'Ônibus escolar ao vivo'],
  },
  {
    color: 'bg-cyan',
    dotColor: '#0891B2',
    title: 'Secretaria',
    role: 'Gerir',
    items: ['Indicadores por escola', 'Alertas de evasão', 'Gestão de matrículas', 'Comunicados em massa', 'Rotas e transporte'],
  },
]

export default function Audiences() {
  return (
    <section className="py-[120px]" id="para-quem">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[720px] mx-auto mb-16 text-center">
          <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-cyan mb-4">
            Para quem é
          </span>
          <h2 className="text-section">Um app para toda a comunidade escolar.</h2>
          <p className="text-[19px] text-fg-dim mt-5">
            Quatro experiências feitas sob medida — do aluno à secretaria. Mesma base, mesmos dados, sem planilhas paralelas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-card border border-border rounded-[24px] p-8 transition-all duration-[250ms] hover:-translate-y-1.5 hover:shadow-lg hover:border-transparent relative overflow-hidden group"
            >
              <div className={`w-14 h-14 rounded-[16px] mb-6 ${card.color}`} aria-hidden="true" />
              <h3 className="text-[24px] mb-1.5">{card.title}</h3>
              <p className="font-display text-[13px] uppercase tracking-[0.1em] text-fg-faint font-semibold mb-[18px]">
                {card.role}
              </p>
              <ul className="flex flex-col gap-2.5 text-[15px] text-fg-dim list-none p-0 m-0">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-[9px] flex-shrink-0"
                      style={{ background: card.dotColor }}
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
