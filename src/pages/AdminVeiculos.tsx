import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Veiculo {
  id: string
  usuario_id: string
  marca: string
  modelo: string
  ano: number
  tipo: string
  conector_id: string | null
}

export function AdminVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    async function carregarVeiculos() {
      try {
      let consulta = supabase
  .from('veiculos')
  .select('id, usuario_id, marca, modelo, ano, tipo, conector_id')

if (id) {
  consulta = consulta.eq('usuario_id', id)
}

const { data, error } = await consulta.order('marca', {
  ascending: true,
})

        if (error) throw error

        setVeiculos(data ?? [])
     } catch (error) {
  console.error('Erro ao carregar veículos:', error)

  setErro(
    error instanceof Error
      ? error.message
      : JSON.stringify(error)
  )
} {
        setCarregando(false)
      }
    }

   carregarVeiculos()
  }, [id])

  return (
    <DashboardLayout
      title="Veículos do usuário"
      description="Consulte os veículos cadastrados no SIGEV."
    >
      <div className="admin-usuarios">
        <button
          className="admin-usuarios-voltar"
          onClick={() => navigate('/admin/')}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1>Veículos cadastrados</h1>

        <div className="admin-usuarios-resumo">
          <span>Total de veículos</span>
          <strong>{veiculos.length}</strong>
        </div>

        {carregando ? (
          <p>Carregando veículos...</p>
        ) : erro ? (
          <p>{erro}</p>
        ) : (
          <div className="admin-usuarios-tabela">
            <table>
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Ano</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td>{veiculo.marca}</td>
                    <td>{veiculo.modelo}</td>
                    <td>{veiculo.ano}</td>
                    <td>{veiculo.tipo}</td>
                    
                  </tr>
                ))}

                {veiculos.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      Este usuário não possui veículos cadastrados.
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

export default AdminVeiculos