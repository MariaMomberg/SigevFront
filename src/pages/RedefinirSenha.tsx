
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { solicitarRedefinicaoSenha } from '../services/authService'

function RedefinirSenha() {
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModoRecuperacao(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function enviarEmail(event: React.FormEvent) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      await solicitarRedefinicaoSenha(email)
      setMensagem('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.')
    } catch (error) {
      setErro('Não foi possível enviar o e-mail. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function alterarSenha(event: React.FormEvent) {
    event.preventDefault()
    setErro('')
    setMensagem('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      })

      if (error) throw error

      setMensagem('Senha alterada com sucesso!')
      setSenha('')
      setConfirmarSenha('')

      await supabase.auth.signOut()
      setModoRecuperacao(false)
    } catch (error) {
      setErro('Não foi possível alterar a senha. Solicite um novo link de recuperação.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        <div className="forgot-logo">
          <img src="/public/SIGEV.png" alt="SIGEV" />
        </div>

        <h1>
          {modoRecuperacao ? 'Redefinir senha' : 'Esqueceu sua senha?'}
        </h1>

        <p>
          {modoRecuperacao
            ? 'Digite sua nova senha abaixo.'
            : 'Informe seu e-mail para receber o link de recuperação.'}
        </p>

        <form
          className="forgot-form"
          onSubmit={modoRecuperacao ? alterarSenha : enviarEmail}
        >

          {!modoRecuperacao ? (
            <>
              <label>E-mail cadastrado</label>

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <label>Nova senha</label>

              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <label>Confirmar senha</label>

              <input
                type="password"
                placeholder="Digite novamente sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </>
          )}

          {erro && (
            <span className="forgot-error">{erro}</span>
          )}

          {mensagem && (
            <span className="forgot-success">{mensagem}</span>
          )}

          <button type="submit" disabled={carregando}>
            {carregando
              ? 'Aguarde...'
              : modoRecuperacao
                ? 'Alterar senha'
                : 'Enviar link de recuperação'}
          </button>

        </form>

        <Link to="/login" className="back-login">
          ← Voltar para o login
        </Link>

      </div>
    </div>
  )
}

export default RedefinirSenha
