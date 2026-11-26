import DashboardLayout from "../components/DashboardLayout";
import {
  ArrowLeft,
  MapPin,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

import {
  listarConectores,
  cadastrarEndereco,
  cadastrarEstacao,
  cadastrarCarregador,
 type Conector,
} from "../services/stationService";

function RegisterStation() {
  const navigate = useNavigate();

  const [conectores, setConectores] =
    useState<Conector[]>([]);

  const [nome, setNome] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] =
    useState("");

  const [conectorId, setConectorId] =
    useState("");

  const [quantidadeVagas, setQuantidadeVagas] =
    useState("1");

  const [potencia, setPotencia] =
    useState("");

  const [horario, setHorario] =
    useState("");

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    carregarConectores();
  }, []);

  async function carregarConectores() {
    try {
      const dados =
        await listarConectores();

      setConectores(dados);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar os conectores."
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    try {
      setCarregando(true);

      if (!nome || !rua || !cidade || !estado) {
        setErro(
          "Preencha todos os campos obrigatórios."
        );
        return;
      }

      if (!latitude || !longitude) {
        setErro(
          "Informe a latitude e a longitude."
        );
        return;
      }

      if (!conectorId) {
        setErro(
          "Selecione o tipo de conector."
        );
        return;
      }

      if (!potencia) {
        setErro(
          "Informe a potência do carregador."
        );
        return;
      }

      // 1. Cadastra o endereço
      const endereco =
        await cadastrarEndereco({
          rua,
          numero,
          cidade,
          estado,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });

      // 2. Cadastra a estação
      const estacao =
        await cadastrarEstacao({
          nome,
          endereco_id: endereco.id,
        });

      // 3. Cadastra os carregadores
      const quantidade =
        Number(quantidadeVagas);

      for (let i = 1; i <= quantidade; i++) {
        await cadastrarCarregador({
          estacao_id: estacao.id,
          conector_id: conectorId,
          potencia_kw: Number(potencia),
          identificacao: `CAR-${i}`,
        });
      }

      alert(
        "Estação cadastrada com sucesso!"
      );

      navigate("/admin");

    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Ocorreu um erro ao cadastrar a estação."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <DashboardLayout
      title="Nova estação"
      description="Cadastre uma nova estação de carregamento."
    >
      <Link
        to="/admin"
        className="back-page"
      >
        <ArrowLeft size={17} />
        Voltar para estações
      </Link>

      {erro && (
        <div className="error-message">
          {erro}
        </div>
      )}

      <form
        className="station-form"
        onSubmit={handleSubmit}
      >
        {/* INFORMAÇÕES DA ESTAÇÃO */}

        <div className="form-section">
          <h2>
            Informações da estação
          </h2>

          <div className="form-grid">

            <div className="form-group full">
              <label>
                Nome da estação
              </label>

              <input
                placeholder="Ex: EcoCharge Paulista"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Endereço
              </label>

              <input
                placeholder="Avenida Paulista"
                value={rua}
                onChange={(e) =>
                  setRua(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Número
              </label>

              <input
                placeholder="1578"
                value={numero}
                onChange={(e) =>
                  setNumero(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Cidade
              </label>

              <input
                placeholder="São Paulo"
                value={cidade}
                onChange={(e) =>
                  setCidade(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Estado
              </label>

              <select
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value)
                }
                required
              >
                <option value="">
                  Selecione
                </option>

                <option value="São Paulo">
                  São Paulo
                </option>

                <option value="Rio de Janeiro">
                  Rio de Janeiro
                </option>

                <option value="Minas Gerais">
                  Minas Gerais
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* LOCALIZAÇÃO */}

        <div className="form-section">

          <h2>
            Localização
          </h2>

          <div className="coordinates">

            <div className="form-group">
              <label>
                Latitude
              </label>

              <input
                type="number"
                step="any"
                placeholder="-23.5614"
                value={latitude}
                onChange={(e) =>
                  setLatitude(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Longitude
              </label>

              <input
                type="number"
                step="any"
                placeholder="-46.6558"
                value={longitude}
                onChange={(e) =>
                  setLongitude(e.target.value)
                }
                required
              />
            </div>

          </div>

          <div className="location-preview">

            <MapPin size={30} />

            <span>
              A localização da estação aparecerá aqui
            </span>

          </div>

        </div>

        {/* CARREGADORES */}

        <div className="form-section">

          <h2>
            Carregadores
          </h2>

          <div className="form-grid">

            <div className="form-group">
              <label>
                Tipo de conector
              </label>

              <select
                value={conectorId}
                onChange={(e) =>
                  setConectorId(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Selecione
                </option>

                {conectores.map(
                  (conector) => (
                    <option
                      key={conector.id}
                      value={conector.id}
                    >
                      {conector.nome}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Quantidade de vagas
              </label>

              <input
                type="number"
                min="1"
                value={quantidadeVagas}
                onChange={(e) =>
                  setQuantidadeVagas(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Potência (kW)
              </label>

              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="150"
                value={potencia}
                onChange={(e) =>
                  setPotencia(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Horário
              </label>

              <input
                placeholder="24 horas"
                value={horario}
                onChange={(e) =>
                  setHorario(
                    e.target.value
                  )
                }
              />
            </div>

          </div>

        </div>

        {/* BOTÕES */}

        <div className="form-actions">

          <Link
            to="/admin"
            className="cancel-button"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="button-primary dashboard-button"
            disabled={carregando}
          >
            {carregando
              ? "Cadastrando..."
              : "Cadastrar estação"}
          </button>

        </div>

      </form>
    </DashboardLayout>
  );
}

export default RegisterStation;