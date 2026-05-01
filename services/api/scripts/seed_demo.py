"""
Seed de demonstração — dados realistas para apresentações.

Cria:
  - 1 Secretaria: SME São Gabriel
  - 2 Escolas
  - 5 Turmas (3 na escola A, 2 na escola B)
  - 3 Professores, 8 Alunos, 4 Responsáveis
  - ~4 semanas de aulas (passado + semana atual + próxima)
  - ~20 atividades de casa
  - 7 comunicados broadcast por turma

Uso:
    docker compose exec api python scripts/seed_demo.py
    docker compose exec api python scripts/seed_demo.py --reset

Extensão: para um novo domínio (ex: merenda), crie:
    async def seed_merenda(session: AsyncSession, ctx: SeedContext) -> None:
        ...  # acesse ctx.secretaria, ctx.turmas, etc.
    e chame no final do seed().
"""

import argparse
import asyncio
import os
import sys
from dataclasses import dataclass, field
from datetime import date, timedelta
from itertools import cycle

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.domains.comunicacao.models import Mensagem
from app.domains.features.models import FeatureFlag, FeatureKey
from app.domains.gestao.models import Matricula, ProfessorTurma
from app.domains.identity.models import (
    Escola,
    PerfilUsuario,
    ResponsavelAluno,
    Secretaria,
    Turma,
    Usuario,
)
from app.domains.pedagogico.models import Aula, AtividadeDeCasa

engine = create_async_engine(settings.database_url, echo=False)
Session = async_sessionmaker(engine, expire_on_commit=False)

# ── Dados de configuração ─────────────────────────────────────────────────────
# Edite aqui para ajustar os dados sem tocar na lógica.

SECRETARIA = {
    "nome": "SME São Gabriel",
    "municipio": "São Gabriel",
    "estado": "RS",
    "cnpj": "01.234.567/0001-89",
}

ESCOLAS = [
    {"nome": "EMEF Profª Nair Rodrigues", "codigo_inep": "43001001"},
    {"nome": "EMEF Dom Pedro II", "codigo_inep": "43001002"},
]

# (escola_idx, nome_turma, serie)
TURMAS = [
    (0, "3º Ano A", "3º Ano"),
    (0, "5º Ano B", "5º Ano"),
    (0, "4º Ano C", "4º Ano"),
    (1, "6º Ano A", "6º Ano"),
    (1, "2º Ano B", "2º Ano"),
]

PROFESSORES = [
    {
        "nome": "Ana Paula Costa",
        "email": "ana.costa@demo.edu.br",
        "keycloak_id": "demo-prof-001",
    },
    {
        "nome": "Ricardo Mendes",
        "email": "ricardo.mendes@demo.edu.br",
        "keycloak_id": "demo-prof-002",
    },
    {
        "nome": "Juliana Ferreira",
        "email": "juliana.ferreira@demo.edu.br",
        "keycloak_id": "demo-prof-003",
    },
    {
        "nome": "Paulo Multi Perfil",
        "email": "multi@demo.edu.br",
        "keycloak_id": "demo-multi-prof-001",
    },
]

SECRETARIA_USUARIOS = [
    {
        "nome": "Secretaria Demo",
        "email": "secretaria@demo.edu.br",
        "keycloak_id": "demo-secretaria-001",
    },
]

DIRETORES = [
    {
        "nome": "Helena Nogueira",
        "email": "diretor.nair@demo.edu.br",
        "keycloak_id": "demo-diretor-001",
        "escola_idx": 0,
        "perfil": PerfilUsuario.diretor,
    },
    {
        "nome": "Marcos Vieira",
        "email": "coordenador.dompedro@demo.edu.br",
        "keycloak_id": "demo-coordenador-001",
        "escola_idx": 1,
        "perfil": PerfilUsuario.coordenador,
    },
]

# (nome, email, keycloak_id, índices das turmas)
ALUNOS = [
    ("Lucas Andrade", "lucas@demo.edu.br", "demo-aluno-001", 0),
    ("Beatriz Sousa", "beatriz@demo.edu.br", "demo-aluno-002", 0),
    ("Gabriel Lima", "gabriel@demo.edu.br", "demo-aluno-003", 1),
    ("Sofia Pereira", "sofia@demo.edu.br", "demo-aluno-004", 1),
    ("Matheus Oliveira", "matheus@demo.edu.br", "demo-aluno-005", 2),
    ("Larissa Santos", "larissa@demo.edu.br", "demo-aluno-006", 3),
    ("Felipe Costa", "felipe@demo.edu.br", "demo-aluno-007", 3),
    ("Isabela Ramos", "isabela@demo.edu.br", "demo-aluno-008", 4),
]

# (nome, email, keycloak_id, índices dos filhos em ALUNOS)
RESPONSAVEIS = [
    ("Carla Andrade", "responsavel@demo.edu.br", "demo-resp-001", [0, 3]),   # Lucas + Sofia
    ("Roberto Sousa", "roberto@demo.edu.br", "demo-resp-002", [1]),           # Beatriz
    ("Patrícia Lima", "patricia@demo.edu.br", "demo-resp-003", [2, 4]),       # Gabriel + Matheus
    ("Fernando Santos", "fernando@demo.edu.br", "demo-resp-004", [5, 6]),     # Larissa + Felipe
    ("Paulo Multi Perfil", "multi@demo.edu.br", "demo-multi-resp-001", [7]),  # Isabela
]

DISCIPLINAS_F1 = ["Matemática", "Português", "Ciências", "História", "Geografia", "Arte", "Ed. Física"]
DISCIPLINAS_F2 = ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Arte", "Ed. Física"]

# Banco de conteúdos BNCC — (conteúdo da aula, atividade de casa ou None)
CONTEUDOS: dict[str, list[tuple[str, str | None]]] = {
    "Matemática": [
        ("Frações equivalentes e simplificação", "Exercícios págs. 45–47 do livro"),
        ("Multiplicação por dois dígitos — algoritmo da multiplicação", "Lista de multiplicação (20 contas)"),
        ("Geometria: perímetro e área de figuras planas", "Calcular área de um cômodo da casa — trazer na próxima aula"),
        ("Números decimais: leitura e representação na reta numérica", None),
        ("Divisão com resto — prova real da divisão", "Págs. 62–63 exercícios ímpares"),
        ("Gráficos de barras e tabelas: leitura e construção", None),
        ("Medidas de comprimento: km, m, cm e mm — conversões", "Trazer objeto para medir em sala"),
        ("Probabilidade: experimentos simples com moeda e dado", None),
    ],
    "Português": [
        ("Produção textual: conto de aventura — planejamento e rascunho", "Passar o rascunho a limpo em folha avulsa"),
        ("Ortografia: uso do M antes de P e B", "Estudar lista de palavras — ditado na próxima aula"),
        ("Interpretação de texto: fábulas de Esopo", "Ler 'A Cigarra e a Formiga' e responder as 5 questões"),
        ("Pontuação: vírgula, ponto final e ponto de exclamação", None),
        ("Texto instrucional: receitas culinárias — estrutura e linguagem", "Trazer uma receita de casa para compartilhar"),
        ("Concordância verbal e nominal — regras e exceções", "Exercícios págs. 88–90"),
        ("Poesia: versos, estrofes e rima — análise e criação", "Criar um poema de 4 estrofes sobre a natureza"),
        ("Variação linguística: dialetos e registros formais e informais", None),
    ],
    "Ciências": [
        ("Ciclo da água: evaporação, condensação e precipitação", "Experimento: copo d'água coberto com plástico filme — observar por 24h"),
        ("Cadeia alimentar: produtores, consumidores e decompositores", "Desenhar uma cadeia alimentar de um bioma brasileiro"),
        ("O sistema solar: planetas, satélites e movimentos", "Pesquisa: características de um planeta à escolha"),
        ("Propriedades dos materiais: condutores e isolantes de calor", None),
        ("Animais vertebrados e invertebrados — classificação e exemplos", "Listar 5 exemplos de cada grupo com habitat"),
        ("Fotossíntese e respiração das plantas", "Plantar feijão e anotar crescimento por uma semana"),
        ("Higiene e saúde: microorganismos, vacinas e prevenção", None),
        ("Ecossistemas brasileiros: Pantanal e Caatinga", "Pesquisa sobre ameaças a um ecossistema"),
    ],
    "História": [
        ("Povos indígenas do Brasil: modos de vida e diversidade cultural", "Pesquisar sobre um povo indígena brasileiro"),
        ("Proclamação da República — causas e consequências", None),
        ("Abolição da escravidão — Lei Áurea e o pós-abolição", "Ler texto 'Vozes da Abolição' e responder as questões"),
        ("O cotidiano no Brasil Colônia: trabalho, religião e sociedade", None),
        ("Imigração no Brasil: europeus, japoneses e africanos", "Entrevistar familiar sobre origem da família"),
        ("Getúlio Vargas e a Era Vargas: trabalhismo e industrialização", "Pesquisa: uma lei trabalhista criada na Era Vargas"),
        ("O Brasil na Segunda Guerra Mundial", None),
    ],
    "Geografia": [
        ("Biomas brasileiros: Amazônia, Cerrado e Mata Atlântica", "Colorir mapa e identificar estados de cada bioma"),
        ("Relevo brasileiro: planaltos, planícies e depressões", None),
        ("Regiões do Brasil: características econômicas e culturais", "Exercícios págs. 55–57"),
        ("Cartografia: leitura de mapas, rosa dos ventos e escala", "Atividade de orientação no mapa da cidade"),
        ("Clima e vegetação: relação e influência na vida humana", None),
        ("Cidades e campo: êxodo rural e urbanização no Brasil", "Entrevista com familiar sobre migração — opcional"),
    ],
    "Arte": [
        ("Modernismo brasileiro: Tarsila do Amaral e Di Cavalcanti", "Criar releitura de 'Abaporu' com materiais livres"),
        ("Técnicas de desenho: perspectiva e proporcionalidade", None),
        ("Arte indígena: pinturas corporais e grafismos", "Criar padrão gráfico inspirado em arte indígena"),
        ("Música brasileira: samba, forró, baião e maracatu", None),
        ("Teatro e expressão corporal: improvisação e cenas curtas", None),
    ],
    "Ed. Física": [
        ("Futsal: regras oficiais e fundamentos técnicos", None),
        ("Atletismo: corridas de velocidade e resistência — técnica de partida", None),
        ("Jogos cooperativos: comunicação e resolução de conflitos", None),
        ("Vôlei: passe, manchete e saque por baixo", None),
        ("Capoeira: história, ginga e movimentos básicos", None),
        ("Ginástica de academia: postura e exercícios de fortalecimento", None),
    ],
    "Inglês": [
        ("Present continuous: estrutura e uso com ações em andamento", "Exercícios 1–5 pág. 32"),
        ("Vocabulary: clothes and fashion — describing outfits", None),
        ("Reading comprehension: daily routines — short texts", "Escrever 5 frases sobre sua própria rotina em inglês"),
        ("Simple past: regular and irregular verbs", "Memorizar 20 verbos irregulares da lista"),
        ("Greetings and introductions: formal and informal", None),
        ("Numbers and dates: ordinals and cardinal numbers", "Exercícios de calendário pág. 18"),
    ],
}

COMUNICADOS = [
    (
        "Reunião de pais e mestres — 1º bimestre",
        "Prezados responsáveis,\n\nConvidamos para a Reunião de Pais e Mestres do 1º bimestre, que ocorrerá na próxima sexta-feira, às 19h, no salão de eventos da escola.\n\nPor favor, confirme presença pelo WhatsApp da secretaria.\n\nAtenciosamente,\nDireção",
    ),
    (
        "Aviso: semana de provas — 5 a 9 de maio",
        "Informamos que a semana de avaliações do 1º bimestre será de 5 a 9 de maio. As avaliações ocorrem no horário normal de aula.\n\nOrientamos que os alunos revisem o conteúdo estudado.",
    ),
    (
        "Festa Junina 2026 — data e organização",
        "A tradicional Festa Junina acontecerá no dia 21 de junho, a partir das 15h, no pátio da escola.\n\nCada turma será responsável por uma barraca temática. As informações de organização serão enviadas em breve.",
    ),
    (
        "Calendário de recuperação — 1º bimestre",
        "Alunos com nota inferior a 5,0 no 1º bimestre realizarão prova de recuperação nos dias 19 e 20 de maio.\n\nO conteúdo cobrado será idêntico ao das avaliações regulares do bimestre.",
    ),
    (
        "Passeio ao Museu de Ciências — autorização necessária",
        "Nossa turma realizará visita educativa ao Museu de Ciências no dia 28 de maio.\n\nDevolver a autorização assinada até 20/05. Sem autorização, o aluno não poderá participar.\n\nCusto do transporte: R$ 15,00.",
    ),
    (
        "Semana de conscientização ambiental — 2 a 6 de junho",
        "Realizaremos atividades especiais sobre meio ambiente e sustentabilidade nessa semana.\n\nOs alunos devem trazer material reciclável (caixas, garrafas pet, revistas) para as atividades práticas.",
    ),
    (
        "Lembrete: entrega do trabalho de Ciências",
        "O trabalho de Ciências sobre ecossistemas deve ser entregue impresso até quinta-feira.\n\nTrabalhos entregues fora do prazo terão desconto de 1,0 ponto por dia de atraso.",
    ),
]


# ── Context ────────────────────────────────────────────────────────────────────
# Ao criar um novo domínio, adicione um campo aqui para que as entidades criadas
# fiquem disponíveis para os seeds seguintes.

@dataclass
class SeedContext:
    secretaria: Secretaria | None = None
    escolas: list[Escola] = field(default_factory=list)
    turmas: list[Turma] = field(default_factory=list)
    professores: list[Usuario] = field(default_factory=list)
    gestores: list[Usuario] = field(default_factory=list)
    alunos: list[Usuario] = field(default_factory=list)
    responsaveis: list[Usuario] = field(default_factory=list)
    # Novos domínios: adicione aqui
    # aulas: list[Aula] = field(default_factory=list)


# ── Seeds por domínio ──────────────────────────────────────────────────────────

async def seed_identidade(session: AsyncSession, ctx: SeedContext) -> None:
    secretaria = Secretaria(**SECRETARIA, ativo=True)
    session.add(secretaria)
    await session.flush()
    ctx.secretaria = secretaria

    escolas = []
    for dados in ESCOLAS:
        escola = Escola(secretaria_id=secretaria.id, **dados, ativo=True)
        session.add(escola)
        escolas.append(escola)
    await session.flush()
    ctx.escolas = escolas

    turmas = []
    for escola_idx, nome, serie in TURMAS:
        turma = Turma(
            escola_id=escolas[escola_idx].id,
            nome=nome,
            serie=serie,
            ano_letivo=2026,
            ativo=True,
        )
        session.add(turma)
        turmas.append(turma)
    await session.flush()
    ctx.turmas = turmas

    for dados in SECRETARIA_USUARIOS:
        session.add(
            Usuario(
                **dados,
                perfil=PerfilUsuario.secretaria,
                secretaria_id=secretaria.id,
                escola_id=None,
                ativo=True,
            )
        )

    gestores = []
    for dados in DIRETORES:
        escola_idx = dados["escola_idx"]
        perfil = dados["perfil"]
        payload = {k: v for k, v in dados.items() if k not in {"escola_idx", "perfil"}}
        gestor = Usuario(
            **payload,
            perfil=perfil,
            secretaria_id=secretaria.id,
            escola_id=escolas[escola_idx].id,
            ativo=True,
        )
        session.add(gestor)
        gestores.append(gestor)
    await session.flush()
    ctx.gestores = gestores

    professores = []
    for dados in PROFESSORES:
        prof = Usuario(
            **dados,
            perfil=PerfilUsuario.professor,
            secretaria_id=secretaria.id,
            escola_id=escolas[0].id,
            ativo=True,
        )
        session.add(prof)
        professores.append(prof)
    await session.flush()
    ctx.professores = professores

    prof_por_turma = [professores[i % len(professores)] for i in range(len(turmas))]
    for turma, professor in zip(turmas, prof_por_turma):
        session.add(
            ProfessorTurma(
                professor_id=professor.id,
                turma_id=turma.id,
                ano_letivo=turma.ano_letivo,
                ativo=True,
            )
        )

    alunos = []
    for nome, email, keycloak_id, turma_idx in ALUNOS:
        aluno = Usuario(
            nome=nome,
            email=email,
            keycloak_id=keycloak_id,
            perfil=PerfilUsuario.aluno,
            secretaria_id=secretaria.id,
            escola_id=turmas[turma_idx].escola_id,
            ativo=True,
        )
        session.add(aluno)
        alunos.append(aluno)
    await session.flush()
    ctx.alunos = alunos

    responsaveis = []
    for nome, email, keycloak_id, filhos_idx in RESPONSAVEIS:
        resp = Usuario(
            nome=nome,
            email=email,
            keycloak_id=keycloak_id,
            perfil=PerfilUsuario.responsavel,
            secretaria_id=secretaria.id,
            ativo=True,
        )
        session.add(resp)
        responsaveis.append(resp)
    await session.flush()

    for resp, (_, _, _, filhos_idx) in zip(responsaveis, RESPONSAVEIS):
        for fi in filhos_idx:
            session.add(ResponsavelAluno(responsavel_id=resp.id, aluno_id=alunos[fi].id))

    for i, (_, _, _, turma_idx) in enumerate(ALUNOS):
        session.add(Matricula(aluno_id=alunos[i].id, turma_id=turmas[turma_idx].id, ano_letivo=2026, ativo=True))

    await session.flush()
    ctx.responsaveis = responsaveis


async def seed_features(session: AsyncSession, ctx: SeedContext) -> None:
    for key in FeatureKey:
        session.add(
            FeatureFlag(
                feature_key=key,
                secretaria_id=ctx.secretaria.id,
                escola_id=None,
                enabled=True,
            )
        )
    await session.flush()


async def seed_pedagogico(session: AsyncSession, ctx: SeedContext) -> None:
    hoje = date.today()
    segunda_desta = hoje - timedelta(days=hoje.weekday())
    inicio = segunda_desta - timedelta(weeks=2)   # 2 semanas atrás
    fim = segunda_desta + timedelta(weeks=1, days=4)  # fim da próxima semana

    # Professores ciclam pelas turmas
    prof_por_turma = [ctx.professores[i % len(ctx.professores)] for i in range(len(ctx.turmas))]

    for i, turma in enumerate(ctx.turmas):
        professor = prof_por_turma[i]
        disciplinas = DISCIPLINAS_F2 if "6º" in turma.serie or "7º" in turma.serie else DISCIPLINAS_F1
        disc_cycle = cycle(disciplinas)

        d = inicio
        while d <= fim:
            if d.weekday() < 5:  # seg–sex
                n_aulas = 2 if d.weekday() == 4 else 3  # sexta tem 2
                for _ in range(n_aulas):
                    disc = next(disc_cycle)
                    banco = CONTEUDOS.get(disc, [("Conteúdo da aula", None)])
                    conteudo_txt, atividade_txt = banco[
                        hash(f"{turma.id}{d}{disc}") % len(banco)
                    ]

                    aula = Aula(
                        turma_id=turma.id,
                        professor_id=professor.id,
                        data=d,
                        disciplina=disc,
                        conteudo=conteudo_txt,
                    )

                    if atividade_txt:
                        prazo = d + timedelta(days=3)
                        while prazo.weekday() >= 5:
                            prazo += timedelta(days=1)
                        aula.atividades.append(
                            AtividadeDeCasa(
                                turma_id=turma.id,
                                professor_id=professor.id,
                                disciplina=disc,
                                descricao=atividade_txt,
                                prazo=prazo,
                                peso=1.0,
                            )
                        )

                    session.add(aula)
            d += timedelta(days=1)

    await session.flush()


async def seed_comunicacao(session: AsyncSession, ctx: SeedContext) -> None:
    professor = ctx.professores[0]
    # Distribui comunicados ao longo das últimas 4 semanas
    hoje = date.today()

    for i, turma in enumerate(ctx.turmas):
        prof = ctx.professores[i % len(ctx.professores)]
        for j, (assunto, corpo) in enumerate(COMUNICADOS):
            # Espalha as datas para parecer histórico real
            dias_atras = (j * 4) % 25
            session.add(
                Mensagem(
                    remetente_id=prof.id,
                    turma_id=turma.id,
                    secretaria_id=ctx.secretaria.id,
                    assunto=assunto,
                    corpo=corpo,
                )
            )

    await session.flush()


# ── Orquestrador ───────────────────────────────────────────────────────────────

async def seed() -> None:
    async with Session() as session:
        async with session.begin():
            ctx = SeedContext()
            await seed_identidade(session, ctx)
            await seed_features(session, ctx)
            await seed_pedagogico(session, ctx)
            await seed_comunicacao(session, ctx)

    _print_summary(ctx)


async def reset_and_seed() -> None:
    async with Session() as session:
        async with session.begin():
            await session.execute(text(
                "TRUNCATE mensagem_anexos, mensagens, atividades_de_casa, aulas, "
                "presencas, matriculas, professor_turmas, responsavel_aluno, feature_flags, "
                "usuarios, turmas, escolas, secretarias RESTART IDENTITY CASCADE"
            ))
        async with session.begin():
            ctx = SeedContext()
            await seed_identidade(session, ctx)
            await seed_features(session, ctx)
            await seed_pedagogico(session, ctx)
            await seed_comunicacao(session, ctx)

    _print_summary(ctx)


def _print_summary(ctx: SeedContext) -> None:
    print("\n✅  Seed de demonstração concluído!")
    print(f"\n   Secretaria : {ctx.secretaria.nome}")
    for e in ctx.escolas:
        print(f"   Escola     : {e.nome}")
    print()
    print("   ── Secretaria e direção ─────────────────")
    print("   secretaria@demo.edu.br")
    for g in ctx.gestores:
        print(f"   {g.email}  →  {g.perfil}")
    print()
    print("   ── Professores ───────────────────────────")
    for p in ctx.professores:
        print(f"   {p.email}")
    print()
    print("   ── Responsáveis (login principal: responsavel@demo.edu.br) ───")
    for r, (_, _, _, filhos_idx) in zip(ctx.responsaveis, RESPONSAVEIS):
        filhos = [ctx.alunos[i].nome.split()[0] for i in filhos_idx]
        print(f"   {r.email}  →  filhos: {', '.join(filhos)}")
    print()
    print("   ── Login multiperfil ─────────────────────")
    print("   multi@demo.edu.br  →  professor + responsavel")
    print()
    print("   ── Alunos ────────────────────────────────")
    for a, (_, _, _, turma_idx) in zip(ctx.alunos, ALUNOS):
        print(f"   {a.email}  →  {ctx.turmas[turma_idx].nome}")
    print()
    print("   Senha: qualquer valor (autenticação bypassa em dev)")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed de demonstração CadernEdu")
    parser.add_argument("--reset", action="store_true", help="Apaga todos os dados antes de semear")
    args = parser.parse_args()

    if args.reset:
        print("⚠️  --reset: apagando todos os dados e recriando...")
        asyncio.run(reset_and_seed())
    else:
        asyncio.run(seed())
