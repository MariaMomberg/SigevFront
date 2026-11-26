import DashboardLayout from '../components/DashboardLayout'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Zap,
  Map,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { obterUsuarioAtual } from '../services/authService'

interface Station {
  id: string
  name: string
  location: string
  connectors: string
  status: string
  spots: number
}

function Admin() {
  const [stations, setStations] = useState<Station[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalUsuarios, setTotalUsuarios] = useState(0)
const [totalVeiculos, setTotalVeiculos] = useState(0)
const [totalCarregamentos, setTotalCarregamentos] = useState(0)
const [totalAvaliacoes, setTotalAvaliacoes] = useState(0)
const [verificandoAcesso, setVerificandoAcesso] = useState(true)
const [autorizado, setAutorizado] = useState(false)

const [usuariosPorMes, setUsuariosPorMes] = useState<
  { mes: string; total: number }[]
>([])

const [veiculosPorTipo, setVeiculosPorTipo] = useState({
  carros: 0,
  motos: 0,
})

const [, setAtividadePorMes] = useState<
  { mes: string; carregamentos: number; avaliacoes: number }[]
>([])

const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0)

const [carregandoRelatorio, setCarregandoRelatorio] = useState(true)

const [estacoesMaisUsadas, setEstacoesMaisUsadas] = useState<
  { id: string; nome: string; total: number }[]
>([])

  const navigate = useNavigate()
useEffect(() => {
  async function verificarAdministrador() {
    try {
      const usuario = await obterUsuarioAtual()

      if (!usuario) {
        navigate('/login', { replace: true })
        return
      }

      const { data, error } = await supabase
        .from('administradores')
        .select('id')
        .eq('id', usuario.id)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        navigate('/dashboard', { replace: true })
        return
      }

      setAutorizado(true)
    } catch (error) {
      console.error('Erro ao verificar administrador:', error)
      navigate('/dashboard', { replace: true })
    } finally {
      setVerificandoAcesso(false)
    }
  }

  verificarAdministrador()
}, [navigate])

  // ==========================================
  // CARREGAR ESTAÇÕES
  // ==========================================

  

async function carregarResumo() {
  const resultados = await Promise.all([
    supabase.from('usuarios').select('id', { count: 'exact' }),
    supabase.from('veiculos').select('*', { count: 'exact', head: true }),
    supabase.from('historico_recargas').select('*', { count: 'exact', head: true }),
    supabase.from('avaliacoes').select('*', { count: 'exact', head: true }),
  ])

  console.log('Usuários:', resultados[0])
  console.log('Veículos:', resultados[1])
  console.log('Carregamentos:', resultados[2])
  console.log('Avaliações:', resultados[3])
  console.log('Total de usuários retornados:', resultados[0].data?.length)
  console.log('Erro na consulta de usuários:', resultados[0].error)

  const [usuarios, veiculos, carregamentos, avaliacoes] = resultados

  if (usuarios.error) throw usuarios.error
  if (veiculos.error) throw veiculos.error
  if (carregamentos.error) throw carregamentos.error
  if (avaliacoes.error) throw avaliacoes.error

  setTotalUsuarios(usuarios.count ?? 0)
  console.log('Contagem recebida do Supabase:', usuarios.count)
console.log('Usuários retornados:', usuarios.data?.length)
console.log('Erro:', usuarios.error)
  setTotalVeiculos(veiculos.count ?? 0)
  setTotalCarregamentos(carregamentos.count ?? 0)
  setTotalAvaliacoes(avaliacoes.count ?? 0)
}

function obterMes(dataTexto: string | null) {
  if (!dataTexto) return null

  const data = new Date(dataTexto)

  if (Number.isNaN(data.getTime())) return null

  return `${data.getFullYear()}-${String(
    data.getMonth() + 1
  ).padStart(2, '0')}`
}


async function carregarRelatorio() {
  try {
    setCarregandoRelatorio(true)

    
const [usuarios, veiculos, carregamentos, avaliacoes, usoEstacoes] =
  await Promise.all([
    supabase
      .from('usuarios')
      .select('criado_em'),

    supabase
      .from('veiculos')
      .select('tipo'),

    supabase
      .from('historico_recargas')
      .select('criado_em'),

    supabase
      .from('avaliacoes')
      .select('criado_em, nota'),

    supabase
      .from('historico_recargas')
      .select('estacao_id, estacoes_recarga(nome)'),
  ])
      
    if (usuarios.error) throw usuarios.error
    if (veiculos.error) throw veiculos.error
    if (carregamentos.error) throw carregamentos.error
    if (avaliacoes.error) throw avaliacoes.error
    if (usoEstacoes.error) throw usoEstacoes.error

    // Usuários cadastrados por mês
    const contagemUsuarios: Record<string, number> = {}

    usuarios.data?.forEach((usuario) => {
      const data = new Date(usuario.criado_em)
      const mes = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, '0')}`

      contagemUsuarios[mes] = (contagemUsuarios[mes] ?? 0) + 1
    })

    setUsuariosPorMes(
      Object.entries(contagemUsuarios)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([mes, total]) => ({ mes, total }))
    )

    // Veículos por tipo
    setVeiculosPorTipo({
      carros:
        veiculos.data?.filter((v) => v.tipo === 'CARRO').length ?? 0,
      motos:
        veiculos.data?.filter((v) => v.tipo === 'MOTO').length ?? 0,
    })

    // Carregamentos e avaliações por mês
    const contagemAtividade: Record<
      string,
      { carregamentos: number; avaliacoes: number }
    > = {}

    carregamentos.data?.forEach((item) => {
      const mes = obterMes(item.criado_em)

if (!mes) return

      if (!contagemAtividade[mes]) {
        contagemAtividade[mes] = {
          carregamentos: 0,
          avaliacoes: 0,
        }
      }

      contagemAtividade[mes].carregamentos++
    })

    avaliacoes.data?.forEach((item) => {
      const data = new Date(item.criado_em)
      const mes = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, '0')}`

      if (!contagemAtividade[mes]) {
        contagemAtividade[mes] = {
          carregamentos: 0,
          avaliacoes: 0,
        }
      }

      contagemAtividade[mes].avaliacoes++
    })

    setAtividadePorMes(
      Object.entries(contagemAtividade)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([mes, valores]) => ({ mes, ...valores }))
    )
const contagemEstacoes: Record<
  string,
  { id: string; nome: string; total: number }
> = {}

usoEstacoes.data?.forEach((registro: any) => {
  const id = registro.estacao_id
  const nome = Array.isArray(registro.estacoes_recarga)
  ? registro.estacoes_recarga[0]?.nome
  : registro.estacoes_recarga?.nome

  if (!id || !nome) return

  if (!contagemEstacoes[id]) {
    contagemEstacoes[id] = {
      id,
      nome,
      total: 0,
    }
  }

  contagemEstacoes[id].total++
})

const rankingEstacoes = Object.values(contagemEstacoes)
  .sort((a, b) => b.total - a.total)

const maiorUso = rankingEstacoes[0]?.total ?? 0

setEstacoesMaisUsadas(
  rankingEstacoes.filter(
    (estacao) => estacao.total === maiorUso
  )
)
    // Média geral das avaliações
    
const notas = (avaliacoes.data ?? [])
  .map((item) => Number(item.nota))
  .filter((nota) => Number.isFinite(nota) && nota >= 1 && nota <= 5)

setMediaAvaliacoes(
  notas.length > 0
    ? notas.reduce((soma, nota) => soma + nota, 0) / notas.length
    : 0
)

  } catch (error) {
    console.error('Erro ao carregar relatório:', error)
  } finally {
    setCarregandoRelatorio(false)
  }
}


  async function carregarEstacoes() {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('estacoes_recarga')
        .select(`
          id,
          nome,
          status,
          enderecos (
            id,
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
            conector_id,
            conectores (
              id,
              nome
            )
          )
        `)
        .order('criado_em', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      const stationsFormatadas: Station[] = (data ?? []).map(
        (station: any) => {

          const endereco = station.enderecos

          const carregadores = station.carregadores ?? []

          const nomesConectores = [
            ...new Set(
              carregadores
                .map(
                  (carregador: any) =>
                    carregador.conectores?.nome
                )
                .filter(Boolean)
            )
          ]

          return {
            id: station.id,

            name: station.nome,

            location: endereco
              ? `${endereco.rua}, ${endereco.numero} - ${endereco.cidade}`
              : 'Endereço não informado',

            connectors:
              nomesConectores.length > 0
                ? nomesConectores.join(' · ')
                : 'Nenhum conector',

            spots: carregadores.filter(
  (carregador: any) => carregador.status === 'DISPONIVEL'
).length,

            status:
              station.status === 'ATIVA'
                ? 'Ativa'
                : station.status === 'MANUTENCAO'
                  ? 'Manutenção'
                  : 'Inativa'
          }
        }
      )

      setStations(stationsFormatadas)

    } catch (error) {

      console.error(
        'Erro ao carregar estações:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar estações.'
      )

    } finally {

      setLoading(false)

    }
  }

  // ==========================================
  // APAGAR ESTAÇÃO
  // ==========================================

  async function apagarEstacao(
    id: string,
    nome: string
  ) {

    const confirmar = window.confirm(
      `Tem certeza que deseja apagar a estação "${nome}"?`
    )

    if (!confirmar) {
      return
    }

    try {

      /*
       * Primeiro buscamos o endereço da estação.
       * Precisamos dele porque a estação possui
       * uma referência para a tabela enderecos.
       */

      const { data: estacao, error: erroBusca } =
        await supabase
          .from('estacoes_recarga')
          .select('endereco_id')
          .eq('id', id)
          .single()

      if (erroBusca) {
        throw new Error(
          `Erro ao encontrar a estação: ${erroBusca.message}`
        )
      }

      // Apaga a estação.
      // Os carregadores serão apagados automaticamente
      // por causa do ON DELETE CASCADE.
      const { error: erroEstacao } =
        await supabase
          .from('estacoes_recarga')
          .delete()
          .eq('id', id)

      if (erroEstacao) {
        throw new Error(
          `Erro ao apagar estação: ${erroEstacao.message}`
        )
      }


      if (estacao?.endereco_id) {

        const { error: erroEndereco } =
          await supabase
            .from('enderecos')
            .delete()
            .eq('id', estacao.endereco_id)

        if (erroEndereco) {
          console.error(
            'A estação foi apagada, mas o endereço não:',
            erroEndereco.message
          )
        }
      }

      alert('Estação apagada com sucesso!')

      await carregarEstacoes()

    } catch (error) {

      console.error(
        'Erro ao apagar estação:',
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao apagar estação.'
      )
    }
  }

  // ==========================================
  // EDITAR ESTAÇÃO
  // ==========================================

  function editarEstacao(id: string) {

    navigate(`/admin/editar-estacao/${id}`)

  }

  // ==========================================
  // CARREGAR AO ABRIR A PÁGINA
  // ==========================================

  
  useEffect(() => {
  carregarEstacoes()

  carregarResumo().catch((error) => {
    console.error('Erro ao carregar resumo:', error)
  })

  carregarRelatorio()
}, [])

  // ==========================================
  // PESQUISA
  // ==========================================

  const filteredStations = stations.filter(
    (station) =>
      station.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      station.location
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  // ==========================================
  // TELA
  // ==========================================

   if (verificandoAcesso) {
    return <div>Verificando acesso...</div>
  }

  if (!autorizado) {
    return null
  }
  return (

    <DashboardLayout
      title="Administração"
      description="Gerencie as estações do SIGEV."
    >
      <div className="admin-summary">

  
<Link to="/admin/usuarios" className="admin-summary-card">
  <span>Usuários cadastrados</span>
  <strong>{totalUsuarios}</strong>
  <span className="admin-summary-link">
    Ver usuários <span>→</span>
  </span>
</Link>


 <Link to="/admin/veiculos" className="admin-summary-card">
  <span>Veículos cadastrados</span>
  <strong>{totalVeiculos}</strong>
  <span className="admin-summary-link">
    Ver veículos <span>→</span>
  </span>
</Link>

  <Link to="/admin/carregamentos" className="admin-summary-card">
  <span>Carregamentos registrados</span>
  <strong>{totalCarregamentos}</strong>
  <span className="admin-summary-link">
    Ver carregamentos <span>→</span>
  </span>
</Link>

  <div className="admin-summary-card">
    <span>Avaliações realizadas</span>
    <strong>{totalAvaliacoes}</strong>
  </div>

</div>

<div className="admin-relatorio">
  <h2>Relatório de uso</h2>
  <p>Acompanhe os dados de utilização do SIGEV.</p>

  {carregandoRelatorio ? (
    <p>Carregando relatório...</p>
  ) : (
    <div className="admin-relatorio-grid">
      <div className="admin-relatorio-card">
        <h3>Veículos cadastrados</h3>
        <p>Carros: {veiculosPorTipo.carros}</p>
        <p>Motos: {veiculosPorTipo.motos}</p>
      </div>

      <div className="admin-relatorio-card">
        <h3>Média das avaliações</h3>
        <strong>{mediaAvaliacoes.toFixed(1)} / 5</strong>
      </div>

      <div className="admin-relatorio-card">
        <h3>Usuários por mês</h3>
        {usuariosPorMes.length === 0 ? (
          <p>Nenhum cadastro encontrado.</p>
        ) : (
          usuariosPorMes.map((item) => (
            <p key={item.mes}>
              {item.mes}: {item.total} usuário(s)
            </p>
          ))
        )}
      </div>

      <div className="admin-relatorio-card">
       

        <div className="admin-relatorio-card">
  <h3>Estação mais utilizada</h3>

  {estacoesMaisUsadas.length === 0 ? (
    <p>Nenhum carregamento registrado ainda.</p>
  ) : (
    estacoesMaisUsadas.map((estacao) => (
      <div key={estacao.id}>
        <strong>{estacao.nome}</strong>
        <p>
          {estacao.total}{' '}
          {estacao.total === 1
            ? 'carregamento registrado'
            : 'carregamentos registrados'}
        </p>

        <Link to="/mapa" className="button-primary dashboard-button">
  <Map size={18} />
  Ver mapa das estações
</Link>

      </div>
    ))
  )}
</div>

      </div>
    </div>
  )}
</div>

      <div className="admin-actions">

        <div className="admin-search">

          <Search size={18} />

          <input
            placeholder="Pesquisar estação..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <Link
          to="/admin/nova-estacao"
          className="button-primary dashboard-button"
        >

          <Plus size={18} />

          Nova estação

        </Link>

      </div>

      <div className="table-card">

        <div className="table-header">

          <h2>
            Estações cadastradas
          </h2>

          <span>

            {stations.length}{' '}

            {stations.length === 1
              ? 'estação'
              : 'estações'}

          </span>

        </div>

        {loading && (

          <div style={{ padding: '24px' }}>
            Carregando estações...
          </div>

        )}

        {error && (

          <div style={{ padding: '24px' }}>

            <strong>
              Erro ao carregar estações:
            </strong>

            <br />

            {error}

          </div>

        )}

        {!loading &&
          !error &&
          filteredStations.length === 0 && (

            <div style={{ padding: '24px' }}>
              Nenhuma estação encontrada.
            </div>

          )}

        {!loading &&
          !error &&
          filteredStations.length > 0 && (

            <div className="admin-table">

              <div className="admin-row admin-head">

                <span>
                  Estação
                </span>

                <span>
                  Conectores
                </span>

                <span>
                  Vagas
                </span>

                <span>
                  Disponíveis
                </span>

                <span>
                  Ações
                </span>

              </div>

              {filteredStations.map(
                (station) => (

                  <div
                    className="admin-row"
                    key={station.id}
                  >

                    <div className="admin-station">

                      <div>
                        <Zap size={17} />
                      </div>

                      <span>

                        <strong>
                          {station.name}
                        </strong>

                        <small>
                          {station.location}
                        </small>

                      </span>

                    </div>

                    <span>
                      {station.connectors}
                    </span>

                    <span>
                      {station.spots}
                    </span>

                    <span
                      className={
                        station.status === 'Ativa'
                          ? 'admin-status active'
                          : 'admin-status maintenance'
                      }
                    >
                      {station.status}
                    </span>
                 
                    {/* BOTÕES */}

                    <div className="station-actions">

                      <button
                        type="button"
                        className="more-button"
                        onClick={() =>
                          editarEstacao(
                            station.id
                          )
                        }
                      >

                        <Pencil size={16} />

                        Editar

                      </button>

                      <button
                        type="button"
                        className="more-button"
                        onClick={() =>
                          apagarEstacao(
                            station.id,
                            station.name
                          )
                        }
                      >

                        <Trash2 size={16} />

                        Apagar

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </DashboardLayout>

  )
}

export default Admin