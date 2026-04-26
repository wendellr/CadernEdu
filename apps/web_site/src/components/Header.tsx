export default function Header() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md" style={{ background: 'rgba(250,250,247,0.85)' }}>
      <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between py-[18px]">
        <a href="#" className="flex items-center gap-3" aria-label="CadernEdu — página inicial">
          <BrandMark />
          <span className="font-display font-bold text-[22px] tracking-[-0.03em]">
            <span className="text-green">Cadern</span>
            <span className="text-cyan">Edu</span>
          </span>
        </a>

        <div className="hidden md:flex gap-9 text-[15px] text-fg-dim font-medium">
          <a href="#para-quem" className="hover:text-fg transition-colors">Para quem</a>
          <a href="#recursos" className="hover:text-fg transition-colors">Recursos</a>
          <a href="#mascotes" className="hover:text-fg transition-colors">Mascotes</a>
          <a href="#depoimentos" className="hover:text-fg transition-colors">Depoimentos</a>
          <a href="#faq" className="hover:text-fg transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#login"
            className="px-[22px] py-3 rounded-[10px] font-display font-semibold text-[15px] hover:bg-black/5 transition-colors focus-visible:outline-2 focus-visible:outline-cyan"
          >
            Entrar
          </a>
          <a
            href="#demo"
            className="px-[22px] py-3 rounded-[10px] font-display font-semibold text-[15px] bg-cyan text-white shadow-[0_4px_14px_rgba(8,145,178,0.32)] hover:bg-cyan-deep hover:-translate-y-px transition-all focus-visible:outline-2 focus-visible:outline-cyan-deep"
          >
            Falar com a equipe
          </a>
        </div>
      </div>
    </nav>
  )
}

function BrandMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="47" y="22" width="6" height="56" rx="3" fill="#29261b" opacity="0.18" />
      <rect x="14" y="26" width="34" height="48" rx="4" fill="#1B7B3F" />
      <rect x="52" y="26" width="34" height="48" rx="4" fill="#0891B2" />
      <circle cx="62" cy="40" r="3.2" fill="#fff" />
      <circle cx="76" cy="50" r="3.2" fill="#fff" />
      <circle cx="62" cy="60" r="3.2" fill="#fff" />
      <line x1="62" y1="40" x2="76" y2="50" stroke="#fff" strokeWidth="1.6" />
      <line x1="76" y1="50" x2="62" y2="60" stroke="#fff" strokeWidth="1.6" />
      <line x1="62" y1="40" x2="62" y2="60" stroke="#fff" strokeWidth="1.6" opacity="0.6" />
      <line x1="20" y1="38" x2="42" y2="38" stroke="#fff" strokeWidth="1.6" />
      <line x1="20" y1="46" x2="42" y2="46" stroke="#fff" strokeWidth="1.6" />
      <line x1="20" y1="54" x2="38" y2="54" stroke="#fff" strokeWidth="1.6" />
      <line x1="20" y1="62" x2="42" y2="62" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}
