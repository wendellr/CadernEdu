const faqs = [
  {
    q: 'Quanto custa para o município?',
    a: 'O modelo comercial depende do escopo do piloto, quantidade de escolas, módulos contratados e integrações necessárias. A proposta deve nascer depois do diagnóstico técnico e pedagógico da rede.',
    open: true,
  },
  {
    q: 'Funciona em escolas com internet ruim?',
    a: 'Essa é uma premissa do produto. Os apps são nativos e a arquitetura prevê uso offline para rotinas selecionadas, com sincronização quando houver conexão. O escopo offline exato é definido por módulo.',
  },
  {
    q: 'Como vocês tratam a LGPD de menores?',
    a: 'O desenho considera conta de aluno gerenciada pela escola, consentimento parental, auditoria de acesso e minimização de dados. Em implantação real, os controles e bases legais precisam ser validados com a prefeitura.',
  },
  {
    q: 'Integra com o sistema atual da prefeitura?',
    a: 'Essa é a estratégia central. Primeiro mapeamos quais sistemas são fonte de verdade e começamos por importação CSV/XLSX ou API disponível. Conectores específicos entram conforme viabilidade técnica e contrato.',
  },
  {
    q: 'Quanto tempo leva pra implantar?',
    a: 'Depende da qualidade dos dados, do acesso aos sistemas existentes e do escopo escolhido. O caminho recomendado é começar com uma escola-piloto, carga inicial assistida e um fluxo ponta a ponta validado.',
  },
  {
    q: 'Quem mantém o conteúdo pedagógico?',
    a: 'A rede pode manter seus próprios materiais, planos e trilhas. Conteúdos BNCC, robótica e tutor IA são módulos que podem ser adicionados progressivamente, com curadoria e governança pedagógica.',
  },
]

export default function FAQ() {
  return (
    <section className="py-[120px] bg-bg-alt" id="faq">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-20 items-start">
          <div>
            <span className="inline-block font-display font-bold text-[13px] tracking-[0.16em] uppercase text-cyan mb-4">
              Perguntas frequentes
            </span>
            <h2 className="text-[40px] mt-3.5">Dúvidas comuns de quem está começando.</h2>
            <p className="mt-5 text-fg-dim text-[17px]">
              Não encontrou? Fale com nossa equipe pedagógica — respondemos em até 24h.
            </p>
            <a
              href="#demo"
              className="inline-flex items-center justify-center px-[22px] py-3 mt-6 rounded-[10px] font-display font-semibold text-[15px] bg-fg text-white hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-fg"
            >
              Falar com a equipe
            </a>
          </div>

          <div className="flex flex-col gap-1">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="border-b border-border py-5 group"
                open={faq.open}
              >
                <summary className="flex items-center justify-between font-display font-semibold text-[18px] cursor-pointer list-none focus-visible:outline-2 focus-visible:outline-cyan rounded-sm">
                  {faq.q}
                  <span
                    className="text-[24px] text-cyan font-light transition-transform duration-200 group-open:rotate-45 flex-shrink-0 ml-4"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3.5 text-fg-dim text-[16px] leading-[1.6]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
