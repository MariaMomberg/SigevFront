import DashboardLayout from '../components/DashboardLayout'
import {
  MapPin,
  Navigation,
  Zap,
  Heart
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Station {
  id: string
  name: string
  address: string
  distance: string
  spots: number
  availableSpots: number
  available: boolean
  latitude: number
  longitude: number
}

function MapPage() {

  const [stations, setStations] = useState<Station[]>([])
  const [favoritos, setFavoritos] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const [onlyAvailable] = useState(false)

  const [selectedStation, setSelectedStation] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const [userLocation, setUserLocation] = useState<{
  latitude: number
  longitude: number
} | null>(null)

const [locationLoading, setLocationLoading] = useState(false)

  // ==========================================
  // CARREGAR ESTAÇÕES DO SUPABASE
  // ==========================================

  async function carregarEstacoes() {

    try {

      setLoading(true)
      setErro('')

      const { data, error } = await supabase
        .from('estacoes_recarga')
        .select(`
          id,
          nome,
          status,
          enderecos (
            rua,
            numero,
            cidade,
            estado,
            latitude,
            longitude
          ),
          carregadores (
            id,
            status,
            potencia_kw,
            conectores (
              nome
            )
          )
        `)
        .eq('status', 'ATIVA')
        .order('criado_em', {
          ascending: false
        })

      if (error) {
        throw new Error(error.message)
      }

      const stationsFormatadas: Station[] =
        (data ?? []).map((station: any) => {

          const endereco = Array.isArray(
            station.enderecos
          )
            ? station.enderecos[0]
            : station.enderecos

          const carregadores =
            station.carregadores ?? []

          const carregadoresDisponiveis =
            carregadores.filter(
              (carregador: any) =>
                carregador.status === 'DISPONIVEL'
            )

          return {

            id: station.id,

            name: station.nome,

            address: endereco
              ? `${endereco.rua}, ${endereco.numero} - ${endereco.cidade}`
              : 'Endereço não informado',

            distance: '—',

           spots: carregadores.length,

availableSpots: carregadoresDisponiveis.length,

available:
  carregadoresDisponiveis.length > 0,

            latitude:
              Number(endereco?.latitude ?? 0),

            longitude:
              Number(endereco?.longitude ?? 0)

          }

        })

      setStations(stationsFormatadas)

    } catch (error) {

      console.error(
        'Erro ao carregar estações:',
        error
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar estações.'
      )

    } finally {

      setLoading(false)

    }

  }

  // ==========================================
  // CARREGAR FAVORITOS
  // ==========================================

  async function carregarFavoritos() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data, error } = await supabase
      .from('favoritos')
      .select('estacao_id')
      .eq('usuario_id', user.id)

    if (error) {

      console.error(
        'Erro ao carregar favoritos:',
        error
      )

      return
    }

    setFavoritos(
      (data ?? []).map(
        (favorito) => favorito.estacao_id
      )
    )

  }

  // ==========================================
  // FAVORITAR / DESFAVORITAR
  // ==========================================

  async function alternarFavorito(
    estacaoId: string
  ) {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {

      alert(
        'Você precisa estar logado para favoritar uma estação.'
      )

      return
    }

    const jaEhFavorito =
      favoritos.includes(estacaoId)

    if (jaEhFavorito) {

      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', user.id)
        .eq('estacao_id', estacaoId)

      if (error) {

        console.error(error)

        alert(
          'Não foi possível remover dos favoritos.'
        )

        return
      }

      setFavoritos(
        favoritos.filter(
          (id) => id !== estacaoId
        )
      )

    } else {

      const { error } = await supabase
        .from('favoritos')
        .insert({
          usuario_id: user.id,
          estacao_id: estacaoId
        })

      if (error) {

        console.error(error)

        alert(
          'Não foi possível adicionar aos favoritos.'
        )

        return
      }

      setFavoritos([
        ...favoritos,
        estacaoId
      ])

    }

  }

  // ==========================================
  // CARREGAR TUDO
  // ==========================================

  useEffect(() => {

    carregarEstacoes()
    carregarFavoritos()

  }, [])

  // ==========================================
  // PESQUISA E FILTRO
  // ==========================================

  const filteredStations =
    stations.filter((station) => {

      const textoPesquisa =
        search.toLowerCase()

      const matchesSearch =
        station.name
          .toLowerCase()
          .includes(textoPesquisa) ||

        station.address
          .toLowerCase()
          .includes(textoPesquisa)

      const matchesAvailability =
        !onlyAvailable ||
        station.available

      return (
        matchesSearch &&
        matchesAvailability
      )

    })

  // ==========================================
  // LOCALIZAÇÃO
  // ==========================================

  function handleLocation() {
  if (!navigator.geolocation) {
    alert('Seu navegador não permite acessar sua localização.')
    return
  }

  setLocationLoading(true)

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      setLocationLoading(false)
    },
    () => {
      setLocationLoading(false)
      alert('Não foi possível acessar sua localização. Verifique a permissão do navegador.')
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  )
}

  // ==========================================
  // TELA
  // ==========================================

  return (

    <DashboardLayout
      title="Mapa"
      description="Encontre estações de carregamento próximas."
    >

      <div className="map-page">

        {/* =============================== */}
        {/* BARRA DE FERRAMENTAS */}
        {/* =============================== */}

        <div className="map-toolbar">

          <div className="search-map">

            <MapPin size={18} />

            <input
              placeholder="Pesquisar endereço ou estação..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>



         
<button
  type="button"
  className="location-button"
  onClick={handleLocation}
>
  <Navigation size={18} />

  {locationLoading
    ? 'Localizando...'
    : userLocation
      ? 'Localização encontrada'
      : 'Minha localização'}

</button>


        </div>

        {/* =============================== */}
        {/* MAPA + LISTA */}
        {/* =============================== */}

        <div className="map-layout">

          {/* =============================== */}
          {/* LISTA */}
          {/* =============================== */}

          <div className="map-list">

            <div className="map-list-header">

              <strong>
                Estações cadastradas
              </strong>

              <span>
                {filteredStations.length}{' '}
                {filteredStations.length === 1
                  ? 'encontrada'
                  : 'encontradas'}
              </span>

            </div>

            {loading && (

              <div className="empty-state">
                Carregando estações...
              </div>

            )}

            {!loading && erro && (

              <div className="empty-state">
                Erro ao carregar estações:
                <br />
                {erro}
              </div>

            )}

            {!loading &&
              !erro &&
              filteredStations.length === 0 && (

                <div className="empty-state">
                  Nenhuma estação encontrada.
                </div>

              )}

            {!loading &&
              !erro &&
              filteredStations.map(
                (station) => (

                  <div
                    className={`map-station ${
                      selectedStation === station.id
                        ? 'selected'
                        : ''
                    }`}
                    key={station.id}
                    onClick={() =>
                      setSelectedStation(
                        station.id
                      )
                    }
                  >

                    <div className="map-station-icon">

                      <Zap size={19} />

                    </div>

                    <div className="map-station-content">

                      <strong>
                        {station.name}
                      </strong>

                      <span>
                        {station.address}
                      </span>

                    <small>
  {station.spots}{' '}
  {station.spots === 1 ? 'vaga para recarga' : 'vagas para recarga'}
</small>

                    </div>

                    {/* ======================= */}
                    {/* FAVORITO */}
                    {/* ======================= */}

                    <button
                      type="button"
                      className="more-button"
                      onClick={(event) => {

                        event.stopPropagation()

                        alternarFavorito(
                          station.id
                        )

                      }}
                      title={
                        favoritos.includes(
                          station.id
                        )
                          ? 'Remover dos favoritos'
                          : 'Adicionar aos favoritos'
                      }
                    >

                      <Heart
                        size={19}
                        fill={
                          favoritos.includes(
                            station.id
                          )
                            ? 'currentColor'
                            : 'none'
                        }
                      />

                    </button>

                    <span
                      className={`available-dot ${
                        station.available
                          ? ''
                          : 'unavailable'
                      }`}
                    ></span>

                  </div>

                )
              )}

          </div>

          {/* =============================== */}
          {/* MAPA */}
          {/* =============================== */}

          <div className="fake-map">

            <div className="map-grid"></div>

            <div className="map-road road-one"></div>

            <div className="map-road road-two"></div>

            <div className="map-road road-three"></div>

            {filteredStations.map(
  (station, index) => (

                <button
                  type="button"
                  key={station.id}
                  className={`map-pin pin-${
                    index + 1
                  } ${
                    selectedStation ===
                    station.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedStation(
                      station.id
                    )
                  }
                >

                  <Zap size={17} />

                </button>

              )
            )}
{userLocation && (
  <div className="current-location" title="Sua localização">
    <span></span>
  </div>
)}

          </div>

        </div>

        {/* =============================== */}
        {/* ESTAÇÃO SELECIONADA */}
        {/* =============================== */}

        {selectedStation && (

          <div className="selected-station-info">

            {(() => {

              const station =
                stations.find(
                  (item) =>
                    item.id ===
                    selectedStation
                )

              if (!station) {
                return null
              }

              return (

                <>

                  <strong>
                    {station.name}
                  </strong>

                  <span>
                    {station.address}
                  </span>

                </>

              )

            })()}

          </div>

        )}

      </div>

    </DashboardLayout>

  )
}

export default MapPage