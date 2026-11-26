import DashboardLayout from "../components/DashboardLayout";
import {
  Car,
  Battery,
  Zap,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { obterUsuarioAtual } from "../services/authService";

import {
  listarVeiculos,
  listarConectores,
  cadastrarVeiculo,
  atualizarVeiculo,
  enviarFotoVeiculo,
  excluirVeiculo,
  type Veiculo,
  type Conector,
} from "../services/vehiclesService";

function Vehicles() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [conectores, setConectores] = useState<Conector[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const [veiculoSelecionado, setVeiculoSelecionado] =
    useState<string | null>(null);

  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState<"CARRO" | "MOTO">("CARRO");
  const [conector, setConector] = useState("");
  const [bateria, setBateria] = useState("");
const [foto, setFoto] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarVeiculos();
    carregarConectores();
  }, []);

  async function carregarConectores() {
    try {
      const dados = await listarConectores();
      setConectores(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os conectores.");
    }
  }

  async function carregarVeiculos() {
    try {
      setErro("");

      const usuario = await obterUsuarioAtual();

      if (!usuario) {
        setErro("Usuário não está autenticado.");
        return;
      }

      const dados = await listarVeiculos(usuario.id);

      setVeiculos(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar seus veículos.");
    }
  }

  function limparFormulario() {
    setModelo("");
    setMarca("");
    setAno("");
    setPlaca("");
    setTipo("CARRO");
    setConector("");
    setBateria("");
    setVeiculoSelecionado(null);
    setFoto(null);
  }

  function handleAdd() {
    limparFormulario();
    setEditing(false);
    setShowForm(true);
    setErro("");
  }

  function handleEdit(veiculo: Veiculo) {
    setVeiculoSelecionado(veiculo.id);

    setMarca(veiculo.marca);
    setModelo(veiculo.modelo);
    setAno(String(veiculo.ano));
    setPlaca(veiculo.placa ?? "");
    setTipo(veiculo.tipo);

    setBateria(
      veiculo.capacidade_bateria_kwh
        ? String(veiculo.capacidade_bateria_kwh)
        : ""
    );

    setConector(veiculo.conector_id ?? "");

    setEditing(true);
    setShowForm(true);
    setErro("");
  }

  function handleCancel() {
    limparFormulario();
    setShowForm(false);
    setEditing(false);
    setErro("");
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    try {
      setCarregando(true);
      setErro("");

      const usuario = await obterUsuarioAtual();

      if (!usuario) {
        setErro("Usuário não está autenticado.");
        return;
      }

      if (!marca || !modelo || !ano || !placa || !bateria || !conector) {
        if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
  setErro("Informe uma placa válida.");
  return;
}
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }

      if (editing && veiculoSelecionado) {
  const fotoUrl = foto
    ? await enviarFotoVeiculo(foto, usuario.id)
    : undefined;

  const atualizado = await atualizarVeiculo(
    veiculoSelecionado,
    {
      marca,
      modelo,
      ano: Number(ano),
      tipo,
      placa,
      capacidade_bateria_kwh: Number(bateria),
      conector_id: conector,
      ...(fotoUrl ? { foto_url: fotoUrl } : {}),
    }
  );

        setVeiculos((veiculosAtuais) =>
          veiculosAtuais.map((veiculo) =>
            veiculo.id === atualizado.id
              ? atualizado
              : veiculo
          )
        );

        alert("Veículo atualizado com sucesso!");
      } else {

        const fotoUrl = foto
  ? await enviarFotoVeiculo(foto, usuario.id)
  : null;

        const novoVeiculo = await cadastrarVeiculo(
          usuario.id,
          {
            marca,
            modelo,
            ano: Number(ano),
            tipo,
            placa,
            capacidade_bateria_kwh: Number(bateria),
            foto_url: fotoUrl,
            conector_id: conector,
          }
        );

        setVeiculos((veiculosAtuais) => [
          novoVeiculo,
          ...veiculosAtuais,
        ]);

        alert("Veículo cadastrado com sucesso!");
      }

      handleCancel();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Ocorreu um erro ao salvar o veículo.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este veículo?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirVeiculo(id);

      setVeiculos((veiculosAtuais) =>
        veiculosAtuais.filter(
          (veiculo) => veiculo.id !== id
        )
      );

      alert("Veículo excluído com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Não foi possível excluir o veículo.");
    }
  }

  return (
    <DashboardLayout
      title="Meus veículos"
      description="Gerencie seus veículos e compatibilidades."
    >
      <div className="page-top-action">
        <button
          className="button-primary dashboard-button"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Adicionar veículo
        </button>
      </div>

      {erro && (
        <div className="error-message">
          {erro}
        </div>
      )}

      {showForm && (
        <div className="vehicle-register-card">

          <div className="vehicle-register-header">
            <div className="vehicle-register-icon">
              <Car size={24} />
            </div>

            <h1>
              {editing
                ? "Editar veículo"
                : "Cadastrar veículo"}
            </h1>

            <p>
              {editing
                ? "Atualize as informações do seu veículo."
                : "Cadastre seu veículo para encontrar estações compatíveis."}
            </p>
          </div>

          <form onSubmit={handleSave}>

            <div className="vehicle-field">
              <label htmlFor="marca">
                Marca
              </label>

              <input
                id="marca"
                type="text"
                placeholder="Digite a marca do veículo"
                value={marca}
                onChange={(event) =>
                  setMarca(event.target.value)
                }
                required
              />
            </div>

            <div className="vehicle-field">
              <label htmlFor="modelo">
                Modelo
              </label>

              <input
                id="modelo"
                type="text"
                placeholder="Digite o modelo do veículo"
                value={modelo}
                onChange={(event) =>
                  setModelo(event.target.value)
                }
                required
              />
            </div>

<div className="vehicle-field">
  <label htmlFor="placa">Placa do veículo</label>

  <input
    id="placa"
    type="text"
    placeholder="Ex: ABC1D23"
    value={placa}
    onChange={(event) =>
      setPlaca(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))
    }
    maxLength={7}
    required
  />
</div>


            <div className="vehicle-field">
  <label htmlFor="foto">Foto do veículo</label>

  <input
    id="foto"
    type="file"
    accept="image/*"
    onChange={(event) => {
      const arquivo = event.target.files?.[0] ?? null;
      setFoto(arquivo);
    }}
  />
</div>

            <div className="vehicle-field">
              <label htmlFor="ano">
                Ano
              </label>

              <input
                id="ano"
                type="number"
                placeholder="Ex: 2024"
                value={ano}
                onChange={(event) =>
                  setAno(event.target.value)
                }
                required
              />
            </div>

            <div className="vehicle-field">
              <label htmlFor="tipo">
                Tipo de veículo
              </label>

              <select
                id="tipo"
                value={tipo}
                onChange={(event) =>
                  setTipo(
                    event.target.value as
                      | "CARRO"
                      | "MOTO"
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

            <div className="vehicle-field">
              <label htmlFor="conector">
                Tipo de conector
              </label>

              <select
                id="conector"
                value={conector}
                onChange={(event) =>
                  setConector(event.target.value)
                }
                required
              >
                <option value="">
                  Selecione o conector
                </option>

                {conectores.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicle-field">
              <label htmlFor="bateria">
                Capacidade da bateria (kWh)
              </label>

              <input
                id="bateria"
                type="number"
                step="0.01"
                placeholder="Ex: 75"
                value={bateria}
                onChange={(event) =>
                  setBateria(event.target.value)
                }
                required
              />
            </div>

            <div className="vehicle-register-actions">

              <button
                type="button"
                className="vehicle-register-cancel"
                onClick={handleCancel}
                disabled={carregando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="auth-submit"
                disabled={carregando}
              >
                {carregando
                  ? "Salvando..."
                  : editing
                  ? "Atualizar veículo"
                  : "Cadastrar veículo"}
              </button>

            </div>

          </form>
        </div>
      )}

      {!showForm && (
        <>
          {veiculos.length === 0 ? (
            <div className="vehicle-empty">
              <Car size={55} />

              <h2>
                Nenhum veículo cadastrado
              </h2>

              <p>
                Adicione seu primeiro veículo para
                começar.
              </p>
            </div>
          ) : (
            <div className="vehicle-grid">

              {veiculos.map((veiculo) => (
                <div
                  className="vehicle-card"
                  key={veiculo.id}
                >
                  <div className="vehicle-image">
  {veiculo.foto_url ? (
    <img
      src={veiculo.foto_url}
      alt={`${veiculo.marca} ${veiculo.modelo}`}
    />
  ) : (
    <Car size={75} />
  )}
</div>

                  <div className="vehicle-info">

                    <div className="vehicle-title">

                      <div>
                        <h2>
                          {veiculo.marca}{" "}
                          {veiculo.modelo}
                        </h2>

                        <span>
                          {veiculo.ano}
                        </span>
                      </div>

                      <div>
                        <button
                          onClick={() =>
                            handleEdit(veiculo)
                          }
                          title="Editar veículo"
                        >
                          <Settings size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(veiculo.id)
                          }
                          title="Excluir veículo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>

                    <div className="vehicle-details">

<div>
  <Car size={17} />
  <span>
    Placa: {veiculo.placa}
  </span>
</div>

                      <div>
                        <Zap size={17} />

                        <span>
                          {veiculo.conector_id
                            ? "Conector cadastrado"
                            : "Conector não informado"}
                        </span>
                      </div>

                      <div>
                        <Battery size={17} />

                        <span>
                          {veiculo.capacidade_bateria_kwh}{" "}
                          kWh
                        </span>
                      </div>

                    </div>

                    <div className="compatibility">
                      Compatível com estações próximas
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default Vehicles;