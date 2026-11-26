import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Search, ArrowLeft, History } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string | null
  tipo: string
  created_at: string
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarUsuarios() {
      const { data, error } = await supabase
  .from('usuarios')
  .select('*')

      if (error) {
        console.error('Erro ao carregar usuários:', error)
        setErro('Não foi possível carregar os usuários.')
      } else {
        setUsuarios(data || [])
      }

      setCarregando(false)
    }

    carregarUsuarios()
  }, [])

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nome} ${usuario.email}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <DashboardLayout
  title="Usuários cadastrados"
  description="Consulte e gerencie os usuários registrados no SIGEV."
>
      
<div className="admin-usuarios">

  <button
    className="admin-usuarios-voltar"
    onClick={() => window.history.back()}
    title="Voltar"
  >
    <ArrowLeft size={20} />
    Voltar
  </button>

  <h1>Usuários cadastrados</h1>

        <p>Consulte os usuários registrados no SIGEV.</p>

        <div className="admin-usuarios-resumo">
          <span>Total de usuários</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div className="admin-usuarios-busca">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando ? (
          <p>Carregando usuários...</p>
        ) : erro ? (
          <p>{erro}</p>
        ) : (
          <div className="admin-usuarios-tabela">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Histórico</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefone || 'Não informado'}</td>
                    <td>
  <button
    type="button"
    className="more-button"
    onClick={() =>
      navigate(`/admin/usuarios/${usuario.id}/carregamentos`)
    }

    
  > </button>
    <button
  type="button"
  className="admin-historico-btn"
  onClick={() =>
    navigate(`/admin/usuarios/${usuario.id}/carregamentos`)
  }
>

  <History size={18} />
  Ver carregamentos
</button>

</td>
                  </tr>
                ))}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      Nenhum usuário encontrado.
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

export default AdminUsuarios
