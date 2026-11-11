import Image from "next/image";

const footerLinks = [
  { label: "O projeto", href: "#projeto" },
  { label: "Como funciona", href: "#jornada" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Demonstração", href: "#demonstracao" },
  { label: "O futuro", href: "#futuro" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#inicio" className="footer-logo" aria-label="Sinaliza — início">
              <Image
                src="/brand/sinaliza-horizontal.svg"
                alt=""
                width={260}
                height={78}
                className="footer-logo-image"
              />
            </a>

            <p>
              Aprender Libras é abrir espaço para novas formas de comunicação e
              conexão.
            </p>
          </div>

          <nav className="footer-navigation" aria-label="Navegação do rodapé">
            <span className="footer-heading">Explore</span>

            {footerLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-project">
            <span className="footer-heading">Acompanhe o projeto</span>

            <a
              href="https://github.com/galesTV/sinaliza"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-github"
            >
              GitHub
              <span aria-hidden="true">↗</span>
            </a>

            <span className="footer-hackathon">
              Projeto participante do HackBrasil 2026
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Sinaliza. Todos os direitos reservados.</span>

          <span className="footer-bottom-message">
            Construindo novas possibilidades.
          </span>
        </div>
      </div>
    </footer>
  );
}
