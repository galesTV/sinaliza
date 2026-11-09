const navigation = [
  { label: "O projeto", href: "#projeto" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Demonstração", href: "#demo" },
];

export function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#inicio" className="site-brand" aria-label="Sinaliza — início">
          <span className="site-brand-symbol" aria-hidden="true">
            S
          </span>
          <span className="site-brand-name">sinaliza</span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#demo" className="nav-cta">
          Conheça o projeto
          <span aria-hidden="true">↗</span>
        </a>

        <details className="mobile-nav">
          <summary aria-label="Abrir menu de navegação">
            <span />
            <span />
            <span />
          </summary>

          <nav aria-label="Navegação mobile">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}

            <a href="#demo" className="mobile-nav-cta">
              Conheça o projeto ↗
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
