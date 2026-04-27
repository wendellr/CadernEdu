export default function CTAFinal() {
  return (
    <section
      className="py-24 relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #1B7B3F 0%, #0891B2 100%)' }}
      id="demo"
    >
      <div className="absolute top-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full bg-yellow opacity-45" aria-hidden="true" />
      <div className="absolute bottom-[-100px] left-[10%] w-[280px] h-[280px] rounded-full bg-coral opacity-55" aria-hidden="true" />
      <div
        className="absolute bottom-20 right-[18%] w-[120px] h-[120px] rounded-[26px] bg-purple opacity-85"
        style={{ transform: 'rotate(20deg)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[760px] mx-auto px-8 text-center">
        <h2 className="text-white text-[clamp(40px,5vw,64px)] leading-[1.05]">
          Vamos começar<br />o piloto juntos?
        </h2>
        <p className="mt-6 mb-9 text-white/90 text-[19px]">
          O primeiro passo é entender os sistemas existentes, escolher uma escola-piloto
          e validar um fluxo real sem criar mais retrabalho para a rede.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a
            href="mailto:equipe@cadernedu.com.br"
            className="inline-flex items-center justify-center px-7 py-4 rounded-[12px] font-display font-semibold text-[16px] bg-white text-cyan-deep hover:bg-yellow hover:text-fg transition-colors focus-visible:outline-2 focus-visible:outline-white"
          >
            Agendar demonstração
          </a>
          <a
            href="#login"
            className="inline-flex items-center justify-center px-7 py-4 rounded-[12px] font-display font-semibold text-[16px] text-white border border-white/50 hover:border-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white"
          >
            Já tenho conta →
          </a>
        </div>
      </div>
    </section>
  )
}
