function Header() {
  return (
    <header className="header">
      <div className="header-inner">

        <div className="brand">
          <img src="/SIGEV.png" alt="SIGEV" className="brand-img" />

          <div className="brand-name">
            <strong>SIGEV</strong>
            <span>· EcoRacing</span>
          </div>
        </div>

        <nav className="header-nav">
          <button className="login-button">
            <a className="nav-link" href="/login">
              Entrar
            </a>
          </button>

          <button className="signup-button">
            <a className="nav-link" href="/cadastro">
              Cadastrar
            </a>
          </button>
        </nav>

      </div>
    </header>
  )
}

export default Header