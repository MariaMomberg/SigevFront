import DashboardLayout from '../components/DashboardLayout'
import { User, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Estacao {
  id: string
  nome: string
}

interface Avaliacao {
  id: string
  usuario_id: string
  estacao_id: string
  nota: number
  comentario: string
  criado_em: string
  nome_usuario: string
  nome_estacao: string
}

function Reviews() {
  const navigate = useNavigate()

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [estacoes, setEstacoes] = useState<Estacao[]>([])
  const [usuarioId, setUsuarioId] = useState('')

  const [estacaoId, setEstacaoId] = useState('')
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')

  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregarDados() {
    try {
      setLoading(true)
      setErro('')

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }
      setUsuarioId(user.id)

      // Buscar estações
      const { data: estacoesData, error: erroEstacoes } =
        await supabase
          .from('estacoes_recarga')
          .select('id, nome')
          .eq('status', 'ATIVA')
          .order('nome')

      if (erroEstacoes) {
        throw new Error(
          `Erro ao carregar estações: ${erroEstacoes.message}`
        )
      }

      setEstacoes(estacoesData ?? [])

      // Buscar avaliações
      const { data: avaliacoesData, error: erroAvaliacoes } =
        await supabase
          .from('avaliacoes')
          .select(`
            id,
            usuario_id,
            estacao_id,
            nota,
            comentario,
            criado_em,
            estacoes_recarga (
              nome
            ),
            usuarios (
              nome
            )
          `)
          .order('criado_em', { ascending: false })

      if (erroAvaliacoes) {
        throw new Error(
          `Erro ao carregar avaliações: ${erroAvaliacoes.message}`
        )
      }

      const avaliacoesFormatadas: Avaliacao[] =
        (avaliacoesData ?? []).map((avaliacao: any) => ({
          id: avaliacao.id,
          usuario_id: avaliacao.usuario_id,
          estacao_id: avaliacao.estacao_id,
          nota: avaliacao.nota,
          comentario: avaliacao.comentario,
          criado_em: avaliacao.criado_em,
          nome_usuario:
            avaliacao.usuarios?.nome ?? 'Usuário',
          nome_estacao:
            avaliacao.estacoes_recarga?.nome ??
            'Estação não encontrada'
        }))

      setAvaliacoes(avaliacoesFormatadas)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar avaliações.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function enviarAvaliacao(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setErro('')
    setSucesso('')

    if (!estacaoId) {
      setErro('Selecione uma estação.')
      return
    }

    if (!comentario.trim()) {
      setErro('Escreva um comentário sobre a estação.')
      return
    }

    try {
      setEnviando(true)

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
  .from('avaliacoes')
  .insert({
    usuario_id: user.id,
    estacao_id: estacaoId,
    nota: nota,
    comentario: comentario.trim()
  })
  .select()

console.log('USUÁRIO LOGADO:', user.id)
console.log('ESTAÇÃO:', estacaoId)
console.log('DADOS ENVIADOS:', {
  usuario_id: user.id,
  estacao_id: estacaoId,
  nota: nota,
  comentario: comentario.trim()
})
console.log('RESULTADO:', data)
console.log('ERRO:', error)

if (error) {
  throw new Error(
    `Erro ao cadastrar avaliação: ${error.message}`
  )
}

      setSucesso('Avaliação enviada com sucesso!')

      setEstacaoId('')
      setNota(5)
      setComentario('')

      await carregarDados()
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)

      if (
        error instanceof Error &&
        error.message.includes('duplicate')
      ) {
        setErro(
          'Você já avaliou esta estação.'
        )
      } else {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar a avaliação.'
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  async function excluirAvaliacao(avaliacao: Avaliacao) {
  const confirmar = window.confirm(
    `Deseja excluir sua avaliação da estação "${avaliacao.nome_estacao}"?`
  )

  if (!confirmar) {
    return
  }

  setErro('')
  setSucesso('')

  try {
    const {
      data: { user },
      error: erroUsuario
    } = await supabase.auth.getUser()

    if (erroUsuario) {
      throw erroUsuario
    }

    if (!user) {
      navigate('/login')
      return
    }

    if (avaliacao.usuario_id !== user.id) {
      setErro('Você só pode excluir suas próprias avaliações.')
      return
    }

    const { error } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', avaliacao.id)
      .eq('usuario_id', user.id)

    if (error) {
      throw error
    }

    setSucesso('Avaliação excluída com sucesso!')

    await carregarDados()
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error)

    setErro(
      error instanceof Error
        ? `Não foi possível excluir a avaliação: ${error.message}`
        : 'Não foi possível excluir a avaliação.'
    )
  }
}

  function formatarData(data: string) {
    const dataFormatada = new Date(data)

    return dataFormatada.toLocaleDateString('pt-BR')
  }

  const media =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce(
            (total, avaliacao) =>
              total + Number(avaliacao.nota),
            0
          ) / avaliacoes.length
        ).toFixed(1)
      : '0.0'

  return (
    <DashboardLayout
      title="Avaliações"
      description="Avalie as estações e veja a experiência de outros usuários."
    >

      {/* FORMULÁRIO DE AVALIAÇÃO */}

      <div className="review-form-card">

        <h2>Escreva uma avaliação</h2>

        <p>
          Conte como foi sua experiência em uma estação de recarga.
        </p>

        <form onSubmit={enviarAvaliacao}>

          <label>
            Estação
          </label>

          <select
            value={estacaoId}
            onChange={(event) =>
              setEstacaoId(event.target.value)
            }
            required
          >
            <option value="">
              Selecione a estação
            </option>

            {estacoes.map((estacao) => (
              <option
                key={estacao.id}
                value={estacao.id}
              >
                {estacao.nome}
              </option>
            ))}
          </select>

          <label>
            Nota
          </label>

          <div className="review-rating-input">

            {[1, 2, 3, 4, 5].map((numero) => (
              <button
                key={numero}
                type="button"
                onClick={() => setNota(numero)}
                className={
                  numero <= nota
                    ? 'star-button selected'
                    : 'star-button'
                }
              >
                <Star
                  size={25}
                  fill={
                    numero <= nota
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            ))}

          </div>

          <label>
            Comentário
          </label>

          <textarea
            value={comentario}
            onChange={(event) =>
              setComentario(event.target.value)
            }
            placeholder="Conte como foi sua experiência..."
            rows={5}
            required
          />

          {erro && (
            <div
              style={{
                padding: '12px',
                marginTop: '12px',
                marginBottom: '12px',
                borderRadius: '8px'
              }}
            >
              {erro}
            </div>
          )}

          {sucesso && (
            <div
              style={{
                padding: '12px',
                marginTop: '12px',
                marginBottom: '12px',
                borderRadius: '8px'
              }}
            >
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="button-primary dashboard-button"
            disabled={enviando}
          >
            {enviando
              ? 'Enviando...'
              : 'Enviar avaliação'}
          </button>

        </form>

      </div>

      {/* RESUMO */}

      <div className="reviews-overview">

        <div className="rating-big">

          <strong>{media}</strong>

          <div className="stars">
            ★★★★★
          </div>

          <span>
            Média geral
          </span>

          <small>
            {avaliacoes.length}{' '}
            {avaliacoes.length === 1
              ? 'avaliação'
              : 'avaliações'}
          </small>

        </div>

        <div className="rating-bars">

          {[5, 4, 3, 2, 1].map((numero) => {

            const quantidade =
              avaliacoes.filter(
                (avaliacao) =>
                  Number(avaliacao.nota) === numero
              ).length

            const porcentagem =
              avaliacoes.length > 0
                ? (quantidade / avaliacoes.length) * 100
                : 0

            return (
              <div
                className="rating-bar"
                key={numero}
              >

                <span>
                  {numero}
                </span>

                <div>
                  <i
                    style={{
                      width: `${porcentagem}%`
                    }}
                  />
                </div>

              </div>
            )
          })}

        </div>

      </div>

      {/* LISTA DE AVALIAÇÕES */}

      <div className="review-list">

        {loading && (
          <div style={{ padding: '24px' }}>
            Carregando avaliações...
          </div>
        )}

        {!loading &&
          avaliacoes.length === 0 && (
            <div style={{ padding: '24px' }}>
              Ainda não existem avaliações.
            </div>
          )}

        {!loading &&
          avaliacoes.map((avaliacao) => (

            <div
              className="review-card"
              key={avaliacao.id}
            >

<div className="review-card-top">

              <div className="review-user">

                <div className="review-avatar">
                  <User size={18} />
                </div>

                <div>

                  <strong>
                    {avaliacao.nome_usuario}
                  </strong>

                  <span>
                    {formatarData(
                      avaliacao.criado_em
                    )}
                  </span>

                </div>

              </div>

              {avaliacao.usuario_id === usuarioId && (
  <button
    type="button"
    className="review-delete-button"
    onClick={() => excluirAvaliacao(avaliacao)}
  >
    <Trash2 size={16} />
    Excluir
  </button>
)}
</div>

              <div className="review-stars">

                {'★'.repeat(
                  Number(avaliacao.nota)
                )}

                {'☆'.repeat(
                  5 - Number(avaliacao.nota)
                )}

              </div>

              <h3>
                {avaliacao.nome_estacao}
              </h3>

              <p>
                {avaliacao.comentario}
              </p>

            </div>

            

          ))}

      </div>

    </DashboardLayout>
  )
}

export default Reviews