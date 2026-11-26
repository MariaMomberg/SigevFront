function Hero() {
  return (
    <section className="hero section">

      <div className="hero-content">

        <div className="hero-badge">
          <span></span>
          Plataforma de mobilidade elétrica — EcoRacing
        </div>

        <h1>
          Encontre.
          <br />

          <span>Carregue.</span>
          <br />

          Continue.
        </h1>

        <p>
          O SIGEV reúne mapa interativo, disponibilidade em
          tempo real, compatibilidade de conectores,
          avaliações e rotas — tudo em um único lugar.
        </p>

        <div className="hero-buttons">

          <button className="button-primary">
            <a className="link-map" href="/login">Encontrar carregadores</a>
          </button>


        </div>

      </div>

      <div className="hero-visual">

        <div className="charging-card">

          <div className="charging-image">
            <div className="charging-glow"></div>

            <div className="car-placeholder">
              ⚡
            </div>
          </div>

          <div className="station-card">

            <div className="station-info">

              <div className="station-icon">
                ⚡
              </div>

              <div>
                <strong>EcoCharge Paulista</strong>
                <span>
                  Av. Paulista, 1578 · 0,4 km
                </span>
              </div>

            </div>

            <div className="available">
              <span></span>
              4 vagas
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Hero