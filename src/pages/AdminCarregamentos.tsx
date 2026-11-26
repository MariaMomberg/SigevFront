
import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Search, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'


interface Carregamento {
  id: string
  usuario_id: string
  inicio: string
  fim: string | null
  estacao_id: string
  energia_consumida_kwh: number | null
  usuarios: {
    nome: string
    email: string
  } | null
  estacoes_recarga: {
    nome: string
  } | null
}


export function AdminCarregamentos() {
  const [carregamentos, setCarregamentos] = useState<Carregamento[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    async function carregarCarregamentos() {
      try {
        

let consulta = supabase
  .from('historico_recargas')
  .select(`
    id,
    usuario_id,
    inicio,
    fim,
    estacao_id,
    energia_consumida_kwh,
    usuarios (
      nome,
      email
    ),
    estacoes_recarga (
      nome
    )
  `)

if (id) {
  consulta = consulta.eq('usuario_id', id)
}

const { data, error } = await consulta.order('inicio', {
  ascending: false,
})




        console.log('Dados dos carregamentos:', data)
console.log('Erro do Supabase:', error)

if (error) throw error

setCarregamentos((data ?? []) as unknown as Carregamento[])
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
        setErro('Não foi possível carregar os carregamentos.')
      } finally {
        setCarregando(false)
      }
    }

   carregarCarregamentos()
}, [id])

  function formatarData(dataTexto: string) {
    return new Date(dataTexto).toLocaleDateString('pt-BR')
  }

  function formatarHorario(dataTexto: string) {
    return new Date(dataTexto).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function calcularDuracao(inicio: string, fim: string | null) {
    if (!fim) return 'Em andamento'

    const minutos = Math.max(
      0,
      Math.floor(
        (new Date(fim).getTime() - new Date(inicio).getTime()) / 60000
      )
    )

    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    if (horas === 0) return `${minutosRestantes} min`

    return `${horas} h ${minutosRestantes} min`
  }

  const carregamentosFiltrados = carregamentos.filter((item) =>
    (item.estacoes_recarga?.nome ?? 'Estação não identificada')
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <DashboardLayout
      title="Histórico de carregamentos"
      description="Consulte os carregamentos registrados no SIGEV."
    >
      <div className="admin-usuarios">
        <button
          className="admin-usuarios-voltar"
          onClick={() => navigate('/admin/')}
          title="Voltar"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1>Carregamentos registrados</h1>

        <p>Consulte o histórico de carregamentos deste usuário.</p>

        <div className="admin-usuarios-resumo">
          <span>Total de carregamentos</span>
          <strong>{carregamentos.length}</strong>
        </div>

        <div className="admin-usuarios-busca">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por estação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando ? (
          <p>Carregando carregamentos...</p>
        ) : erro ? (
          <p>{erro}</p>
        ) : (
          <div className="admin-usuarios-tabela">
            <table>
              <thead>
  <tr>
    <th>Usuário</th>
    <th>E-mail</th>
    <th>Data</th>
    <th>Estação</th>
    <th>Horário</th>
    <th>Duração</th>
  </tr>
</thead>

              <tbody>
                {carregamentosFiltrados.map((item) => (
                  <tr key={item.id}>
                   
<td>{item.usuarios?.nome ?? 'Usuário não identificado'}</td>
<td>{item.usuarios?.email ?? 'E-mail não informado'}</td>
<td>{formatarData(item.inicio)}</td>
<td>
  {item.estacoes_recarga?.nome ?? 'Estação não identificada'}
</td>
<td>
  {formatarHorario(item.inicio)} –{' '}
  {item.fim ? formatarHorario(item.fim) : 'Em andamento'}
</td>
<td>{calcularDuracao(item.inicio, item.fim)}</td>

                  </tr>
                ))}

                {carregamentosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      Nenhum carregamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminCarregamentos
