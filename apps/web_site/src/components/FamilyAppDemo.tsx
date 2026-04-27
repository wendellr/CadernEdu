const familyFeatures = [
  {
    icon: '🍽️',
    title: 'Cardápio da semana',
    desc: 'A família vê a merenda prevista para cada dia, com observações da escola quando houver restrição ou troca no cardápio.',
    color: '#1B7B3F',
    bg: '#E6F4EA',
  },
  {
    icon: '📚',
    title: 'O que foi estudado hoje',
    desc: 'Aulas registradas pelo professor, conteúdos trabalhados e atividades de casa aparecem em linguagem simples.',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
  {
    icon: '📢',
    title: 'Comunicação e autorizações',
    desc: 'Comunicados, anúncios, documentos, confirmações de leitura e autorizações ficam em um canal institucional.',
    color: '#FB7185',
    bg: '#FFE4E6',
  },
  {
    icon: '🚌',
    title: 'Transporte e imprevistos',
    desc: 'Quando o módulo estiver integrado, a família acompanha previsão de chegada e recebe aviso de atraso, troca de rota ou ocorrência.',
    color: '#A78BFA',
    bg: '#EDE9FE',
  },
]

const weekMenu = [
  { day: 'Seg', meal: 'Arroz, feijão e frango' },
  { day: 'Ter', meal: 'Macarrão com legumes' },
  { day: 'Qua', meal: 'Sopa + fruta' },
]

export default function FamilyAppDemo() {
  return (
    <section className="py-24 bg-bg-alt">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-16 items-center">
          <div>
            <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-coral mb-4">
              No celular da família
            </span>
            <h2 className="text-[clamp(32px,3.6vw,48px)] mb-5">
              O responsável entende o dia escolar sem depender de recado perdido.
            </h2>
            <p className="text-[18px] text-fg-dim max-w-[560px] leading-[1.6]">
              A proposta do app família é juntar informações práticas em uma rotina
              simples: alimentação, estudo, atividades, comunicados e transporte,
              sempre respeitando o que a prefeitura já consegue integrar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {familyFeatures.map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-border rounded-[18px] p-5"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[20px] mb-4"
                    style={{ background: item.bg }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-display font-bold text-[16px] mb-2" style={{ color: item.color }}>
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-fg-dim leading-[1.55]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <FamilyPhoneMock />
        </div>
      </div>
    </section>
  )
}

function FamilyPhoneMock() {
  return (
    <div
      className="rounded-[28px] relative overflow-hidden flex items-center justify-center min-h-[620px]"
      style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #FB7185 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
    >
      <div className="absolute top-[-70px] right-[-40px] w-[240px] h-[240px] rounded-full bg-white/[0.18]" aria-hidden="true" />
      <div className="absolute bottom-[-80px] left-[-40px] w-[220px] h-[220px] rounded-full bg-black/[0.08]" aria-hidden="true" />

      <div className="relative w-[min(360px,78vw)] bg-white rounded-[38px] p-[18px] flex flex-col gap-3 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>9:41</span>
          <span>● ● ●</span>
        </div>

        <div>
          <div className="font-display font-bold text-[22px] tracking-tight">Olá, Marina</div>
          <div className="text-[12px] text-fg-faint">Lara · 5º A · Escola Municipal</div>
        </div>

        <div className="rounded-[18px] p-4 text-white" style={{ background: 'linear-gradient(135deg, #FB7185 0%, #A78BFA 100%)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em] opacity-85">Hoje na escola</div>
          <div className="font-display font-bold text-[16px] mt-1">Frações, leitura e tarefa de Português</div>
          <div className="text-[11px] opacity-85 mt-2">Atividade de casa publicada pelo professor.</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniTile color="#1B7B3F" label="Merenda" value="Sopa + fruta" />
          <MiniTile color="#0891B2" label="Transporte" value="Previsão 12:10" />
        </div>

        <div className="rounded-[16px] border border-border p-3">
          <div className="font-display font-bold text-[13px] mb-2">Cardápio da semana</div>
          <div className="flex flex-col gap-1.5">
            {weekMenu.map((item) => (
              <div key={item.day} className="grid grid-cols-[34px_1fr] gap-2 text-[11px]">
                <span className="font-display font-bold text-green">{item.day}</span>
                <span className="text-fg-dim">{item.meal}</span>
              </div>
            ))}
          </div>
        </div>

        <AppRow color="#FB7185" title="Autorização pendente" meta="Passeio pedagógico · responder até sexta" />
        <AppRow color="#A78BFA" title="Comunicado da professora" meta="Material de Matemática para amanhã" />
        <AppRow color="#0891B2" title="Aviso de transporte" meta="Rota com atraso informado pela escola" />
      </div>
    </div>
  )
}

function MiniTile({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-[14px] p-3 bg-bg-alt">
      <div className="text-[10px] text-fg-faint">{label}</div>
      <div className="font-display font-bold text-[12px] mt-1" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function AppRow({ color, title, meta }: { color: string; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-bg-alt rounded-[12px]">
      <div className="w-8 h-8 rounded-[8px] flex-shrink-0" style={{ background: color }} aria-hidden="true" />
      <div>
        <div className="text-[12px] font-display font-semibold">{title}</div>
        <div className="text-[10px] text-fg-faint">{meta}</div>
      </div>
    </div>
  )
}
