const steps = [
  {
    number: '01',
    title: 'Abra o SIGEV',
    description:
      'Permita o acesso à sua localização para ver os carregadores próximos.',
  },
  {
    number: '02',
    title: 'Encontre e filtre',
    description:
      'Use os filtros por distância, conector e potência para encontrar a estação ideal.',
  },
  {
    number: '03',
    title: 'Trace a rota',
    description:
      'Veja detalhes, disponibilidade e trace a rota até o carregador escolhido.',
  },
  {
    number: '04',
    title: 'Avalie',
    description:
      'Após carregar, avalie a estação e ajude outros motoristas.',
  },
]

function HowItWorks() {
  return (
    <section className="how section">

      <div className="section-heading">
        <h2>Como funciona</h2>
      </div>

      <div className="steps">

        {steps.map((step) => (
          <div className="step" key={step.number}>

            <div className="step-number">
              {step.number}
            </div>

            <h3>
              {step.title}
            </h3>

            <p>
              {step.description}
            </p>

          </div>
        ))}

      </div>

      

    </section>
  )
}

export default HowItWorks