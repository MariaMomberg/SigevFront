import DashboardLayout from '../components/DashboardLayout'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Conector {
  id: string
  nome: string
}

function EditStation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [status, setStatus] = useState('ATIVA')

  const [conectores, setConectores] = useState<Conector[]>([])
  const [conectorId, setConectorId] = useState('')

  const [quantidade, setQuantidade] = useState('1')
  const [potencia, setPotencia] = useState('')

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // ==========================================
  // CARREGAR ESTAÇÃO
  // ==========================================

  async function carregarEstacao() {
    if (!id) {
      setErro('ID da estação não encontrado.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('estacoes_recarga')
        .select(`
          id,
          nome,
          status,
          endereco_id,
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
            potencia_kw,
            conector_id
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Estação não encontrada.')
      }

      const endereco = data.enderecos
      const carregadores = data.carregadores ?? []

      setNome(data.nome)
      setStatus(data.status)

      if (endereco) {

  const enderecoDados = Array.isArray(endereco)
    ? endereco[0]
    : endereco

  if (enderecoDados) {
    setRua(enderecoDados.rua ?? '')
    setNumero(enderecoDados.numero ?? '')
    setCidade(enderecoDados.cidade ?? '')
    setEstado(enderecoDados.estado ?? '')
    setLatitude(String(enderecoDados.latitude ?? ''))
    setLongitude(String(enderecoDados.longitude ?? ''))
  }

}

      setQuantidade(String(carregadores.length || 1))

      if (carregadores.length > 0) {
        setConectorId(carregadores[0].conector_id)
        setPotencia(String(carregadores[0].potencia_kw))
      }

    } catch (error) {
      console.error(error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar estação.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CARREGAR CONECTORES
  // ==========================================

  async function carregarConectores() {
    const { data, error } = await supabase
      .from('conectores')
      .select('id, nome')
      .order('nome')

    if (error) {
      console.error('Erro ao carregar conectores:', error)
      return
    }

    setConectores(data ?? [])
  }

  useEffect(() => {
    carregarEstacao()
    carregarConectores()
  }, [id])

  // ==========================================
  // SALVAR ALTERAÇÕES
  // ==========================================

  async function salvarAlteracoes(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!id) {
      setErro('ID da estação não encontrado.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      // -------------------------------
      // VALIDAÇÕES
      // -------------------------------

      const latitudeNumero = Number(latitude)
      const longitudeNumero = Number(longitude)
      const quantidadeNumero = Number(quantidade)
      const potenciaNumero = Number(potencia)

      if (
        latitudeNumero < -90 ||
        latitudeNumero > 90
      ) {
        throw new Error('Latitude inválida.')
      }

      if (
        longitudeNumero < -180 ||
        longitudeNumero > 180
      ) {
        throw new Error('Longitude inválida.')
      }

      if (quantidadeNumero < 1) {
        throw new Error(
          'A quantidade de carregadores deve ser pelo menos 1.'
        )
      }

      if (potenciaNumero <= 0) {
        throw new Error(
          'A potência deve ser maior que zero.'
        )
      }

      if (!conectorId) {
        throw new Error(
          'Selecione um tipo de conector.'
        )
      }

      // -------------------------------
      // BUSCAR ENDEREÇO
      // -------------------------------

      const { data: estacao, error: erroEstacao } =
        await supabase
          .from('estacoes_recarga')
          .select('endereco_id')
          .eq('id', id)
          .single()

      if (erroEstacao) {
        throw new Error(
          `Erro ao buscar estação: ${erroEstacao.message}`
        )
      }

      // -------------------------------
      // ATUALIZAR ENDEREÇO
      // -------------------------------

      const { error: erroEndereco } =
        await supabase
          .from('enderecos')
          .update({
            rua,
            numero,
            cidade,
            estado,
            latitude: latitudeNumero,
            longitude: longitudeNumero
          })
          .eq('id', estacao.endereco_id)

      if (erroEndereco) {
        throw new Error(
          `Erro ao atualizar endereço: ${erroEndereco.message}`
        )
      }

      // -------------------------------
      // ATUALIZAR ESTAÇÃO
      // -------------------------------

      const { error: erroAtualizacao } =
        await supabase
          .from('estacoes_recarga')
          .update({
            nome,
            status
          })
          .eq('id', id)

      if (erroAtualizacao) {
        throw new Error(
          `Erro ao atualizar estação: ${erroAtualizacao.message}`
        )
      }

      // -------------------------------
      // BUSCAR CARREGADORES ATUAIS
      // -------------------------------

      const { data: carregadoresAtuais, error: erroCarregadores } =
        await supabase
          .from('carregadores')
          .select('id')
          .eq('estacao_id', id)

      if (erroCarregadores) {
        throw new Error(
          `Erro ao buscar carregadores: ${erroCarregadores.message}`
        )
      }

      // -------------------------------
      // EXCLUIR CARREGADORES ATUAIS
      // -------------------------------

      const { error: erroExcluir } =
        await supabase
          .from('carregadores')
          .delete()
          .eq('estacao_id', id)

      if (erroExcluir) {
        throw new Error(
          `Erro ao atualizar carregadores: ${erroExcluir.message}`
        )
      }

      // -------------------------------
      // CRIAR NOVOS CARREGADORES
      // -------------------------------

      const novosCarregadores = Array.from(
        { length: quantidadeNumero },
        (_, index) => ({
          estacao_id: id,
          conector_id: conectorId,
          potencia_kw: potenciaNumero,
          identificacao: `CAR-${index + 1}`,
          status: 'DISPONIVEL'
        })
      )

      const { error: erroNovosCarregadores } =
        await supabase
          .from('carregadores')
          .insert(novosCarregadores)

      if (erroNovosCarregadores) {
        throw new Error(
          `Erro ao criar carregadores: ${erroNovosCarregadores.message}`
        )
      }

      alert('Estação atualizada com sucesso!')

      navigate('/admin')

    } catch (error) {

      console.error(
        'Erro ao salvar alterações:',
        error
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar alterações.'
      )

    } finally {
      setSalvando(false)
    }
  }

  // ==========================================
  // CARREGANDO
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout
        title="Editar estação"
        description="Carregando informações da estação..."
      >
        <div style={{ padding: '24px' }}>
          Carregando...
        </div>
      </DashboardLayout>
    )
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <DashboardLayout
      title="Editar estação"
      description="Altere as informações da estação de carregamento."
    >

      <Link
        to="/admin"
        className="back-page"
      >
        <ArrowLeft size={17} />
        Voltar para estações
      </Link>

      {erro && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px'
          }}
        >
          {erro}
        </div>
      )}

      <form
        className="station-form"
        onSubmit={salvarAlteracoes}
      >

        <label>
          Nome da estação
        </label>

        <input
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          required
        />

        <label>
          Rua
        </label>

        <input
          value={rua}
          onChange={(e) =>
            setRua(e.target.value)
          }
          required
        />

        <label>
          Número
        </label>

        <input
          value={numero}
          onChange={(e) =>
            setNumero(e.target.value)
          }
        />

        <label>
          Cidade
        </label>

        <input
          value={cidade}
          onChange={(e) =>
            setCidade(e.target.value)
          }
          required
        />

        <label>
          Estado
        </label>

        <input
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
          }
          required
        />

        <label>
          Latitude
        </label>

        <input
          type="number"
          step="any"
          value={latitude}
          onChange={(e) =>
            setLatitude(e.target.value)
          }
          required
        />

        <label>
          Longitude
        </label>

        <input
          type="number"
          step="any"
          value={longitude}
          onChange={(e) =>
            setLongitude(e.target.value)
          }
          required
        />

        <label>
          Status
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="ATIVA">
            Ativa
          </option>

          <option value="INATIVA">
            Inativa
          </option>

          <option value="MANUTENCAO">
            Manutenção
          </option>
        </select>

        <label>
          Tipo de conector
        </label>

        <select
          value={conectorId}
          onChange={(e) =>
            setConectorId(e.target.value)
          }
          required
        >
          <option value="">
            Selecione
          </option>

          {conectores.map((conector) => (
            <option
              key={conector.id}
              value={conector.id}
            >
              {conector.nome}
            </option>
          ))}
        </select>

        <label>
          Quantidade de carregadores
        </label>

        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) =>
            setQuantidade(e.target.value)
          }
          required
        />

        <label>
          Potência por carregador (kW)
        </label>

        <input
          type="number"
          step="0.01"
          min="0.01"
          value={potencia}
          onChange={(e) =>
            setPotencia(e.target.value)
          }
          required
        />

        <button
          type="submit"
          className="button-primary dashboard-button"
          disabled={salvando}
        >
          {salvando
            ? 'Salvando...'
            : 'Salvar alterações'}
        </button>

      </form>

    </DashboardLayout>
  )
}

export default EditStation