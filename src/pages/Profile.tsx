import DashboardLayout from '../components/DashboardLayout'
import { User, Mail, Phone, Car, Pencil, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [veiculo, setVeiculo] = useState('Nenhum veículo cadastrado')
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregarPerfil() {
    try {
      setLoading(true)
      setErro('')

      const { data: { user },
        error: erroUsuario } = await supabase.auth.getUser()
      if (erroUsuario) { throw new Error(erroUsuario.message) }
      if (!user) {
        navigate('/login')
        return
      }

      setEmail(user.email ?? '')

      const { data, error } = await supabase
        .from('usuarios')
        .select('nome, telefone')
        .eq('id', user.id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setNome(data.nome ?? '')
      setTelefone(data.telefone ?? '')

      const { data: veiculoData, error: erroVeiculo } = await supabase
        .from('veiculos')
        .select('marca, modelo')
        .eq('usuario_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!erroVeiculo && veiculoData) {
        setVeiculo(`${veiculoData.marca} ${veiculoData.modelo}`)
      }
      else {
        setVeiculo('Nenhum veículo cadastrado')
      }
    }
    catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao carregar perfil.')
    }
    finally { setLoading(false) }
  }
  useEffect(() => { carregarPerfil() }, [])
  async function salvarPerfil() {
    try {
      setSalvando(true)
      setErro('')
      setSucesso('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      } if (!nome.trim()) {
        setErro('Digite seu nome completo.')
        return
      }
      if (!email.trim()) {
        setErro('Digite seu e-mail.')
        return
      }

      const { error: erroPerfil } = await supabase
        .from('usuarios')
        .update({
          nome: nome.trim(), telefone: telefone
            .trim()
        })
        .eq('id', user.id)

      if (erroPerfil) {
        throw new Error(`Erro ao atualizar perfil: ${erroPerfil.message}`)
      }

      if (email.trim() !== user.email) {
        const { error: erroEmail } = await supabase.auth.updateUser({ email: email.trim() })

        if (erroEmail) {
          throw new Error(`Erro ao atualizar e-mail: ${erroEmail.message}`)
        }
      }

      if (senha.trim()) {
        if (senha.length < 6) {
          throw new Error('A nova senha deve ter pelo menos 6 caracteres.')
        }
        const { error: erroSenha } = await supabase.auth.updateUser({ password: senha })

        if (erroSenha) {
          throw new Error(`Erro ao atualizar senha: ${erroSenha.message}`)
        }
        setSenha('')
      }
      setEditando(false)
      setSucesso('Perfil atualizado com sucesso!')
      await carregarPerfil()
    }

    catch (error) {
      console.error('Erro ao salvar perfil:', error)

      setErro(error instanceof Error ? error.message : 'Erro ao salvar perfil.')
    }
    finally { setSalvando(false) }
  }

  function cancelarEdicao() {
    setEditando(false)
    setSenha('')
    setErro('')
    setSucesso('')
    carregarPerfil()
  }

  const iniciais = nome
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase() || 'US'

  if (loading) {
    return (<DashboardLayout title="Meu perfil" description="Gerencie suas informações pessoais." >
      <div style={{ padding: '24px' }}>
        Carregando perfil...
      </div>

    </DashboardLayout>)
  }
  return (
    <DashboardLayout title="Meu perfil" description="Gerencie suas informações pessoais." >
      {erro && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px' }} >
          {erro}
        </div>)}

      {sucesso && (<div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px' }} > 
        {sucesso} 
        </div>)} 
        <div className="profile-card"> 
          <div className="profile-top">
          
       <div className="profile-avatar"> {iniciais} 
        </div> 
        
        <div> 
          <h2>{nome.trim().split(' ')[0] || 'Usuário'}</h2>
          <span>Usuário do SIGEV</span> 
          </div>
          
           {!editando ? (<button type="button" className="edit-button" onClick={() => {
        setEditando(true)
        setErro('')
        setSucesso('')
      }} > <Pencil size={17} /> Editar perfil </button>) : (<div style={{ display: 'flex', gap: '8px' }} > 
      
      <button type="button" className="edit-button" onClick={cancelarEdicao} disabled={salvando} >
         <X size={17} /> Cancelar </button>
         
         <button type="button" className="edit-button" onClick={salvarPerfil} disabled={salvando} > 
          <Save size={17} /> {salvando ? 'Salvando...' : 'Salvar'} </button> </div>)} 
          </div> 
          <div className="profile-divider"></div> 
          <div className="profile-fields"> 
            <div className="profile-field"> 
              <label> 
                <User size={16} /> Nome completo </label>
                 {editando ? 
                 (<input  className="profile-field"type="text" value={nome} onChange={(event) => setNome(event.target.value)} />) 
                 : (<div> {nome || 'Não informado'} </div>)} 
                 </div> 
                 <div className="profile-field"> <label> 
                  <Mail size={16} /> E-mail </label> 
                  {editando ? (<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />) 
                  : (<div> {email || 'Não informado'} </div>)} 
                  </div> 
                  <div className="profile-field"> 
                    <label> 
                      <Phone size={16} /> Telefone </label> {editando ? 
                      (<input type="tel" value={telefone} onChange={(event) => setTelefone(event.target.value)} />) 
                      : (<div> {telefone || 'Não informado'} </div>)} 
                      </div> {editando && (<div className="profile-field"> 
                        <label> 
                          <User size={16} /> Nova senha 
                        </label> 
                        <input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} 
                        placeholder="Deixe vazio para não alterar" /> </div>)} 
                  <div className="profile-field"> 
                    <label> 
                      <Car size={16} /> Veículo principal 
                      </label> 
                      <div> {veiculo} 
                        </div> 
                        
                        </div> 
                        </div>
                         </div> 
                         </DashboardLayout>)
}
export default Profile