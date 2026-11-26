import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface RegisterVehiclesProps {
  onClose: () => void;
}

interface Conector {
  id: string;
  nome: string;
  tipo: string;
  descricao: string | null;
}

function RegisterVehicles({ onClose }: RegisterVehiclesProps) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [tipo, setTipo] = useState<"CARRO" | "MOTO">("CARRO");
  const [conectorId, setConectorId] = useState("");
  const [capacidadeBateria, setCapacidadeBateria] = useState("");
  const [autonomia, setAutonomia] = useState("");

  const [conectores, setConectores] = useState<Conector[]>([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Carrega os conectores existentes no Supabase
  useEffect(() => {
    async function carregarConectores() {
      const { data, error } = await supabase
        .from("conectores")
        .select("id, nome, tipo, descricao")
        .order("nome");

      if (error) {
        console.error("Erro ao carregar conectores:", error);
        setErro("Não foi possível carregar os tipos de conector.");
        return;
      }

      setConectores(data || []);
    }

    carregarConectores();
  }, []);

  async function handleCadastro(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    // Validações
    if (!marca.trim()) {
      setErro("Informe a marca do veículo.");
      return;
    }

    if (!modelo.trim()) {
      setErro("Informe o modelo do veículo.");
      return;
    }

    if (!ano) {
      setErro("Informe o ano do veículo.");
      return;
    }

    if (!conectorId) {
      setErro("Selecione o tipo de conector.");
      return;
    }

    setCarregando(true);

    try {
      // Pega o usuário atualmente logado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Usuário não autenticado. Faça login novamente."
        );
      }

      // Cadastra o veículo
      const { error } = await supabase
        .from("veiculos")
        .insert({
          usuario_id: user.id,
          marca: marca.trim(),
          modelo: modelo.trim(),
          ano: Number(ano),
          tipo,
          conector_id: conectorId,
          capacidade_bateria_kwh: capacidadeBateria
            ? Number(capacidadeBateria)
            : null,
          autonomia_km: autonomia
            ? Number(autonomia)
            : null,
        });

      if (error) {
        console.error("Erro ao cadastrar veículo:", error);
        throw new Error(error.message);
      }

      setSucesso("Veículo cadastrado com sucesso!");

      // Limpa formulário
      setMarca("");
      setModelo("");
      setAno("");
      setTipo("CARRO");
      setConectorId("");
      setCapacidadeBateria("");
      setAutonomia("");

    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível cadastrar o veículo.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="vehicle-modal">

      <div className="vehicle-modal-header">

        <div>
          <h2>Adicionar veículo</h2>
          <p>Preencha as informações do veículo.</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="vehicle-close"
        >
          <X size={20} />
        </button>

      </div>

      <form onSubmit={handleCadastro}>

        {/* MARCA */}
        <div className="form-group">
          <label htmlFor="marca">
            Marca
          </label>

          <input
            id="marca"
            type="text"
            placeholder="Ex.: Tesla"
            value={marca}
            onChange={(event) =>
              setMarca(event.target.value)
            }
            required
          />
        </div>

        {/* MODELO */}
        <div className="form-group">
          <label htmlFor="modelo">
            Modelo
          </label>

          <input
            id="modelo"
            type="text"
            placeholder="Ex.: Model 3"
            value={modelo}
            onChange={(event) =>
              setModelo(event.target.value)
            }
            required
          />
        </div>

        {/* ANO */}
        <div className="form-group">
          <label htmlFor="ano">
            Ano
          </label>

          <input
            id="ano"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            placeholder="Ex.: 2024"
            value={ano}
            onChange={(event) =>
              setAno(event.target.value)
            }
            required
          />
        </div>

        {/* TIPO DE VEÍCULO */}
        <div className="form-group">
          <label htmlFor="tipo">
            Tipo de veículo
          </label>

          <select
            id="tipo"
            value={tipo}
            onChange={(event) =>
              setTipo(
                event.target.value as "CARRO" | "MOTO"
              )
            }
          >
            <option value="CARRO">
              Carro
            </option>

            <option value="MOTO">
              Moto
            </option>
          </select>
        </div>

        {/* CONECTOR */}
        <div className="form-group">
          <label htmlFor="conector">
            Tipo de conector
          </label>

          <select
            id="conector"
            value={conectorId}
            onChange={(event) =>
              setConectorId(event.target.value)
            }
            required
          >
            <option value="">
              Selecione o conector
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
        </div>

        {/* BATERIA */}
        <div className="form-group">
          <label htmlFor="capacidadeBateria">
            Capacidade da bateria (kWh)
          </label>

          <input
            id="capacidadeBateria"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex.: 75"
            value={capacidadeBateria}
            onChange={(event) =>
              setCapacidadeBateria(event.target.value)
            }
          />
        </div>

        {/* AUTONOMIA */}
        <div className="form-group">
          <label htmlFor="autonomia">
            Autonomia (km)
          </label>

          <input
            id="autonomia"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex.: 500"
            value={autonomia}
            onChange={(event) =>
              setAutonomia(event.target.value)
            }
          />
        </div>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <p className="form-error">
            ❌ {erro}
          </p>
        )}

        {/* MENSAGEM DE SUCESSO */}
        {sucesso && (
          <p className="form-success">
            ✅ {sucesso}
          </p>
        )}

        {/* BOTÕES */}
        <div className="vehicle-actions">

          <button
            type="button"
            onClick={onClose}
            className="button-cancel"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="button-save"
            disabled={carregando}
          >
            {carregando
              ? "Salvando..."
              : "Salvar veículo"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default RegisterVehicles;