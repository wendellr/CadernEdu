type Quote = {
  text: string
  name: string
  role: string
  initial: string
  color: string
  markColor: string
}

const quotes: Quote[] = [
  {
    text: 'Antes eu perdia três horas por semana só preenchendo planilha. Agora a chamada vai direto pro sistema e eu uso esse tempo pra preparar aula.',
    name: 'Helena Vieira',
    role: 'Profª 5º ano · E.M. Paulo Freire',
    initial: 'H',
    color: '#FB7185',
    markColor: '#0891B2',
  },
  {
    text: 'Como mãe que trabalha o dia inteiro, saber em tempo real que a Lara chegou na escola e ver as notas dela sem ligar pra ninguém — isso muda tudo.',
    name: 'Marina Souza',
    role: 'Mãe · 5º ano A',
    initial: 'M',
    color: '#1B7B3F',
    markColor: '#1B7B3F',
  },
  {
    text: 'O dashboard de evasão por bairro mudou nossa política pública. Estamos intervindo onde realmente faz diferença, com dados que cabem numa reunião.',
    name: 'Roberto Andrade',
    role: 'Secretário Mun. de Educação',
    initial: 'R',
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
            Quem usa, conta
          </span>
          <h2 className="text-section">A voz de quem já está dentro.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div
              key={q.name}
              className="bg-card border border-border rounded-[22px] p-8 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="font-display font-bold text-[56px] leading-[0.4]"
                style={{ color: q.markColor }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <p className="text-[17px] text-fg leading-[1.55] flex-1">{q.text}</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-display font-bold text-[16px] flex-shrink-0"
                  style={{ background: q.color }}
                  aria-hidden="true"
                >
                  {q.initial}
                </div>
                <div>
                  <div className="font-display font-semibold text-[14px]">{q.name}</div>
                  <div className="text-[12px] text-fg-faint">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
