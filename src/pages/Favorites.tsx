import DashboardLayout from '../components/DashboardLayout'
import { Heart, MapPin, Zap, } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface FavoriteStation {
  id: string
  name: string
  address: string
  city: string
  connectors: string
  spots: number
}

function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function carregarFavoritos() {
    try {
      setLoading(true)
      setError('')

      // Pega o usuário atualmente logado
      const {
        data: { user },
        error: erroUsuario
      } = await supabase.auth.getUser()

      if (erroUsuario) {
        throw new Error(erroUsuario.message)
      }

      if (!user) {
        setFavorites([])
        return
      }

      // Busca SOMENTE os favoritos desse usuário
      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          estacao_id,
          estacoes_recarga (
            id,
            nome,
            enderecos (
              rua,
              numero,
              cidade,
              estado
            ),
            carregadores (
              id,
              conectores (
                nome
              )
            )
          )
        `)
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      const favoritosFormatados: FavoriteStation[] = (data ?? [])
        .map((item: any) => {
          const estacao = item.estacoes_recarga

          if (!estacao) {
            return null
          }

          const endereco = Array.isArray(estacao.enderecos)
            ? estacao.enderecos[0]
            : estacao.enderecos

          const carregadores = estacao.carregadores ?? []

          const nomesConectores = [
            ...new Set(
              carregadores
                .map((carregador: any) => carregador.conectores?.nome)
                .filter(Boolean)
            )
          ]

          return {
            id: estacao.id,
            name: estacao.nome,
            address: endereco
              ? `${endereco.rua}, ${endereco.numero}`
              : 'Endereço não informado',
            city: endereco?.cidade ?? '',
            connectors:
              nomesConectores.length > 0
                ? nomesConectores.join(' · ')
                : 'Nenhum conector',
            spots: carregadores.length
          }
        })
        .filter(Boolean) as FavoriteStation[]

      setFavorites(favoritosFormatados)

    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar favoritos.'
      )
    } finally {
      setLoading(false)
    }
  }

 async function removerFavorito(id: string) {
  const confirmar = window.confirm(
    'Tem certeza que deseja remover esta estação dos favoritos?'
  )

  if (!confirmar) {
    return
  }

  try {
    const {
      data: { user },
      error: erroUsuario
    } = await supabase.auth.getUser()

    if (erroUsuario) {
      throw erroUsuario
    }

    if (!user) {
      alert('Você precisa estar logado.')
      return
    }

    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('usuario_id', user.id)
      .eq('estacao_id', id)

    if (error) {
      throw error
    }

    setFavorites((favoritosAtuais) =>
      favoritosAtuais.filter(
        (favorito) => favorito.id !== id
      )
    )

    alert('Estação removida dos favoritos com sucesso!')

  } catch (error) {
    console.error('Erro ao remover favorito:', error)

    alert(
      error instanceof Error
        ? error.message
        : 'Não foi possível remover a estação dos favoritos.'
    )
  }
}
  useEffect(() => {
    carregarFavoritos()
  }, [])

  return (
    <DashboardLayout
      title="Favoritos"
      description="Suas estações de carregamento favoritas."
    >

      {loading && (
        <div style={{ padding: '24px' }}>
          Carregando favoritos...
        </div>
      )}

      {error && (
        <div style={{ padding: '24px' }}>
          <strong>Erro ao carregar favoritos:</strong>
          <br />
          {error}
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center'
          }}
        >
          <Heart size={40} />

          <h2>Você ainda não possui favoritos</h2>

          <p>
            As estações que você favoritar aparecerão aqui.
          </p>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="favorite-grid">

          {favorites.map((station) => (

            <div
              className="favorite-card"
              key={station.id}
            >

              <div className="favorite-top">

                <div className="favorite-icon">
                  <Zap size={21} />
                </div>

                <button
                  type="button"
                  className="favorite-heart"
                  onClick={() => removerFavorito(station.id)}
                  title="Remover dos favoritos"
                >
                  <Heart
                    size={19}
                    fill="currentColor"
                  />
                </button>

              </div>

              <h2>{station.name}</h2>

              <p>
                <MapPin size={15} />
                {station.address}
              </p>

              <p>
                <MapPin size={15} />
                {station.city}
              </p>

              <div className="favorite-meta">

                <span>
                  <Zap size={15} />
                  {station.connectors}
                </span>

                <span className="green-text">
                  {station.spots}{' '}
                  {station.spots === 1
                    ? 'vaga'
                    : 'vagas'}
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </DashboardLayout>
  )
}

export default Favorites