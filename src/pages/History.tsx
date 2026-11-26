import { useEffect, useState, type FormEvent } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  Zap,
  Calendar,
  BatteryCharging
} from 'lucide-react'
import { obterUsuarioAtual } from '../services/authService'
import { listarVeiculos } from '../services/vehiclesService'
import { listarEstacoes } from '../services/stationService'
import {
  cadastrarCarregamento,
  listarHistorico
} from '../services/historicoService'



function History() {

  const [usuarioId, setUsuarioId] = useState('')
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [estacoes, setEstacoes] = useState<any[]>([])
  const [carregandoDados, setCarregandoDados] = useState(true)
  const [historico, setHistorico] = useState<any[]>([])
  const hoje = new Date()
const dataMaxima = new Date(hoje)
dataMaxima.setDate(hoje.getDate() + 1)

const dataMinima = new Date(hoje)
dataMinima.setDate(hoje.getDate() - 7)

const formatarDataInput = (data: Date) => {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}T${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
}

  async function atualizarHistorico() {
  if (!usuarioId) return

  try {
    const listaHistorico = await listarHistorico(usuarioId)
    setHistorico(listaHistorico)
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error)
  }
}

    useEffect(() => {
    async function carregarDados() {
      try {
        setCarregandoDados(true)

        const usuario = await obterUsuarioAtual()

        
        if (!usuario) {
          return
        }

        setUsuarioId(usuario.id)

      const [listaVeiculos, listaEstacoes, listaHistorico] = await Promise.all([
  listarVeiculos(usuario.id),
  listarEstacoes(),
  listarHistorico(usuario.id)
])

setVeiculos(listaVeiculos)
setEstacoes(listaEstacoes)
setHistorico(listaHistorico)

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregandoDados(false)
      }
    }

    carregarDados()
  }, [])

    const energiaTotal = historico.reduce(
    (total, item) => total + Number(item.energia_consumida_kwh || 0),
    0
  )

  const totalCarregamentos = historico.length

  const agora = new Date()

  const carregamentosEsteMes = historico.filter((item) => {
    const data = new Date(item.inicio)

    return (
      data.getMonth() === agora.getMonth() &&
      data.getFullYear() === agora.getFullYear()
    )
  }).length

    async function registrarCarregamento(
  evento: FormEvent<HTMLFormElement>
) {
  evento.preventDefault()

  const formulario = evento.currentTarget
  const dados = new FormData(formulario)

  try {
    if (!usuarioId) {
      alert('Faça login para registrar um carregamento.')
      return
    }

    const inicio = String(dados.get('inicio') || '')
    const fim = String(dados.get('fim') || '')
    const veiculoId = String(dados.get('veiculo_id') || '')
    const estacaoId = String(dados.get('estacao_id') || '')
    const energia = Number(
      String(dados.get('energia_consumida_kwh') || '').replace(',', '.')
    )

    if (!inicio || !fim || !veiculoId || !estacaoId || energia <= 0) {
      alert('Preencha todos os campos corretamente.')
      return
    }

    if (new Date(fim) <= new Date(inicio)) {
      alert('O horário de término deve ser posterior ao início.')
      return
    }

    const agora = new Date()
const limiteMinimo = new Date()
limiteMinimo.setDate(agora.getDate() - 7)

const limiteMaximo = new Date()
limiteMaximo.setDate(agora.getDate() + 1)

if (
  new Date(inicio) < limiteMinimo ||
  new Date(inicio) > limiteMaximo ||
  new Date(fim) < limiteMinimo ||
  new Date(fim) > limiteMaximo
) {
  alert('As datas devem estar dentro do limite permitido: últimos 7 dias até amanhã.')
  return
}

    await cadastrarCarregamento({
      usuario_id: usuarioId,
      veiculo_id: veiculoId,
      estacao_id: estacaoId,
      inicio: new Date(inicio).toISOString(),
      fim: new Date(fim).toISOString(),
      energia_consumida_kwh: energia
    })

    await atualizarHistorico()

    alert('Carregamento registrado com sucesso!')
    formulario.reset()

  } catch (erro) {
    console.error('Erro ao registrar carregamento:', erro)

    alert(
      erro instanceof Error
        ? erro.message
        : 'Não foi possível registrar o carregamento.'
    )
  }
}

  return (
    <DashboardLayout
      title="Histórico"
      description="Acompanhe seus carregamentos anteriores."
    >

            <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="table-header">
          <h2>Registrar carregamento</h2>
        </div>

     <form
  className="form-carregamento"
  onSubmit={registrarCarregamento}
>
          <label>Estação de recarga</label>
          <select name="estacao_id" required>
            <option value="">Selecione uma estação</option>
            {estacoes.map((estacao) => (
              <option key={estacao.id} value={estacao.id}>
                {estacao.nome}
              </option>
            ))}
          </select>

          <label>Veículo</label>
          <select name="veiculo_id" required>
            <option value="">Selecione um veículo</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.marca} {veiculo.modelo}
              </option>
            ))}
          </select>

          <label>Início do carregamento</label>
          <input
  type="datetime-local"
  name="inicio"
  min={formatarDataInput(dataMinima)}
  max={formatarDataInput(dataMaxima)}
  required
/>

          <label>Fim do carregamento</label>
          <input
  type="datetime-local"
  name="fim"
  min={formatarDataInput(dataMinima)}
  max={formatarDataInput(dataMaxima)}
  required
/>

          <label>Energia consumida (kWh)</label>
          <input
            type="number"
            name="energia_consumida_kwh"
            min="0.1"
            step="0.1"
            placeholder="Ex.: 32,5"
            required
          />

          <button type="submit">Registrar carregamento</button>
        </form>
      </div>

      <div className="history-summary">

        <div>
          <BatteryCharging size={20} />
          <span>Energia total</span>
          <strong>
  {energiaTotal.toLocaleString('pt-BR', {
    maximumFractionDigits: 2
  })} kWh
</strong>
        </div>

        <div>
          <Zap size={20} />
          <span>Carregamentos</span>
         <strong>{totalCarregamentos}</strong>
        </div>

        <div>
          <Calendar size={20} />
          <span>Este mês</span>
          <strong>{carregamentosEsteMes}</strong>
        </div>

      </div>

      <div className="table-card">

        <div className="table-header">
          <h2>Carregamentos recentes</h2>
        </div>

        <div className="history-table">

          <div className="history-row history-head">
            <span>Estação</span>
            <span>Data</span>
            <span>Energia</span>
            <span>Duração</span>
            <span>Status</span>
          </div>

        {historico.map((item) => {
  const inicio = new Date(item.inicio)
  const fim = item.fim ? new Date(item.fim) : null

  const duracao = fim
    ? Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000))
    : null

  const horas = duracao !== null
    ? `${Math.floor(duracao / 60)}h ${duracao % 60}min`
    : 'Em andamento'

  const energia = item.energia_consumida_kwh

  const estacao = Array.isArray(item.estacoes_recarga)
    ? item.estacoes_recarga[0]
    : item.estacoes_recarga

    const veiculo = Array.isArray(item.veiculos)
  ? item.veiculos[0]
  : item.veiculos

  return (
    <div className="history-row" key={item.id}>
     <div className="history-station">
  <div>
    <Zap size={16} />
  </div>

  <span>
    {estacao?.nome || 'Estação não identificada'}
  </span>

  {veiculo && (
    <span>
      • {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
    </span>
  )}
</div>



      <span>{inicio.toLocaleDateString('pt-BR')}</span>

      <span>
        {energia != null
          ? `${Number(energia).toLocaleString('pt-BR')} kWh`
          : 'Não informado'}
      </span>

      <span>{horas}</span>

      <span className="history-status">
        {fim ? 'Concluído' : 'Em andamento'}
      </span>
    </div>
  )
})}

        </div>

      </div>

    </DashboardLayout>
  )
}



export default History