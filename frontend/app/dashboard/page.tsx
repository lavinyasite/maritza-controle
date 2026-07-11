"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import MobileNav from "../../components/MobileNav";
import ShiftBadge from "../../components/ShiftBadge";

// ─── Traduções ───────────────────────────────
const T = {
  pt: {
    greeting: "Olá",
    thisMonth: "Turnos este mês",
    totalHours: "Horas totais",
    nextShift: "Próximo turno",
    daysOff: "Dias de folga",
    weekTitle: "Semana atual",
    activityTitle: "Últimas escalas importadas",
    days: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
    today: "Hoje",
    noShift: "Folga",
    statusOk: "Importado",
    statusPending: "Aguardando",
    hours: "horas",
    tomorrow: "Amanhã",
    notifications: "notificações",
    profile: "Perfil",
    home: "Início",
    calendar: "Calendário",
    alerts: "Avisos",
  },
  it: {
    greeting: "Ciao",
    thisMonth: "Turni questo mese",
    totalHours: "Ore totali",
    nextShift: "Prossimo turno",
    daysOff: "Giorni liberi",
    weekTitle: "Settimana corrente",
    activityTitle: "Ultime scale importate",
    days: ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],
    today: "Oggi",
    noShift: "Riposo",
    statusOk: "Importato",
    statusPending: "In attesa",
    hours: "ore",
    tomorrow: "Domani",
    notifications: "notifiche",
    profile: "Profilo",
    home: "Home",
    calendar: "Calendario",
    alerts: "Avvisi",
  },
};

// ─── Dados de demonstração ────────────────────
const DEMO_WORKER = "Maritza";

const DEMO_WEEK: { shift: "M" | "P" | "N" | "R" }[] = [
  { shift: "R" },
  { shift: "M" },
  { shift: "M" },
  { shift: "P" },
  { shift: "N" },
  { shift: "R" },
  { shift: "R" },
];

const DEMO_ACTIVITY = [
  { filename: "turni inviati A4 Agosto 26.pdf", date: "10/07/2026", status: "ok" },
  { filename: "turni inviati A4 Luglio 26.pdf", date: "05/06/2026", status: "ok" },
  { filename: "turni inviati A4 Giugno 26.pdf", date: "28/05/2026", status: "ok" },
];

const DEMO_STATS = {
  shifts: 18,
  hours: 144,
  nextShift: "14:00",
  daysOff: 6,
};

export default function DashboardPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"pt" | "it">("pt");
  const [activeTab, setActiveTab] = useState("home");
  const [today, setToday] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) { router.push("/login"); return; }
    const savedLang = (localStorage.getItem("cs_lang") || "pt") as "pt" | "it";
    setLang(savedLang);
    setToday(new Date().getDay()); // 0=dom, 1=seg...
  }, [router]);

  const t = T[lang];

  // Calcula qual dia da semana é hoje (0=dom) e alinha com a semana (index 0=dom)
  const todayIndex = today;

  // Iniciais do nome para o avatar
  const initials = DEMO_WORKER.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const toggleLang = () => {
    const next = lang === "pt" ? "it" : "pt";
    setLang(next);
    localStorage.setItem("cs_lang", next);
  };

  return (
    <div className={styles.container}>
      {/* ─── Header ─── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#e94560" strokeWidth="2"/>
              <path d="M20 10v10l6 4" stroke="#e94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="2" fill="#e94560"/>
            </svg>
            <div>
              <div className={styles.logoTitle}>Controllo Servizi</div>
              <div className={styles.logoSub}>{t.greeting}, {DEMO_WORKER}</div>
            </div>
          </div>

          {/* Direita: idioma + sino + avatar */}
          <div className={styles.headerRight}>
            <button
              id="btn-lang-toggle"
              className={styles.langToggle}
              onClick={toggleLang}
              aria-label="Trocar idioma"
            >
              {lang === "pt" ? "🇧🇷 PT" : "🇮🇹 IT"}
            </button>

            <button
              id="btn-notifications"
              className={styles.notifBell}
              aria-label={t.notifications}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className={styles.notifDot} aria-hidden="true"/>
            </button>

            <div className={styles.avatar} aria-label={`Avatar de ${DEMO_WORKER}`}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Conteúdo principal ─── */}
      <main className={styles.main}>

        {/* ─── Stats Grid ─── */}
        <section className={styles.statsGrid} aria-label="Resumo do mês">
          <div className={`${styles.statCard} ${styles.statAccent}`}>
            <span className={styles.statIcon}>📅</span>
            <div className={styles.statValue}>{DEMO_STATS.shifts}</div>
            <div className={styles.statLabel}>{t.thisMonth}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <span className={styles.statIcon}>⏱️</span>
            <div className={styles.statValue}>{DEMO_STATS.hours}</div>
            <div className={styles.statLabel}>{t.totalHours}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statOrange}`}>
            <span className={styles.statIcon}>🕑</span>
            <div className={styles.statValue}>{DEMO_STATS.nextShift}</div>
            <div className={styles.statLabel}>{t.nextShift}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <span className={styles.statIcon}>🌿</span>
            <div className={styles.statValue}>{DEMO_STATS.daysOff}</div>
            <div className={styles.statLabel}>{t.daysOff}</div>
          </div>
        </section>

        {/* ─── Semana atual ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.weekTitle}</h2>
          <div className={styles.weekRow} role="list" aria-label={t.weekTitle}>
            {DEMO_WEEK.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <div
                  key={i}
                  role="listitem"
                  className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ""}`}
                >
                  <div className={styles.dayName}>{t.days[i]}</div>
                  <div className={styles.dayDate}>{11 + i}</div>
                  <ShiftBadge type={day.shift} lang={lang} size="sm" />
                  {isToday && <div className={styles.todayDot} aria-label={t.today}/>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Escalas Importadas ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.activityTitle}</h2>
          <div className={styles.activityList}>
            {DEMO_ACTIVITY.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityName}>{item.filename}</div>
                  <div className={styles.activityDate}>{item.date}</div>
                </div>
                <span className={`${styles.statusBadge} ${item.status === "ok" ? styles.statusOk : styles.statusPending}`}>
                  {item.status === "ok" ? t.statusOk : t.statusPending}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ─── Navegação Mobile ─── */}
      <MobileNav
        lang={lang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={2}
      />
    </div>
  );
}
