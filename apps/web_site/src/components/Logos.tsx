const cities = [
  { name: 'Cidade A · SP', color: '#1B7B3F' },
  { name: 'Cidade B · MG', color: '#0891B2' },
  { name: 'Cidade C · RS', color: '#FB7185' },
  { name: 'Cidade D · PE', color: '#A78BFA' },
  { name: 'Cidade E · BA', color: '#FBBF24' },
]

export default function Logos() {
  return (
    <section className="py-10 border-y border-border bg-bg-alt">
      <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between gap-8 flex-wrap">
        <span className="font-display text-[13px] tracking-[0.14em] uppercase text-fg-faint font-semibold">
          Em uso por secretarias de
        </span>
        <div className="flex gap-10 flex-wrap items-center text-fg-faint font-display font-semibold text-[16px]">
          {cities.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 px-[18px] py-2.5 rounded-full bg-white border border-border"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: c.color }}
                aria-hidden="true"
              />
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
