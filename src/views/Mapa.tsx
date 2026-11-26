import { Sidebar } from "../components/Sidebar";
import "../styles/mapa.css";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

// Corrige o ícone padrão dos marcadores do Leaflet
const iconeEstacao = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function Mapa() {
  return (
    <div className="mapa-page">
      <Sidebar />

      <main className="mapa-content">

        {/* CABEÇALHO */}
        <header className="mapa-header">
          <div>
            <span>ENCONTRE UM CARREGADOR</span>

            <h1>Mapa de estações</h1>
          </div>

          <button className="location-button">
            📍 Usar minha localização
          </button>
        </header>

        {/* PESQUISA */}
        <div className="map-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Digite uma cidade, endereço ou local..."
          />
        </div>

        {/* MAPA */}
        <div className="map-container">

          <MapContainer
            center={[-23.5915, -48.0531]}
            zoom={14}
            scrollWheelZoom={true}
            className="leaflet-map"
          >

           <TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

            {/* ECOCHARGE CENTRO */}
            <Marker
              position={[-23.5915, -48.0531]}
              icon={iconeEstacao}
            >
              <Popup>
                <div className="station-popup">

                  <strong>
                    ⚡ EcoCharge Centro
                  </strong>

                  <span className="popup-status">
                    🟢 Disponível
                  </span>

                  <p>
                    📍 Itapetininga - SP
                  </p>

                  <p>
                    🔌 Tipo 2 · 60 kW
                  </p>

                  <button>
                    Ver detalhes
                  </button>

                </div>
              </Popup>
            </Marker>

          </MapContainer>

          {/* LEGENDA */}
          <div className="map-legend">

            <strong>Status</strong>

            <span>
              <i className="green"></i>
              Disponível
            </span>

            <span>
              <i className="yellow"></i>
              Poucas vagas
            </span>

            <span>
              <i className="red"></i>
              Ocupado
            </span>

            <span>
              <i className="gray"></i>
              Indisponível
            </span>

          </div>

        </div>

      </main>
    </div>
  );
}