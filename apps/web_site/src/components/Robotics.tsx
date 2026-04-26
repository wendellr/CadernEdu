const highlights = [
  { icon: '🤖', title: 'Robótica educacional', desc: 'Kits e projetos guiados com montagem física e programação, integrados às trilhas do aluno no CadernEdu.' },
  { icon: '🔌', title: 'Sistemas embarcados', desc: 'Introdução prática a ESP32, sensores, automação e IoT — do circuito ao código, sem abstração excessiva.' },
  { icon: '🧠', title: 'Pensamento computacional', desc: 'Lógica, algoritmos e resolução de problemas aplicados a projetos reais, alinhados à BNCC de Computação.' },
  { icon: '🌍', title: 'Projetos de impacto real', desc: 'Monitoramento de temperatura, automação de iluminação, mini projetos de energia e introdução a cidades inteligentes.' },
]

const projectExamples = [
  { emoji: '🌡️', name: 'Sensor de temperatura', desc: 'Monitora a sala de aula em tempo real' },
  { emoji: '💡', name: 'Automação de iluminação', desc: 'Ativa/desativa com sensor de presença' },
  { emoji: '☀️', name: 'Energia renovável', desc: 'Mini painel solar com medição de geração' },
  { emoji: '📡', name: 'IoT na escola', desc: 'Conecta sensores à internet e visualiza dados' },
]

export default function Robotics() {
  return (
    <section className="py-24 bg-bg-alt">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-cyan mb-4">
              Trilhas especiais · Novo
            </span>
            <h2 className="text-[clamp(28px,3.2vw,44px)] font-display font-bold tracking-[-0.02em] mb-5">
              Da sala de aula<br />
              <span className="text-cyan">para o mundo real.</span>
            </h2>
            <p className="text-[17px] text-fg-dim leading-[1.6] max-w-[480px] mb-7">
              Trilhas de robótica e sistemas embarcados, desenvolvidas por equipes especializadas, integradas à jornada do aluno dentro do CadernEdu.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              {highlights.map((h) => (
                <div key={h.title} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0 mt-0.5 bg-cyan/10"
                    aria-hidden="true"
                  >
                    {h.icon}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[15px] text-fg">{h.title}</div>
                    <div className="text-[13px] text-fg-dim mt-0.5 leading-[1.5]">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-[16px] bg-cyan/8 border border-cyan/20">
              <p className="text-[14px] text-fg leading-[1.6]">
                <strong className="text-cyan">Módulo desenvolvido com parceiros especializados.</strong> O CadernEdu integra e distribui essas experiências dentro da jornada do aluno — com gamificação, progressão e acompanhamento pelo professor.
              </p>
            </div>
          </div>

          {/* Right: mockup */}
          <MockScreenRobotics />
        </div>

        {/* Project examples */}
        <div className="mt-16">
          <h3 className="font-display font-bold text-[18px] mb-6 text-fg-dim uppercase tracking-[0.08em] text-[13px]">
            Exemplos de projetos
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {projectExamples.map((p) => (
              <div
                key={p.name}
                className="bg-card rounded-[16px] p-5 border border-border text-center hover:-translate-y-1 transition-transform"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}
              >
                <div className="text-[32px] mb-3" aria-hidden="true">{p.emoji}</div>
                <div className="font-display font-semibold text-[14px] text-fg mb-1">{p.name}</div>
                <div className="text-[12px] text-fg-faint">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Public education alignment */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🎓', title: 'Preparação técnica', desc: 'Alunos da rede pública com acesso às mesmas tecnologias de escolas privadas de ponta.' },
            { icon: '🌱', title: 'Inclusão tecnológica', desc: 'Desde o ensino fundamental, sem prerequisito de infraestrutura cara.' },
            { icon: '🏛️', title: 'Alinhamento federal', desc: 'Compatível com iniciativas de inovação estaduais e o Marco Legal da Educação Digital.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-5 bg-card rounded-[16px] border border-border">
              <span className="text-[24px]" aria-hidden="true">{item.icon}</span>
              <div>
                <div className="font-display font-semibold text-[15px] text-fg mb-1">{item.title}</div>
                <div className="text-[13px] text-fg-dim leading-[1.5]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MockScreenRobotics() {
  return (
    <div
      className="aspect-[4/3] rounded-[24px] relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0891B2 0%, #1B7B3F 100%)', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
    >
      <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute bottom-[-50px] left-[-20px] w-[160px] h-[160px] rounded-full bg-black/10" aria-hidden="true" />
      <div className="w-[70%] aspect-[9/19] bg-white rounded-[36px] p-[16px] flex flex-col gap-2.5 overflow-hidden" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between text-fg-faint text-[11px] font-semibold font-display">
          <span>9:41</span><span>● ● ●</span>
        </div>
        <div className="font-display font-bold text-[18px] mt-1">Trilha Robótica 🤖</div>
        <div className="text-[11px] text-fg-faint">Marco · Nível 3 de 5</div>
        <div className="rounded-[14px] p-3 text-white" style={{ background: 'linear-gradient(135deg, #0891B2 0%, #1B7B3F 100%)' }}>
          <div className="text-[9px] uppercase tracking-[0.1em] opacity-85">Missão atual</div>
          <div className="font-display font-bold text-[13px] mt-1">Sensor de temperatura 🌡️</div>
          <div className="h-1.5 rounded-full bg-white/25 mt-2 overflow-hidden">
            <div className="w-[60%] h-full rounded-full bg-yellow" />
          </div>
          <div className="text-[9px] opacity-75 mt-1">60% concluído</div>
        </div>
        <div className="flex flex-col gap-1.5 mt-1">
          {[
            { icon: '✅', label: 'Montar o circuito', done: true },
            { icon: '✅', label: 'Programar o ESP32', done: true },
            { icon: '⏳', label: 'Publicar dados na nuvem', done: false },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2 px-2 py-1.5 rounded-[8px]" style={{ background: step.done ? '#E6F4EA' : '#F8F8F6' }}>
              <span className="text-[12px]">{step.icon}</span>
              <span className="text-[10px] font-semibold" style={{ color: step.done ? '#1B7B3F' : '#5C5C57' }}>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1.5 p-2 bg-yellow/10 rounded-[8px]">
          <span className="text-[14px]">🏆</span>
          <span className="text-[10px] font-semibold text-fg">+120 XP ao concluir</span>
        </div>
      </div>
    </div>
  )
}
