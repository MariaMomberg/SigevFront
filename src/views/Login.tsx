import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { fazerLogin } from '../services/authService'


export function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

    const [erroSenha, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)
  
    async function handleLogin(event: React.FormEvent) {
      event.preventDefault()
  
      setErro('')
      setCarregando(true)
  
      try {
  
        await fazerLogin(email, password)
  
        // Login realizado com sucesso
        navigate('/dashboard')
  
      } catch (error) {
  
        if (error instanceof Error) {
          setErro(error.message)
        } else {
          setErro('E-mail ou senha incorretos.')
        }
  
      } finally {
        setCarregando(false)
      }
    } 
  

  return (
    <div className="auth-page">

      <Link to="/" className="auth-back">
        <ArrowLeft size={18} />
        Voltar para o início
      </Link>

      <div className="auth-card">

        <div className="auth-logo">
          <Zap size={24} />
        </div>

        <h1>
          Bem-vindo de volta
        </h1>

        <p>
          Entre na sua conta SIGEV para continuar.
        </p>

        <form onSubmit={handleLogin}>

          <label>
            E-mail
          </label>

          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-label">

            <label>
              Senha
            </label>

            <button type="button" className="auth-register">
              <Link to="/RedefinirSenha">
            Esqueci minha senha
              </Link>
            </button>

          </div>

          <div className="password-input">

            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-eye"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>

          {erroSenha && <p className="auth-error">{erroSenha}</p>}

          <button
            type="submit"
            className="auth-submit"
          >
            Entrar
          </button>

        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-register">
          Ainda não tem uma conta?
          {' '}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Login