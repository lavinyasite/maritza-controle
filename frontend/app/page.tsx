"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const LANGUAGES = [
  {
    code: "pt",
    flag: "🇧🇷",
    name: "Português",
    subtitle: "Brasil",
    greeting: "Bem-vindo!",
    description: "Gerencie sua escala de serviço",
  },
  {
    code: "it",
    flag: "🇮🇹",
    name: "Italiano",
    subtitle: "Italia",
    greeting: "Benvenuto!",
    description: "Gestisci la tua scala di servizio",
  },
];

export default function LanguageSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (code: string) => {
    setSelected(code);
    setLoading(true);
    localStorage.setItem("cs_lang", code);
    setTimeout(() => {
      router.push(`/login?lang=${code}`);
    }, 600);
  };

  return (
    <main className={styles.container}>
      {/* Fundo animado */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="19" stroke="#e94560" strokeWidth="2"/>
              <path d="M20 10v10l6 4" stroke="#e94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="2" fill="#e94560"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>Controllo Servizi</h1>
            <p className={styles.logoSub}>Gestione Turni · Gestão de Turnos</p>
          </div>
        </div>

        {/* Headline */}
        <div className={styles.headline}>
          <h2>Scegli la lingua</h2>
          <p>Escolha o idioma · Choose your language</p>
        </div>

        {/* Cards de idioma */}
        <div className={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              id={`lang-${lang.code}`}
              className={`${styles.langCard} ${selected === lang.code ? styles.langCardActive : ""}`}
              onClick={() => handleSelect(lang.code)}
              disabled={loading}
              aria-label={`Selecionar idioma ${lang.name}`}
            >
              <span className={styles.langFlag}>{lang.flag}</span>
              <span className={styles.langName}>{lang.name}</span>
              <span className={styles.langSubtitle}>{lang.subtitle}</span>
              <span className={styles.langDesc}>{lang.description}</span>

              {/* Indicador de seleção */}
              {selected === lang.code && (
                <div className={styles.langCheck}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress} />
          </div>
        )}

        {/* Footer */}
        <p className={styles.footer}>
          © 2026 Controllo Servizi · Tutti i diritti riservati
        </p>
      </div>
    </main>
  );
}
