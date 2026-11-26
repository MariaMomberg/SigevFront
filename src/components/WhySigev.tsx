const features = [
  {
    icon: '📍',
    title: 'Carregadores próximos',
    description:
      'Encontre estações de recarga ao redor de você em tempo real, no mapa.',
  },
  {
    icon: '🟢',
    title: 'Disponibilidade em tempo real',
    description:
      'Saiba se há vagas livres antes mesmo de sair de casa.',
  },
  {
    icon: '🔌',
    title: 'Compatibilidade garantida',
    description:
      'Filtre apenas os carregadores compatíveis com o seu veículo e conector.',
  },
  {
    icon: '⚡',
    title: 'Componente conectado',
    description:
      'Veja informações importantes sobre potência, conectores e carregamento.',
  },
  {
    icon: '⭐',
    title: 'Avaliações reais',
    description:
      'Veja opiniões de outros motoristas e compartilhe sua experiência.',
  },
  {
    icon: '🚀',
    title: 'Conecte agora, gratuitamente',
    description:
      'Crie sua conta e tenha acesso a todos os recursos do SIGEV.',
  },
]

function WhySigev() {
  return (
    <section className="why section">

      <div className="section-heading">

        <h2>
          Por que usar o SIGEV?
        </h2>

        <p>
          Tudo que um motorista de elétrico precisa para
          carregar com tranquilidade e sem surpresas.
        </p>

      </div>

      <div className="features-grid">

        {features.map((feature, index) => (
          <div
            className={`feature-card ${
              index === 5 ? 'feature-highlight' : ''
            }`}
            key={feature.title}
          >

            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>
              {feature.title}
            </h3>

            <p>
              {feature.description}
            </p>

            {index === 5 && (
              <button className="card-button">
                <a className="criar-conta-gratis" href="/cadastro">
                  Criar conta grátis
                </a>
              </button>
            )}

          </div>
        ))}

      </div>

      

    </section>
  )
}

export default WhySigev