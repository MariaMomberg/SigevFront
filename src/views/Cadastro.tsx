import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../services/authService";

export function Cadastro() {
  const navigate = useNavigate();

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

  async function handleCadastro(event: any) {
    event.preventDefault();

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

      setSucesso(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
      );

      setNome("");
      setEmail("");
      setTelefone("");
      setSenha("");
      setConfirmarSenha("");
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
    <main>
      <h1>SIGEV</h1>

      <h2>Criar conta</h2>

      <form onSubmit={handleCadastro}>
        <div>
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
        </div>

        <div>
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
        </div>

        <div>
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
        </div>

        <div>
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
        </div>

        <div>
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
        </div>

        <div>
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
        </div>

        {erro && (
          <p>
            ❌ {erro}
          </p>
        )}

        {sucesso && (
          <p>
            ✅ {sucesso}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
        >
          {carregando
            ? "Criando conta..."
            : "Criar conta"}
        </button>
      </form>

      <p>
        Já possui uma conta?
      </p>

      <button
        type="button"
        onClick={() => navigate("/login")}
      >
        Voltar para o login
      </button>
    </main>
  );
}