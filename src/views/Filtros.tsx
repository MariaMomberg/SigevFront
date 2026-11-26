import { Sidebar } from "../components/Sidebar";
import "../styles/filtros.css";

export function Filtros() {
  return (
    <div className="filtros-page">
      <Sidebar />

      <main className="filtros-content">
        <header className="filtros-header">
          <div>
            <span>ENCONTRE O CARREGADOR IDEAL</span>
            <h1>Buscar estações</h1>
          </div>
        </header>

        <section className="filtros-card">
          <div className="filtro-busca">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Digite uma cidade, endereço ou local..."
            />
          </div>

          <div className="filtros-grid">
            <div className="filtro-item">
              <label>Status</label>

              <select>
                <option value="">Todos os status</option>
                <option value="disponivel">Disponível</option>
                <option value="poucas">Poucas vagas</option>
                <option value="ocupado">Ocupado</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </div>

            <div className="filtro-item">
              <label>Tipo de conector</label>

              <select>
                <option value="">Todos os conectores</option>
                <option value="tipo2">Tipo 2</option>
                <option value="ccs">CCS</option>
                <option value="chademo">CHAdeMO</option>
                <option value="gbt">GB/T</option>
              </select>
            </div>

            <div className="filtro-item">
              <label>Potência</label>

              <select>
                <option value="">Qualquer potência</option>
                <option value="22">Até 22 kW</option>
                <option value="60">22 - 60 kW</option>
                <option value="150">60 - 150 kW</option>
                <option value="350">Acima de 150 kW</option>
              </select>
            </div>

            <div className="filtro-item">
              <label>Distância</label>

              <select>
                <option value="">Qualquer distância</option>
                <option value="5">Até 5 km</option>
                <option value="10">Até 10 km</option>
                <option value="25">Até 25 km</option>
                <option value="50">Até 50 km</option>
              </select>
            </div>
          </div>

          <div className="filtros-acoes">
            <button className="limpar-button">
              Limpar filtros
            </button>

            <button className="buscar-button">
              🔍 Buscar estações
            </button>
          </div>
        </section>

        <section className="resultado-header">
          <div>
            <span>ESTAÇÕES ENCONTRADAS</span>
            <h2>Estações próximas</h2>
          </div>

          <span className="resultado-count">
            1 estação encontrada
          </span>
        </section>

        <section className="estacao-card">
          <div className="estacao-icon">⚡</div>

          <div className="estacao-info">
            <div className="estacao-title">
              <h3>EcoCharge Centro</h3>
              <span className="status-disponivel">
                Disponível
              </span>
            </div>

            <p>📍 Itapetininga - SP</p>

            <div className="estacao-details">
              <span>🔌 Tipo 2</span>
              <span>⚡ 60 kW</span>
              <span>🅿️ 4 vagas</span>
            </div>
          </div>

          <button className="detalhes-button">
            Ver detalhes →
          </button>
        </section>
      </main>
    </div>
  );
}