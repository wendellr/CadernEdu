export default function Features() {
  return (
    <div id="recursos" className="max-w-[1280px] mx-auto px-8">
      <FeatureBNCC />
      <FeatureFamilia />
      <FeatureGestao />
    </div>
  )
}

function CheckIcon({ color = '#1B7B3F' }: { color?: string }) {
  return (
    <span
      className="w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0 mt-0.5"
      style={{ background: color }}
      aria-hidden="true"
    >
      ✓
    </span>
  )
}

function FeatureBNCC() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center py-24">
      <div>
        <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-green mb-4">
          Para alunos
        </span>
        <h2 className="text-[clamp(32px,3.6vw,48px)] mb-5">
          Aprender vira hábito quando vira jornada.
        </h2>
        <p className="text-[18px] text-fg-dim max-w-[480px]">
          Trilhas alinhadas à BNCC com missões diárias, gamificação responsável e modo offline
          para escolas com conectividade limitada.
        </p>
        <ul className="flex flex-col gap-3.5 my-7 list-none p-0">
          {[
            'Modo offline real — baixa o conteúdo do dia antes de sair de casa',
            'Missões diárias com streak inteligente que respeita fim de semana',
            'Tutor IA "Edu" com guard-rails pedagógicos (BNCC-aligned)',
            'Avatar evolutivo dos mascotes — progresso visível, motivação real',
            'Trilhas de robótica e sistemas embarcados integradas à jornada',
          ].map((item) => (
            <li key={item} className="grid grid-cols-[28px_1fr] gap-3.5 text-[16px]">
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[14px] text-fg-faint italic mb-6">
          "Aprender vira rotina quando vira jornada."
        </p>
        <a
          href="#demo"
          className="inline-flex items-center justify-center px-[22px] py-3 rounded-[10px] font-display font-semibold text-[15px] bg-fg text-white hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-fg"
        >
          Ver na prática
        </a>
      </div>
      <MockScreenBNCC />
    </div>
  )
}

function FeatureFamilia() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center py-24 [direction:rtl] md:[direction:rtl]">
      <div className="[direction:ltr]">
        <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-coral mb-4">
          Para famílias
        </span>
        <h2 className="text-[clamp(32px,3.6vw,48px)] mb-5">
          Saber como o filho está, sem grupo paralelo no WhatsApp.
        </h2>
        <p className="text-[18px] text-fg-dim max-w-[480px]">
          Comunicação direta com a escola, autorizações digitais e o ônibus escolar em tempo real
          — sem precisar do número pessoal de ninguém.
        </p>
        <ul className="flex flex-col gap-3.5 my-7 list-none p-0">
          {[
            'Ônibus escolar em tempo real — sem ligar pra ninguém',
            'Cardápio semanal da merenda direto no app',
            'Boletim conversacional em linguagem clara, sem jargão escolar',
            'Notificações que substituem os grupos de WhatsApp',
            'Resumo semanal por SMS pra quem não tem smartphone',
          ].map((item) => (
            <li key={item} className="grid grid-cols-[28px_1fr] gap-3.5 text-[16px]">
              <CheckIcon color="#FB7185" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[14px] text-fg-faint italic mb-6">
          "Sem grupos paralelos, sem ruído — tudo em um só lugar."
        </p>
        <a
          href="#demo"
          className="inline-flex items-center justify-center px-[22px] py-3 rounded-[10px] font-display font-semibold text-[15px] bg-fg text-white hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-fg"
        >
          Conhecer o app família
        </a>
      </div>
      <div className="[direction:ltr]">
        <MockScreenFamilia />
      </div>
    </div>
  )
}

function FeatureGestao() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center py-24">
      <div>
        <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-purple mb-4">
          Para a secretaria
        </span>
        <h2 className="text-[clamp(32px,3.6vw,48px)] mb-5">
          Decisões baseadas em dados — não em planilha de ouvido.
        </h2>
        <p className="text-[18px] text-fg-dim max-w-[480px]">
          Indicadores em tempo real por escola, bairro e turma. Alertas de evasão antes do
          problema virar estatística.
        </p>
        <ul className="flex flex-col gap-3.5 my-7 list-none p-0">
          {[
            'Dashboard de equidade por região',
            'Censo escolar pré-formatado para o INEP',
            'Mapa de calor de evasão geográfico',
            'Comunicados em massa segmentados',
          ].map((item) => (
            <li key={item} className="grid grid-cols-[28px_1fr] gap-3.5 text-[16px]">
              <CheckIcon color="#A78BFA" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#demo"
          className="inline-flex items-center justify-center px-[22px] py-3 rounded-[10px] font-display font-semibold text-[15px] bg-fg text-white hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-fg"
        >
          Ver painel da secretaria
        </a>
      </div>
      <MockScreenGestao />
    </div>
  )
}

function MockScreenBNCC() {
  return (
    <div
      className="aspect-[4/3] rounded-[24px] relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0891B2 0%, #1B7B3F 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
    >
      <div className="absolute top-[-40px] right-[-40px] w-[220px] h-[220px] rounded-full bg-white/[0.18]" aria-hidden="true" />
      <div className="absolute bottom-[-60px] left-[-30px] w-[180px] h-[180px] rounded-full bg-black/[0.08]" aria-hidden="true" />
      <div className="w-[70%] aspect-[9/19] bg-white rounded-[36px] p-[18px] flex flex-col gap-3 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>9:41</span><span>● ● ●</span>
        </div>
        <div className="font-display font-bold text-[22px] tracking-tight mt-1">Oi, Lara 👋</div>
        <div className="text-[12px] text-fg-faint">Quarta · 24 abr</div>
        <div className="rounded-[18px] p-4 text-white" style={{ background: 'linear-gradient(135deg, #0891B2 0%, #1B7B3F 100%)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em] opacity-85">Trilha do dia</div>
          <div className="font-display font-bold text-[16px] mt-1">Frações em partes iguais</div>
          <div className="h-1.5 rounded-full bg-white/25 mt-3 overflow-hidden">
            <div className="w-[65%] h-full rounded-full bg-yellow" />
          </div>
        </div>
        <MockRow color="#FB7185" name="Tarefa de Português" meta="Entrega até sexta" />
        <MockRow color="#A78BFA" name="Mural da turma" meta="3 novos posts" />
      </div>
    </div>
  )
}

function MockScreenFamilia() {
  return (
    <div
      className="aspect-[4/3] rounded-[24px] relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #FB7185 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
    >
      <div className="absolute top-[-40px] right-[-40px] w-[220px] h-[220px] rounded-full bg-white/[0.18]" aria-hidden="true" />
      <div className="absolute bottom-[-60px] left-[-30px] w-[180px] h-[180px] rounded-full bg-black/[0.08]" aria-hidden="true" />
      <div className="w-[70%] aspect-[9/19] bg-white rounded-[36px] p-[18px] flex flex-col gap-3 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>9:41</span><span>📶 100%</span>
        </div>
        <div className="font-display font-bold text-[22px] tracking-tight mt-1">Olá, Marina</div>
        <div className="text-[12px] text-fg-faint">Mãe da Lara · 5º A</div>
        <div className="rounded-[18px] p-4 text-white" style={{ background: 'linear-gradient(135deg, #FB7185 0%, #A78BFA 100%)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em] opacity-85">Esta semana</div>
          <div className="font-display font-bold text-[16px] mt-1">Lara entregou 5/5 tarefas 🎉</div>
          <div className="h-1.5 rounded-full bg-white/25 mt-3 overflow-hidden">
            <div className="w-full h-full rounded-full bg-yellow" />
          </div>
        </div>
        <MockRow color="#0891B2" name="Ônibus a 4 min" meta="Linha 02 · Ao vivo" />
        <MockRow color="#1B7B3F" name="Reunião de pais" meta="Sex 26 · 19h" />
      </div>
    </div>
  )
}

function MockScreenGestao() {
  const bars = [60, 78, 55, 88, 71, 92, 84]
  return (
    <div
      className="aspect-[4/3] rounded-[24px] relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #0891B2 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
    >
      <div className="absolute top-[-40px] right-[-40px] w-[220px] h-[220px] rounded-full bg-white/[0.18]" aria-hidden="true" />
      <div className="absolute bottom-[-60px] left-[-30px] w-[180px] h-[180px] rounded-full bg-black/[0.08]" aria-hidden="true" />
      <div className="w-[80%] aspect-[4/3] bg-white rounded-[36px] p-[18px] flex flex-col gap-2 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>Visão geral · Rede</span><span>● ●</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatMini label="Frequência" value="94%" color="#1B7B3F" />
          <StatMini label="Evasão" value="2,1%" color="#FB7185" />
          <StatMini label="IDEB proj." value="5,8" color="#0891B2" />
        </div>
        <div className="flex items-end gap-1 h-20 mt-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${h}%`, background: i === 5 ? '#1B7B3F' : '#0891B2' }}
            />
          ))}
        </div>
        <div className="text-[10px] text-fg-faint">Engajamento · 7 dias</div>
      </div>
    </div>
  )
}

function MockRow({ color, name, meta }: { color: string; name: string; meta: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-bg-alt rounded-[12px]">
      <div className="w-8 h-8 rounded-[8px] flex-shrink-0" style={{ background: color }} aria-hidden="true" />
      <div>
        <div className="text-[12px] font-display font-semibold">{name}</div>
        <div className="text-[10px] text-fg-faint">{meta}</div>
      </div>
    </div>
  )
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-border rounded-[10px] p-2.5">
      <div className="text-[9px] text-fg-faint">{label}</div>
      <div className="font-display font-bold text-[18px]" style={{ color }}>{value}</div>
    </div>
  )
}
