import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'
import { cadastrarUsuario } from "../services/authService";

function Register() {
  
  const navigate = useNavigate()
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<
    "MOTORISTA" | "EMPRESA"
  >("MOTORISTA");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false)


  async function handleCadastro(event: any) {
    event.preventDefault();
    if (!aceitouTermos) {
  setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
  return
}

    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      await cadastrarUsuario(
        email,
        senha,
        nome,
        telefone,
        tipoUsuario
      );

     setSucesso("Cadastro realizado! Redirecionando para o login...");

navigate('/login');

    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível realizar o cadastro.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
      <div className="auth-page">

      <Link to="/" className="auth-back">
        <ArrowLeft size={18} />
        Voltar para o início
      </Link>

      <div className="auth-card register-card">

        <div className="auth-logo">
          <Zap size={24} />
        </div>

        <h1>
          Crie sua conta
        </h1>

        <p>
          Faça parte da comunidade SIGEV.
        </p>

      <form onSubmit={handleCadastro}>
        
          <label htmlFor="nome">
            Nome
          </label>

          <input
            id="nome"
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(event) =>
              setNome(event.target.value)
            }
            required
          />
        

        
          <label htmlFor="email">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        

        
          <label htmlFor="telefone">
            Telefone
          </label>

          <input
            id="telefone"
            type="tel"
            placeholder="Digite seu telefone"
            value={telefone}
            onChange={(event) =>
              setTelefone(event.target.value)
            }
          />
        

        
          <label htmlFor="tipoUsuario">
            Tipo de usuário
          </label>

          <select
            id="tipoUsuario"
            value={tipoUsuario}
            onChange={(event) =>
              setTipoUsuario(
                event.target.value as
                  | "MOTORISTA"
                  | "EMPRESA"
              )
            }
          >
            <option value="MOTORISTA">
              Motorista
            </option>

            <option value="EMPRESA">
              Empresa
            </option>
          </select>
       

        
          <label htmlFor="senha">
            Senha
          </label>

          <input
            id="senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            required
          />
       

       
          <label htmlFor="confirmarSenha">
            Confirmar senha
          </label>

          <input
            id="confirmarSenha"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChange={(event) =>
              setConfirmarSenha(event.target.value)
            }
            required
          />

          <label className="checkbox-label">

            <input
  type="checkbox"
  checked={aceitouTermos}
  onChange={(event) => setAceitouTermos(event.target.checked)}
  required
/>

            <span className="termo-link"> 
      Li e aceito os{' '}
      <Link to="/termos-de-uso" target="_blank">
        Termos de Uso
      </Link>{' '}
      e a{' '}
      <Link to="/politica-de-privacidade" target="_blank">
        Política de Privacidade
      </Link>
      .
    </span>

          </label>
       

        {erro && (
          <p>
             {erro}
          </p>
        )}

        {sucesso && (
          <p>
             {sucesso}
          </p>
        )}



        <button
          type="submit"
          className="auth-submit"
          disabled={carregando || !aceitouTermos}
        >
          {carregando
            ? "Criando conta..."
            : "Criar conta"}
        </button>
      </form>

     <p className="auth-register">
          Já possui uma conta?
          {' '}
          <Link to="/login">
            Entrar
          </Link>
        </p>

      </div>
      </div>
      )}
export default Register