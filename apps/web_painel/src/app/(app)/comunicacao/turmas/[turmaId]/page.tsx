'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Paperclip, Trash2, X, FileText, Image, Film } from 'lucide-react'
import { toast } from 'sonner'
import {
  listMensagens, criarMensagem, removerMensagem, uploadAnexo,
  downloadAnexo, getTurma, ApiError,
  type Mensagem, type Turma,
} from '@/lib/api'

type MensagemForm = { assunto: string; corpo: string }

export default function ComunicadosPage() {
  const { turmaId } = useParams<{ turmaId: string }>()
  const [turma, setTurma] = useState<Turma | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [arquivos, setArquivos] = useState<File[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MensagemForm>()

  useEffect(() => {
    getTurma(turmaId).then(setTurma).catch(() => {})
  }, [turmaId])

  const carregarMensagens = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listMensagens(turmaId)
      setMensagens(data)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao carregar comunicados')
    } finally {
      setLoading(false)
    }
  }, [turmaId])

  useEffect(() => { carregarMensagens() }, [carregarMensagens])

  async function onEnviar(values: MensagemForm) {
    setEnviando(true)
    try {
      const mensagem = await criarMensagem(turmaId, values)

      // Faz upload dos anexos sequencialmente
      for (const file of arquivos) {
        try {
          await uploadAnexo(mensagem.id, file)
        } catch {
          toast.warning(`Não foi possível enviar o anexo "${file.name}"`)
        }
      }

      toast.success('Comunicado enviado!')
      setModalOpen(false)
      reset()
      setArquivos([])
      carregarMensagens()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao enviar comunicado')
    } finally {
      setEnviando(false)
    }
  }

  async function onRemover(mensagemId: string) {
    if (!confirm('Remover este comunicado e seus anexos?')) return
    try {
      await removerMensagem(mensagemId)
      toast.success('Comunicado removido')
      setMensagens((prev) => prev.filter((m) => m.id !== mensagemId))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erro ao remover comunicado')
    }
  }

  async function abrirAnexo(mensagemId: string, anexoId: string, nome: string) {
    try {
      const { url } = await downloadAnexo(mensagemId, anexoId)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error(`Não foi possível abrir "${nome}"`)
    }
  }

  function adicionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const novos = Array.from(e.target.files ?? [])
    setArquivos((prev) => [...prev, ...novos])
    e.target.value = ''
  }

  function removerArquivo(idx: number) {
    setArquivos((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">
            Comunicados{turma ? ` — ${turma.nome}` : ''}
          </h1>
          <p className="text-sm text-fg-dim mt-0.5">
            Mensagens enviadas para famílias e alunos desta turma.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-cyan text-white text-sm font-semibold px-4 py-2 rounded-btn hover:bg-cyan-deep transition-colors"
        >
          <Plus size={15} />
          Novo Comunicado
        </button>
      </div>

      {/* Lista de mensagens */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-card bg-bg-alt animate-pulse" />
          ))}
        </div>
      ) : mensagens.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-fg-dim text-sm">Nenhum comunicado enviado ainda.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 text-sm text-cyan hover:underline"
          >
            Enviar o primeiro comunicado
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {mensagens.map((msg) => (
            <li
              key={msg.id}
              className="bg-card border border-border rounded-card px-5 py-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-fg truncate">{msg.assunto}</h3>
                    {msg.anexos.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-fg-faint">
                        <Paperclip size={11} />
                        {msg.anexos.length}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-fg-dim leading-relaxed line-clamp-2">{msg.corpo}</p>

                  {/* Anexos */}
                  {msg.anexos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.anexos.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => abrirAnexo(msg.id, a.id, a.nome_original)}
                          className="flex items-center gap-1 text-xs bg-bg-alt border border-border rounded-pill px-2 py-0.5 hover:border-cyan hover:text-cyan transition-colors"
                        >
                          <AnexoIcon contentType={a.content_type} />
                          <span className="max-w-[120px] truncate">{a.nome_original}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-fg-faint mt-2">
                    {format(parseISO(msg.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <button
                  onClick={() => onRemover(msg.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-fg-faint hover:text-coral transition-all shrink-0"
                  aria-label="Remover comunicado"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal novo comunicado */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Novo comunicado"
        >
          <div className="bg-card rounded-card shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-fg">Novo Comunicado</h2>
              <button
                onClick={() => { setModalOpen(false); reset(); setArquivos([]) }}
                className="p-1 text-fg-faint hover:text-fg transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEnviar)} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-fg mb-1">Assunto</label>
                <input
                  type="text"
                  placeholder="Ex: Reunião de pais — 10/06"
                  className={inputCls(!!errors.assunto)}
                  {...register('assunto', { required: 'Assunto obrigatório' })}
                />
                {errors.assunto && (
                  <p className="mt-0.5 text-xs text-coral">{errors.assunto.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-fg mb-1">Mensagem</label>
                <textarea
                  rows={4}
                  placeholder="Escreva a mensagem para as famílias…"
                  className={inputCls(!!errors.corpo) + ' resize-none'}
                  {...register('corpo', { required: 'Mensagem obrigatória' })}
                />
                {errors.corpo && (
                  <p className="mt-0.5 text-xs text-coral">{errors.corpo.message}</p>
                )}
              </div>

              {/* Anexos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-fg">
                    Anexos{' '}
                    <span className="text-fg-faint font-normal">(foto, vídeo ou PDF, máx 50 MB cada)</span>
                  </label>
                  <label className="cursor-pointer flex items-center gap-1 text-xs text-cyan hover:text-cyan-deep font-medium">
                    <Paperclip size={13} />
                    Adicionar
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      className="sr-only"
                      onChange={adicionarArquivos}
                    />
                  </label>
                </div>

                {arquivos.length > 0 && (
                  <ul className="space-y-1">
                    {arquivos.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-xs bg-bg-alt rounded-btn px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <AnexoIcon contentType={f.type} />
                          <span className="truncate">{f.name}</span>
                          <span className="text-fg-faint shrink-0">
                            ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArquivo(i)}
                          className="text-fg-faint hover:text-coral ml-2 shrink-0"
                          aria-label={`Remover ${f.name}`}
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); reset(); setArquivos([]) }}
                  className="flex-1 rounded-btn border border-border text-sm font-medium text-fg-dim hover:text-fg hover:bg-bg-alt transition-colors py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 rounded-btn bg-cyan text-white text-sm font-semibold py-2 hover:bg-cyan-deep transition-colors disabled:opacity-60"
                >
                  {enviando ? 'Enviando…' : 'Enviar comunicado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function AnexoIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) return <Image size={11} aria-hidden />
  if (contentType.startsWith('video/')) return <Film size={11} aria-hidden />
  return <FileText size={11} aria-hidden />
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-btn border px-3 py-2 text-sm text-fg bg-card',
    'placeholder:text-fg-faint',
    'focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent',
    hasError ? 'border-coral' : 'border-border',
  ].join(' ')
}
