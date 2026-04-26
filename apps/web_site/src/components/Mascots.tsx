import Image from 'next/image'

type MascotData = {
  name: string
  src: string
  age: string
  quote: string
  variant: 'purple' | 'cyan' | 'green' | 'coral'
}

const mascotList: MascotData[] = [
  {
    name: 'Lara',
    src: '/mascots/lara.png',
    age: '8–10 anos · Criativa',
    quote: '"Adoro desenhar e criar histórias do nada."',
    variant: 'purple',
  },
  {
    name: 'Marco',
    src: '/mascots/marco.png',
    age: '12–14 anos · Tech',
    quote: '"Quero entender como tudo funciona por dentro."',
    variant: 'cyan',
  },
  {
    name: 'Ana',
    src: '/mascots/ana.png',
    age: '15–17 anos · Líder',
    quote: '"Ajudo os colegas — e gosto de ser ouvida."',
    variant: 'green',
  },
  {
    name: 'Zé',
    src: '/mascots/ze.png',
    age: '6–8 anos · Entusiasta',
    quote: '"Tudo é descoberta quando se está começando."',
    variant: 'coral',
  },
]

const gradients: Record<MascotData['variant'], string> = {
  purple: 'linear-gradient(160deg, #A78BFA 0%, #8B6BD8 100%)',
  cyan:   'linear-gradient(160deg, #0891B2 0%, #0E7490 100%)',
  green:  'linear-gradient(160deg, #1B7B3F 0%, #145E2E 100%)',
  coral:  'linear-gradient(160deg, #FB7185 0%, #E94B65 100%)',
}

const objectPositions: Record<MascotData['variant'], string> = {
  purple: 'center 8%',
  cyan:   'center 18%',
  green:  'center 10%',
  coral:  'center 6%',
}

export default function Mascots() {
  return (
    <section className="bg-bg-alt py-24" id="mascotes">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[720px] mx-auto mb-14 text-center">
          <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-coral mb-4">
            Personagens
          </span>
          <h2 className="text-section">Conheça quem te acompanha na jornada.</h2>
          <p className="text-[19px] text-fg-dim mt-5">
            Quatro mascotes que representam idade, diversidade e voz da rede pública.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {mascotList.map((m) => (
            <div
              key={m.name}
              className="bg-card rounded-[28px] overflow-hidden border border-border transition-all duration-[250ms] text-center hover:-translate-y-2 hover:-rotate-1 hover:shadow-lg"
            >
              <div className="aspect-square relative overflow-hidden" style={{ background: gradients[m.variant] }}>
                <div
                  className="absolute top-[-30px] right-[-30px] w-[140px] h-[140px] rounded-full bg-white/[0.18]"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-[-40px] left-[-30px] w-[160px] h-[160px] rounded-full bg-black/[0.08]"
                  aria-hidden="true"
                />
                <Image
                  src={m.src}
                  alt={`${m.name} — mascote CadernEdu`}
                  fill
                  className="object-cover relative z-[1]"
                  style={{ objectPosition: objectPositions[m.variant] }}
                />
              </div>
              <div className="px-[18px] pt-[22px] pb-[26px]">
                <h4 className="text-[22px]">{m.name}</h4>
                <p className="font-mono text-[12px] text-fg-faint mt-1 mb-2.5">{m.age}</p>
                <p className="text-[14px] text-fg-dim leading-[1.5] italic">{m.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
