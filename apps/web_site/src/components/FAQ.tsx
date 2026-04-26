const faqs = [
  {
    q: 'Quanto custa para o município?',
    a: 'O modelo é por aluno ativo/mês com escala municipal. Há linha de financiamento via FUNDEB e parcerias com governos estaduais. Falamos com sua secretaria para um orçamento sob medida.',
    open: true,
  },
  {
    q: 'Funciona em escolas com internet ruim?',
    a: 'Sim. O app foi desenhado offline-first: o aluno baixa a trilha do dia e sincroniza quando voltar à área coberta. A versão mobile é nativa (iOS e Android), publicada nas lojas oficiais.',
  },
  {
    q: 'Como vocês tratam a LGPD de menores?',
    a: 'A conta é gerenciada pela escola, com consentimento parental documentado. Dados sensíveis ficam em servidores no Brasil, com criptografia em trânsito e em repouso, auditoria completa e DPO dedicado.',
  },
  {
    q: 'Integra com o sistema atual da prefeitura?',
    a: 'Sim. Temos integrações prontas com SED, SIGAA e exportação direta para o Censo Escolar do INEP. Outras integrações são desenvolvidas no piloto sem custo adicional.',
  },
  {
    q: 'Quanto tempo leva pra implantar?',
    a: 'O piloto em 10 escolas roda em 60 dias. A escala para a rede toda acontece nos 3 meses seguintes. Treinamos professores e equipe pedagógica em formato híbrido.',
  },
  {
    q: 'Quem mantém o conteúdo pedagógico?',
    a: 'As trilhas seguem a BNCC e podem ser remixadas por professores da rede. Há também marketplace com editoras e ONGs parceiras já curado pela nossa equipe.',
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
