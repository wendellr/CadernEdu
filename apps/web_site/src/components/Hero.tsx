import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 pb-24">
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-16 items-center">
        {/* Left: copy */}
        <div>
          <span className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-green-soft text-green font-display font-semibold text-[13px] tracking-[0.04em] uppercase">
            <span
              className="w-2 h-2 rounded-full bg-green animate-pulse-dot"
              aria-hidden="true"
            />
            Plataforma da rede pública
          </span>

          <h1 className="text-hero font-display font-extrabold tracking-[-0.03em] mt-6 mb-6">
            Educação digital<br />
            <span
              className="px-1"
              style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(251,191,36,0.55) 60%)' }}
            >
              pública
            </span>
            , para{' '}
            <span className="text-cyan">todas as crianças.</span>
          </h1>

          <p className="text-[19px] text-fg-dim max-w-[540px] leading-[1.55]">
            Apps, painel e integrações para aproximar escola, família e gestão
            municipal sem descartar os sistemas que a prefeitura já usa.
          </p>

          <p className="mt-5 text-[15px] text-fg-faint max-w-[480px] leading-[1.55] border-l-[3px] border-green pl-4 italic">
            Começamos integrando dados existentes, validando uma escola-piloto e só depois avançamos para automações mais profundas.
          </p>

          <div className="flex gap-3.5 mt-9 flex-wrap">
            <a
              href="#demo"
              className="inline-flex items-center justify-center px-7 py-4 rounded-[12px] font-display font-semibold text-[16px] bg-cyan text-white shadow-[0_4px_14px_rgba(8,145,178,0.32)] hover:bg-cyan-deep hover:-translate-y-px transition-all focus-visible:outline-2 focus-visible:outline-cyan-deep"
            >
              Agendar demonstração
            </a>
            <a
              href="#login"
              className="inline-flex items-center justify-center px-7 py-4 rounded-[12px] font-display font-semibold text-[16px] border border-border hover:border-fg transition-colors focus-visible:outline-2 focus-visible:outline-fg"
            >
              Acessar plataforma →
            </a>
          </div>

          <div className="flex gap-8 mt-12 flex-wrap">
            <TrustItem color="text-green" num="Integra" label={<>com sistemas<br />existentes</>} />
            <TrustItem color="text-cyan" num="Piloto" label={<>com carga inicial<br />assistida</>} />
            <TrustItem color="text-coral" num="Audita" label={<>dados sensíveis<br />desde o início</>} />
          </div>
        </div>

        {/* Right: art */}
        <div className="relative aspect-square flex items-center justify-center">
          {/* Blob background */}
          <div
            className="absolute inset-[8%] animate-morph"
            style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #FB7185 100%)' }}
            aria-hidden="true"
          />
          {/* Floating shapes */}
          <div
            className="absolute top-[4%] right-[18%] w-[90px] h-[90px] rounded-full animate-float"
            style={{ background: '#A78BFA', boxShadow: '0 12px 30px rgba(167,139,250,0.4)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[16%] left-[4%] w-[70px] h-[70px] rounded-[18px] animate-float-reverse"
            style={{ background: '#0891B2', transform: 'rotate(18deg)', boxShadow: '0 12px 30px rgba(8,145,178,0.35)' }}
            aria-hidden="true"
          />
          <div
            className="absolute top-[26%] left-[-2%] w-[50px] h-[50px] rounded-full animate-float-slow"
            style={{ background: '#1B7B3F' }}
            aria-hidden="true"
          />

          {/* Floating info cards */}
          <div
            className="absolute top-[8%] left-[-6%] z-10 flex items-center gap-3 px-[18px] py-3.5 bg-white rounded-[14px] text-[13px]"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          >
            <span
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-fg"
              style={{ background: '#FBBF24' }}
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <div className="font-display font-semibold text-[13px]">Agenda do dia</div>
              <div className="text-fg-faint text-[11px]">Aula e tarefa registradas</div>
            </div>
          </div>

          <div
            className="absolute bottom-[12%] right-[-4%] z-10 flex items-center gap-3 px-[18px] py-3.5 bg-white rounded-[14px] text-[13px]"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          >
            <span
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-white"
              style={{ background: '#1B7B3F' }}
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <div className="font-display font-semibold text-[13px]">Dados sincronizados</div>
              <div className="text-fg-faint text-[11px]">Turma · frequência · recados</div>
            </div>
          </div>

          {/* Mascot stack */}
          <div className="relative z-[2] flex items-end gap-4">
            <MascotCircle
              src="/mascots/lara.png"
              alt="Lara — mascote aluna"
              size={110}
              borderColor="#A78BFA"
              objectPosition="center 12%"
            />
            <MascotCircle
              src="/mascots/marco.png"
              alt="Marco — mascote aluno"
              size={160}
              borderColor="#0891B2"
              objectPosition="center 18%"
            />
            <MascotCircle
              src="/mascots/ana.png"
              alt="Ana — mascote professora"
              size={130}
              borderColor="#1B7B3F"
              objectPosition="center 12%"
            />
            <MascotCircle
              src="/mascots/ze.png"
              alt="Zé — mascote responsável"
              size={100}
              borderColor="#FB7185"
              objectPosition="center 8%"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustItem({
  color,
  num,
  label,
}: {
  color: string
  num: string
  label: React.ReactNode
}) {
  return (
    <div>
      <div className={`font-display font-bold text-[28px] tracking-[-0.02em] leading-none ${color}`}>
        {num}
      </div>
      <div className="text-[13px] text-fg-faint mt-1.5">{label}</div>
    </div>
  )
}

function MascotCircle({
  src,
  alt,
  size,
  borderColor,
  objectPosition,
}: {
  src: string
  alt: string
  size: number
  borderColor: string
  objectPosition: string
}) {
  return (
    <div
      className="rounded-full overflow-hidden bg-white"
      style={{
        width: size,
        height: size,
        border: `6px solid ${borderColor}`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        style={{ objectPosition }}
        priority
      />
    </div>
  )
}
