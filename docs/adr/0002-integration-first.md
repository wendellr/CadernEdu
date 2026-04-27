# ADR-002: Estratégia integration-first

## Status

Aceita

## Contexto

Prefeituras e secretarias de educação já operam com sistemas existentes para
matrículas, diário de classe, frequência, notas, transporte, merenda, RH,
ouvidoria, dados censitários e prestação de contas. Esses sistemas podem variar
por município, contrato, fornecedor e maturidade técnica. Alguns terão APIs
formais; outros dependerão de exportações CSV/XLSX, SFTP, acesso controlado a
banco de dados, arquivos legados ou rotinas manuais.

O CadernEdu propõe uma experiência nova para professores, famílias, alunos e
gestores. Porém, se exigir substituição completa desde o primeiro contrato,
ele aumenta risco político, risco operacional e retrabalho nas escolas.

## Decisão

O CadernEdu adota uma estratégia **integration-first**:

- Não pressupor substituição imediata dos sistemas oficiais da prefeitura.
- Tratar sistemas existentes como fontes de verdade possíveis por domínio.
- Criar um modelo canônico interno para entidades educacionais centrais.
- Implementar conectores/adaptadores por sistema externo, sem contaminar o
  domínio principal com nomes, códigos e peculiaridades de cada fornecedor.
- Começar com importação/exportação controlada por arquivo quando API formal
  não existir.
- Só permitir escrita em sistemas externos quando houver contrato claro,
  trilha de auditoria, idempotência e regra de conflito definida.

## Modelo operacional

Cada entidade crítica deve ter uma política de origem:

| Entidade | Pergunta obrigatória |
|---|---|
| Secretaria, escola, turma | Quem é a fonte de verdade? |
| Aluno, responsável, professor | Como identidade e vínculo são reconciliados? |
| Matrícula | CadernEdu apenas lê ou também cria/remaneja? |
| Frequência, aula, atividade | O registro nasce no CadernEdu ou no diário legado? |
| Nota/boletim | CadernEdu é auxiliar ou sistema oficial? |
| INEP/Censo | Exporta dados próprios ou consolida dados externos? |

Toda integração deve registrar:

- sistema de origem;
- identificador externo;
- data/hora da última sincronização;
- hash ou versão do payload;
- status da importação/exportação;
- erros por linha/registro;
- usuário ou job responsável pela operação.

## Implicações

- O backlog do MVP deve incluir descoberta e importação inicial de dados da
  prefeitura-piloto antes de avançar para escala municipal.
- O painel precisa de uma área de **Configurações → Integrações** com status,
  logs, execução manual e histórico de sincronização.
- O backend deve ganhar um domínio `integrations` quando a primeira integração
  real for implementada.
- O OpenAPI deve refletir contratos canônicos do CadernEdu, não contratos de
  fornecedores específicos.
- Dados importados precisam respeitar LGPD-Kids, auditoria e rastreabilidade.

## Consequências positivas

- Reduz atrito institucional.
- Evita duplicidade de digitação nas escolas.
- Permite pilotos menores, com menor risco.
- Preserva a capacidade de substituir módulos no futuro sem prometer isso no
  primeiro contrato.

## Riscos

- Integrações podem dominar o cronograma se não forem limitadas por fase.
- Dados legados podem vir incompletos, inconsistentes ou sem identificadores
  estáveis.
- Escrita bidirecional sem regra de conflito pode corromper processos oficiais.

## Regras de mitigação

- Fase inicial: leitura/importação antes de escrita.
- CSV/XLSX validado é aceitável para piloto.
- Sincronização automática recorrente só após importação manual validada.
- Cada conector deve ter testes com fixtures reais anonimizadas.
- Conflitos devem ficar visíveis para operador humano antes de sobrescrever
  dados oficiais.
