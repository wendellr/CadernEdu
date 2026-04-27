export default function Footer() {
  return (
    <footer className="bg-[#0F0F0E] text-white/70 pt-20 pb-10">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-16 pb-14 border-b border-white/10">
          <div>
            <a href="#" className="flex items-center gap-3" aria-label="CadernEdu — página inicial">
              <FooterBrandMark />
              <span className="font-display font-bold text-[24px] tracking-[-0.03em]">
                <span style={{ color: '#4FD188' }}>Cadern</span>
                <span style={{ color: '#4FD1E7' }}>Edu</span>
              </span>
            </a>
            <p className="mt-4 text-[15px] leading-[1.55] max-w-[320px]">
              Plataforma de educação pública municipal com apps nativos, painel web e
              integrações para sistemas já usados pela rede.
            </p>
          </div>

          <FooterCol title="Produto" links={[
            { label: 'Para alunos', href: '#para-quem' },
            { label: 'Para famílias', href: '#para-quem' },
            { label: 'Para professores', href: '#para-quem' },
            { label: 'Para secretarias', href: '#para-quem' },
          ]} />

          <FooterCol title="Empresa" links={[
            { label: 'Sobre', href: '#' },
            { label: 'Carreiras', href: '#' },
            { label: 'Imprensa', href: '#' },
            { label: 'Contato', href: '#' },
          ]} />

          <FooterCol title="Conformidade" links={[
            { label: 'Política de privacidade', href: '#' },
            { label: 'Termos de uso', href: '#' },
            { label: 'LGPD-Kids', href: '#' },
            { label: 'Acessibilidade', href: '#' },
          ]} />
        </div>

        <div className="flex justify-between items-center pt-7 flex-wrap gap-4 text-[13px] text-white/50">
          <div>© 2026 CadernEdu · Plataforma em fase de piloto institucional</div>
          <div className="flex gap-3">
            <Badge dotColor="#1B7B3F" label="LGPD by design" />
            <Badge dotColor="#0891B2" label="WCAG AA ready" />
            <Badge dotColor="#FBBF24" label="Gov.br ready" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h5 className="font-display font-semibold text-white text-[14px] uppercase tracking-[0.12em] mb-[18px]">
        {title}
      </h5>
      <ul className="flex flex-col gap-3 text-[14px] list-none p-0 m-0">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="hover:text-white transition-colors focus-visible:outline-1 focus-visible:outline-white/50 rounded-sm">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Badge({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 font-display text-[11px] font-semibold tracking-[0.06em] uppercase">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} aria-hidden="true" />
      {label}
    </span>
  )
}

function FooterBrandMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="14" y="26" width="34" height="48" rx="4" fill="#1B7B3F" />
      <rect x="52" y="26" width="34" height="48" rx="4" fill="#0891B2" />
      <line x1="20" y1="38" x2="42" y2="38" stroke="#fff" strokeWidth="1.6" />
      <line x1="20" y1="46" x2="42" y2="46" stroke="#fff" strokeWidth="1.6" />
      <line x1="20" y1="54" x2="38" y2="54" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}
