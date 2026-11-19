import Image from "next/image";

import { PWA_URL } from "../../lib/site";

const navigation = [
  { label: "O projeto", href: "#projeto" },
  { label: "A proposta", href: "#proposta" },
  { label: "Plataforma", href: "#plataforma" },
  { label: "Tecnologia", href: "#tecnologia" },
];

export function Navbar() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo principal
      </a>

      <header className="site-header">
        <div className="site-header-inner">
          <a
            href="#inicio"
            className="site-brand"
            aria-label="Sinaliza — início"
          >
            <Image
              src="/brand/sinaliza-horizontal.svg"
              alt=""
              width={240}
              height={72}
              priority
              className="site-brand-image"
            />
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={PWA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
          >
            Experimentar
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

              <a href="#demonstracao">
                Veja a demonstração
              </a>

              <a
                href={PWA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-cta"
              >
                Experimentar o Sinaliza ↗
              </a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
