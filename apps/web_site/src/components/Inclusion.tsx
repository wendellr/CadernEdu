const features = [
  {
    icon: '🗓️',
    title: 'Rotina visual diária',
    desc: 'Agenda com pictogramas e ícones que representam cada atividade do dia — ideal para alunos com TEA que precisam de previsibilidade.',
    color: '#A78BFA',
    bg: '#EDE9FE',
  },
  {
    icon: '📋',
    title: 'Tarefas passo a passo',
    desc: 'Atividades divididas em etapas pequenas e sequenciais, com progresso visual a cada etapa concluída.',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
  {
    icon: '🌿',
    title: 'Modo sensorial reduzido',
    desc: 'Interface com baixa animação, paleta suave e sem notificações intrusivas — configurável pela família ou professor.',
    color: '#1B7B3F',
    bg: '#E6F4EA',
  },
  {
    icon: '🔘',
    title: 'Comunicação simplificada',
    desc: 'Botões grandes com ícones em vez de texto longo. Respostas rápidas pré-configuradas para alunos com dificuldades de escrita.',
    color: '#FB7185',
    bg: '#FFE4E6',
  },
  {
    icon: '🤖',
    title: 'Tutor IA adaptado',
    desc: 'O assistente "Edu" usa linguagem simples, frases curtas e reforço positivo — calibrado para diferentes perfis de aprendizagem.',
    color: '#FBBF24',
    bg: '#FEF9C3',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Painel de acompanhamento TEA',
    desc: 'A família e o professor acompanham a rotina, registram comportamentos e comunicam eventos relevantes em um canal privado.',
    color: '#A78BFA',
    bg: '#EDE9FE',
  },
]

export default function Inclusion() {
  return (
    <section className="py-24">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-16 items-center mb-16">
          <div>
            <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-purple mb-4">
              Inclusão e Acessibilidade
            </span>
            <h2 className="text-[clamp(28px,3.2vw,44px)] font-display font-bold tracking-[-0.02em] mb-5">
              Toda criança aprende.<br />
              A plataforma se adapta.
            </h2>
            <p className="text-[17px] text-fg-dim leading-[1.6] max-w-[480px]">
              CadernEdu foi desenhado desde o início para funcionar com alunos de diferentes perfis de aprendizagem — incluindo crianças com Transtorno do Espectro Autista (TEA). Não é um módulo separado: a inclusão está no núcleo do produto.
            </p>
            <div
              className="mt-7 p-5 rounded-[16px] border-l-4 border-purple bg-purple/5"
            >
              <p className="text-[15px] leading-[1.6] text-fg">
                <strong>Para famílias de alunos com TEA:</strong> a rotina visual, as tarefas step-by-step e o modo sensorial reduzido estão disponíveis sem configuração extra — basta ativar no perfil do aluno.
              </p>
            </div>
          </div>
          <MockScreenTEA />
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-[20px] p-6 border border-border hover:-translate-y-1 transition-transform"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[20px] mb-4"
                style={{ background: f.bg }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-[16px] mb-2" style={{ color: f.color }}>
                {f.title}
              </h3>
              <p className="text-[14px] text-fg-dim leading-[1.55]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* WCAG note */}
        <div className="mt-10 flex items-center gap-3 text-[13px] text-fg-faint">
          <span className="px-2.5 py-1 rounded-full bg-green-soft text-green font-semibold text-[11px] uppercase tracking-wide">
            WCAG 2.1 AA
          </span>
          <span>A plataforma é desenhada para seguir acessibilidade digital — navegação por teclado, leitores de tela e contraste mínimo desde o projeto.</span>
        </div>
      </div>
    </section>
  )
}

const routineSteps = [
  { icon: '🌅', label: 'Acordar', done: true },
  { icon: '🚌', label: 'Ônibus', done: true },
  { icon: '📚', label: 'Aula de Matemática', done: false },
  { icon: '🍽️', label: 'Merenda', done: false },
  { icon: '🎨', label: 'Arte', done: false },
]

function MockScreenTEA() {
  return (
    <div
      className="aspect-[4/3] rounded-[24px] relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #E0F2FE 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.10)' }}
    >
      <div className="absolute top-[-30px] right-[-30px] w-[160px] h-[160px] rounded-full bg-purple/10" aria-hidden="true" />
      <div className="w-[65%] aspect-[9/19] bg-white rounded-[36px] p-[16px] flex flex-col gap-2.5 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.18)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>9:41</span><span>● ● ●</span>
        </div>
        <div className="text-center mt-1">
          <div className="font-display font-bold text-[16px]">Minha rotina 📅</div>
          <div className="text-[10px] text-fg-faint">Quarta · 2 de 5 feitas</div>
          <div className="h-1.5 rounded-full bg-border mt-2 overflow-hidden">
            <div className="w-[40%] h-full rounded-full bg-purple" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-1">
          {routineSteps.map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2"
              style={{ background: step.done ? '#EDE9FE' : '#F8F8F6' }}
            >
              <span className="text-[18px]" aria-hidden="true">{step.icon}</span>
              <span className="text-[11px] font-semibold flex-1" style={{ color: step.done ? '#5B21B6' : '#5C5C57' }}>
                {step.label}
              </span>
              {step.done && (
                <span className="w-4 h-4 rounded-full bg-purple flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
