import "../styles/dashboard.css";
import { Sidebar } from "../components/Sidebar";



export function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-content">

        {/* CABEÇALHO */}
        <header className="dashboard-header">
          <div>
            <span>Boa tarde,</span>
            <h1>Bem-vindo ao SIGEV 👋</h1>
          </div>

          
        </header>

        {/* STATUS DAS ESTAÇÕES */}
        <section className="status-card">

          <div>
            <span className="status-title">
              ● AO VIVO
            </span>

            <div className="station-number">
              4
            </div>

            <span className="station-text">
              estações disponíveis
            </span>

            <button className="map-button">
              Abrir mapa →
            </button>
          </div>

          <div className="status-info">
            <span>
              <strong>8</strong> no total
            </span>

            <span className="yellow">
              2 poucas vagas
            </span>

            <span className="red">
              1 ocupada
            </span>
          </div>

          <div className="location">
            ● São Paulo, SP
          </div>

        </section>

        {/* ACESSO RÁPIDO */}
        <section>
          <h2>Acesso rápido</h2>

          <div className="quick-grid">

            <div className="quick-card">
              <div className="quick-icon">
                🗺️
              </div>

              <div>
                <strong>Explorar mapa</strong>
                <span>Ver carregadores</span>
              </div>
            </div>

            <div className="quick-card">
              <div className="quick-icon">
                🔍
              </div>

              <div>
                <strong>Compatíveis</strong>
                <span>Para meu veículo</span>
              </div>
            </div>

            <div className="quick-card">
              <div className="quick-icon">
                ⭐
              </div>

              <div>
                <strong>Favoritos</strong>
                <span>3 salvos</span>
              </div>
            </div>

            <div className="quick-card">
              <div className="quick-icon">
                📋
              </div>

              <div>
                <strong>Histórico</strong>
                <span>4 sessões</span>
              </div>
            </div>

          </div>
        </section>

        {/* VEÍCULO */}
        <section className="vehicle-section">

          <div className="vehicle-icon">
            🚗
          </div>

          <div>
            <strong>BYD Dolphin</strong>
            <span>2023 · CCS · 400 km</span>
          </div>

          <span className="vehicle-more">
            +1 →
          </span>

        </section>

        {/* ESTAÇÕES PRÓXIMAS */}
        <section>

          <div className="section-header">
            <h2>Estações próximas</h2>

            <button>
              Ver todas
            </button>
          </div>

          <div className="stations">

            <Station
              nome="EcoCharge Paulista"
              nota="4.7"
              distancia="0.4 km"
              status="Disponível"
              classe="available"
            />

            <Station
              nome="GreenPower Pinheiros"
              nota="4.1"
              distancia="1.2 km"
              status="Poucas vagas"
              classe="few"
            />

            <Station
              nome="Volta Fast Charge Itaim"
              nota="4.5"
              distancia="2.1 km"
              status="Ocupado"
              classe="busy"
            />

          </div>

        </section>

        {/* ÚLTIMA RECARGA */}
        <section className="last-charge">

          <div className="last-icon">
            ◷
          </div>

          <div>
            <strong>EcoCharge Paulista</strong>
            <span>
              12 ago 2026 · 42 min · BYD Dolphin
            </span>
          </div>

          <button>
            Ver histórico →
          </button>

        </section>

      </main>
    </div>
  );
}


/* COMPONENTE DE ESTAÇÃO */

interface StationProps {
  nome: string;
  nota: string;
  distancia: string;
  status: string;
  classe: "available" | "few" | "busy";
}

function Station({
  nome,
  nota,
  distancia,
  status,
  classe,
}: StationProps) {

  return (
    <div className="station-card">

      <div className="station-icon">
        ⚡
      </div>

      <div className="station-info">

        <strong>{nome}</strong>

        <span>
          ⭐⭐⭐⭐⭐ {nota} · {distancia}
        </span>

      </div>

      <span className={`status-badge ${classe}`}>
        ● {status}
      </span>

    </div>
  );
}