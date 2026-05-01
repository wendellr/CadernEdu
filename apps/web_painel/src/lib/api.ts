import { getToken } from './auth'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // Pydantic retorna detail como array [{loc, msg, type}]; outras rotas retornam string
    const detail = Array.isArray(body.detail)
      ? body.detail.map((e: { msg: string }) => e.msg).join(', ')
      : (body.detail ?? body.message ?? `Erro ${res.status}`)
    throw new ApiError(res.status, detail)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type TokenPair = { accessToken: string; refreshToken: string; expiresIn: number }

export type LoginOption = {
  usuario_id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  secretaria_id: string | null
  secretaria_nome: string | null
  escola_id: string | null
  escola_nome: string | null
}

export const loginOptions = (email: string, senha: string) =>
  req<LoginOption[]>('/auth/login-options', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })

export const login = (email: string, senha: string, usuarioId?: string) =>
  req<TokenPair>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha, usuario_id: usuarioId }),
  })

// ── Identity ──────────────────────────────────────────────────────────────────

export type Secretaria = { id: string; nome: string; municipio: string; estado: string }
export type Escola = { id: string; nome: string; codigo_inep?: string | null; secretaria_id: string; ativo: boolean }
export type Turma = { id: string; nome: string; serie: string; ano_letivo: number; escola_id: string; ativo: boolean }

export const getSecretaria = (secretariaId: string) =>
  req<Secretaria>(`/identity/secretarias/${secretariaId}`)

export const listEscolas = (secretariaId: string) =>
  req<Escola[]>(`/identity/secretarias/${secretariaId}/escolas`)

export const getEscola = (escolaId: string) =>
  req<Escola>(`/identity/escolas/${escolaId}`)

export const listTurmas = (escolaId: string, anoLetivo?: number) =>
  req<Turma[]>(`/identity/escolas/${escolaId}/turmas${anoLetivo ? `?ano_letivo=${anoLetivo}` : ''}`)

export const getTurma = (turmaId: string) =>
  req<Turma>(`/identity/turmas/${turmaId}`)

// ── Pedagógico ────────────────────────────────────────────────────────────────

export type Aula = {
  id: string
  turma_id: string
  professor_id: string
  data: string
  disciplina: string
  conteudo: string
  observacoes: string | null
  created_at: string
}

export type AulaCreate = {
  data: string
  disciplina: string
  conteudo: string
  observacoes?: string | null
}

export const listAulas = (turmaId: string, dataInicio?: string, dataFim?: string) => {
  const params = new URLSearchParams()
  if (dataInicio) params.set('data_inicio', dataInicio)
  if (dataFim) params.set('data_fim', dataFim)
  const qs = params.toString() ? `?${params}` : ''
  return req<Aula[]>(`/pedagogico/turmas/${turmaId}/aulas${qs}`)
}

export const criarAula = (turmaId: string, data: AulaCreate) =>
  req<Aula>(`/pedagogico/turmas/${turmaId}/aulas`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export type AulaUpdate = {
  data?: string
  disciplina?: string
  conteudo?: string
  observacoes?: string | null
}

export const atualizarAula = (aulaId: string, data: AulaUpdate) =>
  req<Aula>(`/pedagogico/aulas/${aulaId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const removerAula = (aulaId: string) =>
  req<void>(`/pedagogico/aulas/${aulaId}`, { method: 'DELETE' })

// ── Chamada ───────────────────────────────────────────────────────────────────

export type StatusPresenca = 'presente' | 'falta' | 'atestado'

export type ChamadaItem = {
  aluno_id: string
  aluno_nome: string
  status: StatusPresenca
  observacoes: string | null
  presenca_id: string | null
}

export type ChamadaResponse = {
  data: string
  turma_id: string
  total: number
  presentes: number
  faltas: number
  atestados: number
  itens: ChamadaItem[]
}

export type ChamadaCreate = {
  data: string
  presencas: { aluno_id: string; status: StatusPresenca; observacoes?: string | null }[]
}

export const getChamada = (turmaId: string, data: string) =>
  req<ChamadaResponse>(`/pedagogico/turmas/${turmaId}/chamada?data=${data}`)

export const lancarChamada = (turmaId: string, payload: ChamadaCreate) =>
  req<ChamadaResponse>(`/pedagogico/turmas/${turmaId}/chamada`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export type AtividadeCreate = {
  aula_id?: string | null
  disciplina: string
  descricao: string
  prazo: string
  peso?: number | null
}

export type Atividade = {
  id: string
  aula_id: string | null
  turma_id: string
  professor_id: string
  disciplina: string
  descricao: string
  prazo: string
  peso: number | null
  created_at: string
}

export const criarAtividade = (turmaId: string, data: AtividadeCreate) =>
  req<Atividade>(`/pedagogico/turmas/${turmaId}/atividades`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export type AtividadeUpdate = {
  disciplina?: string
  descricao?: string
  prazo?: string
  peso?: number | null
}

export const atualizarAtividade = (atividadeId: string, data: AtividadeUpdate) =>
  req<Atividade>(`/pedagogico/atividades/${atividadeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const listAtividades = (turmaId: string, dataInicio?: string, dataFim?: string) => {
  const params = new URLSearchParams()
  if (dataInicio) params.set('data_inicio', dataInicio)
  if (dataFim) params.set('data_fim', dataFim)
  const qs = params.toString() ? `?${params}` : ''
  return req<Atividade[]>(`/pedagogico/turmas/${turmaId}/atividades${qs}`)
}

// ── Comunicação ───────────────────────────────────────────────────────────────

export type Aluno = {
  id: string
  nome: string
  email: string
}

export type Mensagem = {
  id: string
  remetente_id: string
  remetente_nome: string
  turma_id: string | null
  destinatario_id: string | null
  destinatario_nome: string | null
  is_broadcast: boolean
  secretaria_id: string
  assunto: string
  corpo: string
  created_at: string
  anexos: Anexo[]
}

export type Anexo = {
  id: string
  mensagem_id: string
  nome_original: string
  content_type: string
  tamanho_bytes: number
  created_at: string
}

export type MensagemCreate = {
  assunto: string
  corpo: string
  destinatario_id?: string | null
}

export const listAlunosDaTurma = (turmaId: string) =>
  req<Aluno[]>(`/identity/turmas/${turmaId}/alunos`)

// ── Admin — Secretaria ────────────────────────────────────────────────────────

export type PerfilUsuario =
  | 'aluno'
  | 'professor'
  | 'responsavel'
  | 'diretor'
  | 'coordenador'
  | 'gestor_escola'
  | 'secretaria'

export type Usuario = {
  id: string
  keycloak_id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  ativo: boolean
  secretaria_id: string | null
  escola_id: string | null
  created_at: string
}

export type EscolaCreate = { nome: string; codigo_inep?: string }
export type EscolaUpdate = { nome?: string; codigo_inep?: string | null; ativo?: boolean }
export type TurmaCreate = { nome: string; serie: string; ano_letivo: number }
export type TurmaUpdate = { nome?: string; serie?: string; ano_letivo?: number; ativo?: boolean }
export type UsuarioCreate = {
  keycloak_id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  secretaria_id: string
  escola_id?: string | null
}
export type UsuarioUpdate = Partial<UsuarioCreate> & { ativo?: boolean }

export const listUsuarios = (secretariaId: string, perfil?: PerfilUsuario) =>
  req<Usuario[]>(
    `/identity/secretarias/${secretariaId}/usuarios${perfil ? `?perfil=${perfil}` : ''}`,
  )

export const criarEscola = (secretariaId: string, data: EscolaCreate) =>
  req<Escola>(`/identity/secretarias/${secretariaId}/escolas`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const atualizarEscola = (escolaId: string, data: EscolaUpdate) =>
  req<Escola>(`/identity/escolas/${escolaId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const removerEscola = (escolaId: string) =>
  req<void>(`/identity/escolas/${escolaId}`, { method: 'DELETE' })

export const criarTurma = (escolaId: string, data: TurmaCreate) =>
  req<Turma>(`/identity/escolas/${escolaId}/turmas`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const atualizarTurma = (turmaId: string, data: TurmaUpdate) =>
  req<Turma>(`/identity/turmas/${turmaId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const removerTurma = (turmaId: string) =>
  req<void>(`/identity/turmas/${turmaId}`, { method: 'DELETE' })

export const criarUsuario = (data: UsuarioCreate) =>
  req<Usuario>('/identity/usuarios', { method: 'POST', body: JSON.stringify(data) })

export const atualizarUsuario = (usuarioId: string, data: UsuarioUpdate) =>
  req<Usuario>(`/identity/usuarios/${usuarioId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const removerUsuario = (usuarioId: string) =>
  req<void>(`/identity/usuarios/${usuarioId}`, { method: 'DELETE' })

export const listMensagens = (turmaId: string) =>
  req<Mensagem[]>(`/comunicacao/turmas/${turmaId}/mensagens`)

export const criarMensagem = (turmaId: string, data: MensagemCreate) =>
  req<Mensagem>(`/comunicacao/turmas/${turmaId}/mensagens`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const removerMensagem = (mensagemId: string) =>
  req<void>(`/comunicacao/mensagens/${mensagemId}`, { method: 'DELETE' })

export const uploadAnexo = async (mensagemId: string, file: File): Promise<Anexo> => {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/comunicacao/mensagens/${mensagemId}/anexos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) throw new ApiError(res.status, `Erro ao enviar anexo: ${res.status}`)
  return res.json()
}

export const downloadAnexo = (mensagemId: string, anexoId: string) =>
  req<{ url: string; expires_in: number }>(
    `/comunicacao/mensagens/${mensagemId}/anexos/${anexoId}`,
  )
