"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

const T = {
  pt: {
    title: "Solicitar Acesso",
    subtitle: "Preencha os dados e aguarde a aprovação",
    name: "Nome completo",
    namePlaceholder: "Seu nome completo",
    email: "E-mail",
    emailPlaceholder: "seu@email.com",
    password: "Senha",
    passwordPlaceholder: "Mínimo 6 caracteres",
    lang: "Idioma preferido",
    submit: "Solicitar Acesso",
    loading: "Enviando...",
    successTitle: "Solicitação enviada! ✅",
    successText: "O administrador irá aprovar seu acesso em breve. Você receberá confirmação.",
    backToLogin: "Voltar ao login",
    errorExists: "Este e-mail já está cadastrado.",
    errorGeneral: "Erro ao enviar. Tente novamente.",
    loginLink: "Já tem conta?",
    loginBtn: "Entrar",
  },
  it: {
    title: "Richiedi Accesso",
    subtitle: "Compila i dati e attendi l'approvazione",
    name: "Nome completo",
    namePlaceholder: "Il tuo nome completo",
    email: "Email",
    emailPlaceholder: "tua@email.com",
    password: "Password",
    passwordPlaceholder: "Minimo 6 caratteri",
    lang: "Lingua preferita",
    submit: "Richiedi Accesso",
    loading: "Invio in corso...",
    successTitle: "Richiesta inviata! ✅",
    successText: "L'amministratore approverà il tuo accesso a breve.",
    backToLogin: "Torna al login",
    errorExists: "Questa email è già registrata.",
    errorGeneral: "Errore durante l'invio. Riprova.",
    loginLink: "Hai già un account?",
    loginBtn: "Accedi",
  },
};

function RegisterContent() {
  const router = useRouter();
  const [lang, setLang] = useState<"pt" | "it">("it");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const t = T[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres / Password minima 6 caratteri");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, lang }),
      });
      if (res.ok) {
        setSuccess(true);
      } else if (res.status === 409) {
        setError(t.errorExists);
      } else {
        setError(t.errorGeneral);
      }
    } catch {
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className={styles.container}>
        <div className={styles.bgOrb} />
        <div className={styles.card}>
          <div className={styles.successIcon}>🎉</div>
          <h1 className={styles.title}>{t.successTitle}</h1>
          <p className={styles.successText}>{t.successText}</p>
          <button className={styles.backBtn} onClick={() => router.push("/login")}>
            ← {t.backToLogin}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.bgOrb} />

      <div className={styles.card}>
        {/* Lang switcher */}
        <div className={styles.langRow}>
          <button
            className={`${styles.langBtn} ${lang === "pt" ? styles.langActive : ""}`}
            onClick={() => setLang("pt")} type="button"
          >🇧🇷 PT</button>
          <button
            className={`${styles.langBtn} ${lang === "it" ? styles.langActive : ""}`}
            onClick={() => setLang("it")} type="button"
          >🇮🇹 IT</button>
        </div>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#e94560" strokeWidth="2"/>
              <path d="M20 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" fill="#e94560" opacity=".2" stroke="#e94560" strokeWidth="1.5"/>
              <path d="M10 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#e94560" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="reg-name">{t.name}</label>
            <input
              id="reg-name"
              type="text"
              className={styles.input}
              placeholder={t.namePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
              required autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-email">{t.email}</label>
            <input
              id="reg-email"
              type="email"
              className={styles.input}
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="reg-password">{t.password}</label>
            <input
              id="reg-password"
              type="password"
              className={styles.input}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={6}
            />
          </div>

          {error && (
            <div className={styles.errorMsg}>⚠️ {error}</div>
          )}

          <button
            id="btn-register-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? `⏳ ${t.loading}` : t.submit}
          </button>
        </form>

        <p className={styles.loginLink}>
          {t.loginLink}{" "}
          <button className={styles.loginBtn} type="button" onClick={() => router.push("/login")}>
            {t.loginBtn}
          </button>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#e94560" }}>⏳</div></main>}>
      <RegisterContent />
    </Suspense>
  );
}
