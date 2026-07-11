"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

const TRANSLATIONS = {
  pt: {
    title: "Entrar",
    subtitle: "Acesse sua escala de serviço",
    email: "E-mail",
    password: "Senha",
    emailPlaceholder: "seu@email.com",
    passwordPlaceholder: "••••••••",
    submit: "Entrar",
    loading: "Entrando...",
    forgotPassword: "Esqueci minha senha",
    noAccount: "Não tem conta?",
    register: "Solicitar acesso",
    errorEmpty: "Preencha todos os campos",
    errorInvalid: "E-mail ou senha incorretos",
    welcome: "Bem-vindo de volta",
  },
  it: {
    title: "Accedi",
    subtitle: "Accedi alla tua scala di servizio",
    email: "Email",
    password: "Password",
    emailPlaceholder: "tua@email.com",
    passwordPlaceholder: "••••••••",
    submit: "Accedi",
    loading: "Accesso...",
    forgotPassword: "Password dimenticata",
    noAccount: "Non hai un account?",
    register: "Richiedi accesso",
    errorEmpty: "Compila tutti i campi",
    errorInvalid: "Email o password errati",
    welcome: "Bentornato",
  },
};

// ─── Componente interno (usa useSearchParams — deve estar dentro de Suspense) ───
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getLang = (): "pt" | "it" => {
    const p = searchParams.get("lang");
    if (p === "pt" || p === "it") return p;
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("cs_lang");
      if (s === "pt" || s === "it") return s;
    }
    return "pt";
  };

  const lang = getLang();
  const t = TRANSLATIONS[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t.errorEmpty);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("cs_token", data.access_token);
        localStorage.setItem("cs_lang", lang);
        router.push("/dashboard");
      } else {
        setError(t.errorInvalid);
      }
    } catch {
      // Demo mode — entra direto no dashboard
      localStorage.setItem("cs_token", "demo-token");
      localStorage.setItem("cs_lang", lang);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.bgOrb} />

      <button
        id="btn-back-lang"
        className={styles.backBtn}
        onClick={() => router.push("/")}
        aria-label="Voltar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#e94560" strokeWidth="2"/>
              <path d="M20 10v10l6 4" stroke="#e94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="2" fill="#e94560"/>
            </svg>
          </div>
          <h1 className={styles.title}>{t.welcome}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className="input-label">{t.email}</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                className={`input ${styles.inputPadded}`}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                enterKeyHint="next"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className="input-label">{t.password}</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                enterKeyHint="done"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {t.loading}
              </>
            ) : t.submit}
          </button>
        </form>

        <div className={styles.links}>
          <button id="btn-forgot-password" className="btn btn-ghost btn-sm" type="button">
            {t.forgotPassword}
          </button>
          <div className={styles.divider} />
          <p className={styles.registerText}>
            {t.noAccount}{" "}
            <button id="btn-request-access" className={styles.registerLink} type="button">
              {t.register}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Export com Suspense obrigatório para useSearchParams ─────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#e94560", fontSize: "1.5rem" }}>⏳</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
