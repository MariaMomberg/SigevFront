import DashboardLayout from '../components/DashboardLayout'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Zap,
  Car,
  ArrowRight,
  BatteryCharging
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [nomeUsuario, setNomeUsuario] = useState('')
    const [totalCarregamentos, setTotalCarregamentos] =
    useState<number | null>(null)

    const [
  carregamentosUltimos30Dias,
  setCarregamentosUltimos30Dias
] = useState<number | null>(null)


useEffect(() => {
  let ativo = true

  async function carregarNomeUsuario() {
    try {
      const {
        data: { user },
        error: erroUsuario
      } = await supabase.auth.getUser()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (!user) return

      const { data, error } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      if (ativo && data?.nome) {
        setNomeUsuario(data.nome.split(' ')[0])
      }

    } catch (error) {
      console.error('Erro ao carregar nome do usuário:', error)
    }
  }

  carregarNomeUsuario()

  return () => {
    ativo = false
  }
}, [])

  useEffect(() => {
    let ativo = true

    async function carregarHistorico() {
      try {
        // Identifica quem está logado
        const {
          data: { user },
          error: erroUsuario
        } = await supabase.auth.getUser()

        if (erroUsuario) {
          throw erroUsuario
        }

        if (!user) {
          if (ativo) {
            setTotalCarregamentos(0)
          }
          return
        }

        // Conta somente os carregamentos desse usuário
        const { count, error } = await supabase
          .from('historico_recargas')
          .select('id', {
            count: 'exact',
            head: true
          })
          .eq('usuario_id', user.id)

        if (error) {
          throw error
        }

        if (ativo) {
          setTotalCarregamentos(count ?? 0)
        }
      } catch (error) {
        console.error(
          'Erro ao carregar histórico:',
          error
        )

        if (ativo) {
          setTotalCarregamentos(null)
        }
      }
    }

    carregarHistorico()

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
  let ativo = true

  async function carregarCarregamentosGerais() {
    try {
      const {
        data,
        error
      } = await supabase.rpc(
        'contar_carregamentos_ultimos_30_dias'
      )

      if (error) {
        throw error
      }

      if (ativo) {
        setCarregamentosUltimos30Dias(
          Number(data ?? 0)
        )
      }
    } catch (error) {
      console.error(
        'Erro ao buscar carregamentos gerais:',
        error
      )

      if (ativo) {
        setCarregamentosUltimos30Dias(null)
      }
    }
  }

  carregarCarregamentosGerais()

  return () => {
    ativo = false
  }
}, [])

const [energiaUltimos30Dias, setEnergiaUltimos30Dias] =
  useState<number | null>(null)

  useEffect(() => {
  let ativo = true

  async function carregarEnergia() {
    try {
      const {
        data: { user },
        error: erroUsuario
      } = await supabase.auth.getUser()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (!user) {
        if (ativo) {
          setEnergiaUltimos30Dias(0)
        }
        return
      }

      // Define o início do período de 30 dias
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 30)

      // Busca os consumos do usuário nesse período
      const { data, error } = await supabase
        .from('historico_recargas')
        .select('energia_consumida_kwh')
        .eq('usuario_id', user.id)
        .gte('inicio', dataLimite.toISOString())

      if (error) {
        throw error
      }

      // Soma a energia de todos os registros encontrados
      const total = (data ?? []).reduce(
        (soma, registro) =>
          soma + Number(registro.energia_consumida_kwh ?? 0),
        0
      )

      if (ativo) {
        setEnergiaUltimos30Dias(total)
      }
    } catch (error) {
      console.error('Erro ao carregar energia:', error)

      if (ativo) {
        setEnergiaUltimos30Dias(null)
      }
    }
  }

  carregarEnergia()

  return () => {
    ativo = false
  }
}, [])
const [totalVeiculos, setTotalVeiculos] =
  useState<number | null>(null)

const [nomeVeiculo, setNomeVeiculo] = useState('')

useEffect(() => {
  let ativo = true

  async function carregarVeiculos() {
    try {
      const {
        data: { user },
        error: erroUsuario
      } = await supabase.auth.getUser()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (!user) {
        if (ativo) {
          setTotalVeiculos(0)
          setNomeVeiculo('')
        }
        return
      }

      const { data, error } = await supabase
        .from('veiculos')
        .select('id, marca, modelo')
        .eq('usuario_id', user.id)

      if (error) {
        throw error
      }

      if (ativo) {
        setTotalVeiculos(data?.length ?? 0)

        setNomeVeiculo(
          data && data.length > 0
            ? `${data[0].marca} ${data[0].modelo}`
            : ''
        )
      }
    } catch (error) {
      console.error(
        'Erro ao carregar veículos:',
        error
      )

      if (ativo) {
        setTotalVeiculos(null)
        setNomeVeiculo('')
      }
    }
  }

  carregarVeiculos()

  return () => {
    ativo = false
  }
}, [])

  return (
    <DashboardLayout
  title={nomeUsuario ? `Olá ${nomeUsuario}, seja bem-vindo(a)!` : 'Olá, seja bem-vindo(a)!'}
  description="Aqui está um resumo da sua atividade no SIGEV."
>

      <div className="stats-grid">

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon green">
            <Zap size={21} />
          </div>

        <span>Carregamentos</span>

<strong>
  {totalCarregamentos === null
    ? '—'
    : totalCarregamentos.toLocaleString('pt-BR')}
</strong>

<small>
  {totalCarregamentos === null
    ? 'Não foi possível carregar'
    : totalCarregamentos === 0
      ? 'Nenhum carregamento ainda'
      : 'carregamentos registrados'}
</small>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon blue">
            <Car size={21} />
          </div>

          <span>Meus veículos</span>

<strong>
  {totalVeiculos === null
    ? '—'
    : totalVeiculos}
</strong>

<small>
  {totalVeiculos === null
    ? 'Não foi possível carregar'
    : totalVeiculos === 0
      ? 'Nenhum veículo cadastrado'
      : nomeVeiculo || 'Veículo cadastrado'}
</small>
        </div>

        <div className="dashboard-stat">
  <div className="dashboard-stat-icon yellow">
    <Zap size={21} />
  </div>

  <span>Carregamentos gerais</span>

  <strong>
    {carregamentosUltimos30Dias === null
      ? '—'
      : carregamentosUltimos30Dias.toLocaleString('pt-BR')}
  </strong>

  <small>
    nos últimos 30 dias
  </small>
</div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon purple">
            <BatteryCharging size={21} />
          </div>

    <span>Energia utilizada</span>

<strong>
  {energiaUltimos30Dias === null
    ? '—'
    : `${energiaUltimos30Dias.toLocaleString('pt-BR', {
        maximumFractionDigits: 2
      })} kWh`}
</strong>

<small>
  nos últimos 30 dias
</small>
        </div>

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Acesso rápido</h2>
              <p>Encontre o que precisa.</p>
            </div>
          </div>

          <div className="quick-actions">

            <Link to="/mapa">
              <MapPin size={22} />
              <strong>Encontrar carregador</strong>
              <span>Veja estações próximas</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/veiculos">
              <Car size={22} />
              <strong>Meus veículos</strong>
              <span>Gerencie seus veículos</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/historico">
              <Zap size={22} />
              <strong>Histórico</strong>
              <span>Veja seus carregamentos</span>
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>Estações próximas</h2>
              <p>Carregadores perto de você.</p>
            </div>

            <Link to="/mapa">
              Ver mapa
            </Link>

          </div>

          <div className="station-list">

            <div className="dashboard-station">
              <div className="station-small-icon">
                <Zap size={18} />
              </div>

              <div>
                <strong>EcoCharge Paulista</strong>
                <span>0,4 km · 4 vagas</span>
              </div>

              <div className="station-status">
                Disponível
              </div>
            </div>

            <div className="dashboard-station">
              <div className="station-small-icon">
                <Zap size={18} />
              </div>

              <div>
                <strong>Shell Recharge</strong>
                <span>1,2 km · 2 vagas</span>
              </div>

              <div className="station-status">
                Disponível
              </div>
            </div>

            <div className="dashboard-station">
              <div className="station-small-icon">
                <Zap size={18} />
              </div>

              <div>
                <strong>Voltz Station</strong>
                <span>2,1 km · 1 vaga</span>
              </div>

              <div className="station-status warning">
                Poucas vagas
              </div>
            </div>

          </div>

        </section>

      </div>

    </DashboardLayout>
  )
}

export default Dashboard