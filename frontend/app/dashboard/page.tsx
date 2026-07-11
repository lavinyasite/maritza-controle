"use client";

import { useEffect, useState, useRef } from "react";
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
    alerts: "Análise",
    uploadTitle: "Importar Escala (PDF)",
    uploadDesc: "Arraste e solte o arquivo aqui ou clique para selecionar",
    uploadLoading: "Processando escala...",
    uploadSuccess: "Escala importada com sucesso!",
    uploadError: "Erro ao importar PDF.",
    searchPlaceholder: "Pesquisar por turno, anotação ou horário...",
    filterAll: "Todos os turnos",
    monthLabel: "Mês/Ano",
    noShiftsFound: "Nenhum turno encontrado para os filtros selecionados.",
    analyticsTitle: "Relatório de Trabalho",
    analyticsSub: "Estatísticas acumuladas do ano",
    statsAnnual: "Estatísticas Anuais",
    annualWorked: "Turnos trabalhados",
    annualHours: "Horas acumuladas",
    annualOff: "Dias de folga (ano)",
    curiosities: "Destaques do Trabalho",
    mostWorkedDayLabel: "Dia mais trabalhado",
    weekendsLabel: "Finais de Semana",
    weekendText: "Sábados: {sw} trab / {so} folg | Domingos: {suw} trab / {suo} folg",
    vacationsLabel: "Férias & Descanso",
    vacationStreak: "Férias detectadas: {d} dias seguidos (de {s} a {e})",
    noVacations: "Nenhum período longo de folga detectado no ano.",
    adminPanelBtn: "🛡️ Acessar Painel Admin",
    logoutBtn: "Sair da conta",
    roleAdmin: "Administrador",
    roleWorker: "Colaborador",
    langToggle: "Idioma",
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
    alerts: "Analisi",
    uploadTitle: "Importa Turni (PDF)",
    uploadDesc: "Trascina e rilascia il file qui o clicca per selezionare",
    uploadLoading: "Elaborazione file...",
    uploadSuccess: "Turni importati con successo!",
    uploadError: "Errore durante l'importazione del PDF.",
    searchPlaceholder: "Cerca turno, nota o orario...",
    filterAll: "Tutti i turni",
    monthLabel: "Mese/Anno",
    noShiftsFound: "Nessun turno trovato per i filtri selezionados.",
    analyticsTitle: "Rapporto di Lavoro",
    analyticsSub: "Statistiche accumulate dell'anno",
    statsAnnual: "Statistiche Annuali",
    annualWorked: "Turni lavorati",
    annualHours: "Ore accumulate",
    annualOff: "Giorni liberi (anno)",
    curiosities: "Dettagli di Lavoro",
    mostWorkedDayLabel: "Giorno più lavorato",
    weekendsLabel: "Fine Settimana",
    weekendText: "Sabato: {sw} lav / {so} lib | Domenica: {suw} lav / {suo} lib",
    vacationsLabel: "Ferie & Riposo",
    vacationStreak: "Ferie rilevate: {d} giorni consecutivi (da {s} a {e})",
    noVacations: "Nessun lungo periodo di riposo rilevato quest'anno.",
    adminPanelBtn: "🛡️ Accedi al Pannello Admin",
    logoutBtn: "Disconnetti",
    roleAdmin: "Amministratore",
    roleWorker: "Collaboratore",
    langToggle: "Lingua",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"pt" | "it">("pt");
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  
  // Estados de dados dinâmicos
  const [stats, setStats] = useState({ shifts_this_month: 0, total_hours: 0, next_shift: "—", days_off: 0 });
  const [week, setWeek] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [homeMonth, setHomeMonth] = useState<string>("");
  const [weekRefDate, setWeekRefDate] = useState<string>("");
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState("");
  
  // Filtros de busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const t = T[lang];

  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) { router.push("/login"); return; }
    const savedLang = (localStorage.getItem("cs_lang") || "pt") as "pt" | "it";
    setLang(savedLang);
    
    // Iniciar buscas
    fetchUserAndData();
  }, [router]);

  // Recarregar dados quando trocar de aba para manter tudo atualizado
  useEffect(() => {
    if (activeTab === "calendar") {
      fetchMyShifts();
    } else if (activeTab === "alerts") {
      fetchAnalytics();
    }
  }, [activeTab, selectedMonth, selectedShiftType]);

  const getToken = () => localStorage.getItem("cs_token") || "";

  async function fetchUserAndData() {
    setLoading(true);
    try {
      // 1. Get user profile
      const resUser = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!resUser.ok) throw new Error("Unauthorized");
      const userData = await resUser.json();
      setUser(userData);

      // 2. Get available months
      const resMonths = await fetch("/api/shifts/available-months", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      let monthsList: string[] = [];
      if (resMonths.ok) {
        const monthsData = await resMonths.json();
        monthsList = monthsData.months || [];
        setAvailableMonths(monthsList);
      }

      // Determine default month
      const currentMonthStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      };
      const defaultMonth = monthsList.length > 0 ? monthsList[0] : currentMonthStr();
      setHomeMonth(defaultMonth);
      setSelectedMonth(defaultMonth);

      // 3. Get monthly stats
      const resStats = await fetch(`/api/shifts/stats?month=${defaultMonth}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resStats.ok) setStats(await resStats.json());

      // 4. Get week shifts
      const initialWeekRef = `${defaultMonth}-15`;
      setWeekRefDate(initialWeekRef);
      const resWeek = await fetch(`/api/shifts/week?date_ref=${initialWeekRef}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resWeek.ok) {
        const weekData = await resWeek.json();
        setWeek(weekData.week || []);
      }

      // 5. Get upload history (for admin/upload logs)
      const resHist = await fetch("/api/schedules/history", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resHist.ok) {
        const histData = await resHist.json();
        setHistory(histData.schedules || []);
      }

    } catch (e) {
      localStorage.removeItem("cs_token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleHomeMonthChange(month: string) {
    setHomeMonth(month);
    setSelectedMonth(month);
    try {
      const resStats = await fetch(`/api/shifts/stats?month=${month}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resStats.ok) setStats(await resStats.json());

      const weekRef = `${month}-15`;
      setWeekRefDate(weekRef);
      const resWeek = await fetch(`/api/shifts/week?date_ref=${weekRef}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resWeek.ok) {
        const weekData = await resWeek.json();
        setWeek(weekData.week || []);
      }
    } catch { /* ignored */ }
  }

  async function changeWeek(offsetDays: number) {
    if (!weekRefDate) return;
    try {
      const parts = weekRefDate.split("-");
      const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dt.setDate(dt.getDate() + offsetDays);
      
      const newRef = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      setWeekRefDate(newRef);

      const resWeek = await fetch(`/api/shifts/week?date_ref=${newRef}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resWeek.ok) {
        const weekData = await resWeek.json();
        setWeek(weekData.week || []);
      }
    } catch { /* ignored */ }
  }

  const handlePrevWeek = () => changeWeek(-7);
  const handleNextWeek = () => changeWeek(7);

  async function fetchMyShifts() {
    try {
      let url = `/api/shifts/my-shifts?month=${selectedMonth}`;
      if (selectedShiftType) {
        url += `&shift_type=${selectedShiftType}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllShifts(data.shifts || []);
      }
    } catch { /* ignored */ }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/shifts/analytics?year=${new Date().getFullYear()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch { /* ignored */ }
  }

  const toggleLang = () => {
    const next = lang === "pt" ? "it" : "pt";
    setLang(next);
    localStorage.setItem("cs_lang", next);
  };

  // Upload PDF Handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  async function uploadFile(file: File) {
    setUploadStatus("loading");
    setUploadProgress(t.uploadLoading);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/schedules/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (res.ok) {
        setUploadStatus("success");
        fetchUserAndData(); // Recarrega dashboard
        setTimeout(() => setUploadStatus("idle"), 3000);
      } else {
        setUploadStatus("error");
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    } catch {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  }

  function handleLogout() {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_role");
    router.push("/login");
  }

  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CS";

  // Filtro de pesquisa de texto do calendário
  const filteredShifts = allShifts.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.notes && s.notes.toLowerCase().includes(term)) ||
      (s.start_time && s.start_time.includes(term)) ||
      (s.end_time && s.end_time.includes(term)) ||
      s.shift_type.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      {/* ─── Header ─── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#e94560" strokeWidth="2"/>
              <path d="M20 10v10l6 4" stroke="#e94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="2" fill="#e94560"/>
            </svg>
            <div>
              <div className={styles.logoTitle}>Controllo Servizi</div>
              {user && <div className={styles.logoSub}>{t.greeting}, {user.name}</div>}
            </div>
          </div>

          <div className={styles.headerRight}>
            <button id="btn-lang-toggle" className={styles.langToggle} onClick={toggleLang}>
              {lang === "pt" ? "🇧🇷 PT" : "🇮🇹 IT"}
            </button>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </div>
      </header>

      {/* ─── Loading State ─── */}
      {loading ? (
        <main className={styles.main} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div className={styles.uploadProgress}>⏳ Loading...</div>
        </main>
      ) : (
        <main className={styles.main}>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 1: INÍCIO (HOME)                                     */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "home" && (
            <>
              {/* Seletor de Mês da Dashboard */}
              <div className={styles.homeMonthSelector}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                  {lang === "pt" ? "📅 Escala de:" : "📅 Turni di:"}
                </span>
                <select
                  value={homeMonth}
                  onChange={(e) => handleHomeMonthChange(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    color: "#fff",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  {availableMonths.length === 0 ? (
                    homeMonth && (
                      <option value={homeMonth} style={{ color: "#fff", background: "#1e1e2d" }}>
                        {(() => {
                          const [year, month] = homeMonth.split("-");
                          const monthNamesPt = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                          const monthNamesIt = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                          const name = lang === "pt" ? monthNamesPt[parseInt(month) - 1] : monthNamesIt[parseInt(month) - 1];
                          return `${name} / ${year}`;
                        })()}
                      </option>
                    )
                  ) : (
                    availableMonths.map((m) => {
                      const [year, month] = m.split("-");
                      const monthNamesPt = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                      const monthNamesIt = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                      const name = lang === "pt" ? monthNamesPt[parseInt(month) - 1] : monthNamesIt[parseInt(month) - 1];
                      return <option key={m} value={m} style={{ color: "#fff", background: "#1e1e2d" }}>{`${name} / ${year}`}</option>;
                    })
                  )}
                </select>
              </div>

              {/* Stats Grid */}
              <section className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statAccent}`}>
                  <span className={styles.statIcon}>📅</span>
                  <div className={styles.statValue}>{stats.shifts_this_month}</div>
                  <div className={styles.statLabel}>{t.thisMonth}</div>
                </div>
                <div className={`${styles.statCard} ${styles.statBlue}`}>
                  <span className={styles.statIcon}>⏱️</span>
                  <div className={styles.statValue}>{stats.total_hours}</div>
                  <div className={styles.statLabel}>{t.totalHours}</div>
                </div>
                <div className={`${styles.statCard} ${styles.statOrange}`}>
                  <span className={styles.statIcon}>🕑</span>
                  <div className={styles.statValue}>{stats.next_shift}</div>
                  <div className={styles.statLabel}>{t.nextShift}</div>
                </div>
                <div className={`${styles.statCard} ${styles.statGreen}`}>
                  <span className={styles.statIcon}>🌿</span>
                  <div className={styles.statValue}>{stats.days_off}</div>
                  <div className={styles.statLabel}>{t.daysOff}</div>
                </div>
              </section>

              {/* Semana atual com Navegação */}
              <section className={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{t.weekTitle}</h2>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={handlePrevWeek}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                      }}
                      title="Semana Anterior"
                    >
                      ◀
                    </button>
                    <button 
                      onClick={handleNextWeek}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                      }}
                      title="Próxima Semana"
                    >
                      ▶
                    </button>
                  </div>
                </div>
                <div className={styles.weekRow}>
                  {week.map((day, i) => {
                    const isToday = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) === day.date;
                    return (
                      <div key={i} className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ""}`}>
                        <div className={styles.dayName}>{lang === "pt" ? day.day_pt : day.day_it}</div>
                        <div className={styles.dayDate}>{day.date.split("/")[0]}</div>
                        <ShiftBadge type={day.shift} lang={lang} size="sm" />
                        {day.time && (
                          <span 
                            style={{ 
                              fontSize: "8px", 
                              color: "rgba(255,255,255,0.5)", 
                              marginTop: 4, 
                              whiteSpace: "nowrap",
                              background: "rgba(255,255,255,0.04)",
                              padding: "2px 4px",
                              borderRadius: "4px"
                            }}
                          >
                            {day.time.replace(" - ", "-")}
                          </span>
                        )}
                        {isToday && <div className={styles.todayDot} />}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Admin Zone: Upload PDF */}
              {user?.role === "admin" && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>{t.uploadTitle}</h2>
                  <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept=".pdf"
                      onChange={handleFileUpload}
                    />
                    <div className={styles.uploadIcon}>
                      {uploadStatus === "loading" ? "⏳" : uploadStatus === "success" ? "✅" : uploadStatus === "error" ? "❌" : "📤"}
                    </div>
                    <div className={styles.uploadTitle}>
                      {uploadStatus === "loading" ? t.uploadLoading : uploadStatus === "success" ? t.uploadSuccess : uploadStatus === "error" ? t.uploadError : t.uploadTitle}
                    </div>
                    <div className={styles.uploadText}>{t.uploadDesc}</div>
                  </div>
                </section>
              )}

              {/* Histórico de escalas importadas (se houver) */}
              {history.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>{t.activityTitle}</h2>
                  <div className={styles.activityList}>
                    {history.map((item, i) => (
                      <div key={i} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div className={styles.activityInfo}>
                          <div className={styles.activityName}>{item.filename}</div>
                          <div className={styles.activityDate}>{new Date(item.date).toLocaleDateString(lang === "pt" ? "pt-BR" : "it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.statusOk}`}>
                          {item.shifts} turni
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 2: CALENDÁRIO / CONSULTA DE SERVIÇOS                 */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "calendar" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t.calendar}</h2>

              {/* Barra de pesquisa e Month selector */}
              <div className={styles.searchBar}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                  className={styles.monthInput}
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{ color: "#fff", background: "#1e1e2d", border: "1px solid var(--color-border)" }}
                >
                  {availableMonths.length === 0 ? (
                    selectedMonth && (
                      <option value={selectedMonth} style={{ color: "#fff", background: "#1e1e2d" }}>
                        {(() => {
                          const [year, month] = selectedMonth.split("-");
                          const monthNamesPt = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                          const monthNamesIt = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                          const name = lang === "pt" ? monthNamesPt[parseInt(month) - 1] : monthNamesIt[parseInt(month) - 1];
                          return `${name} / ${year}`;
                        })()}
                      </option>
                    )
                  ) : (
                    availableMonths.map((m) => {
                      const [year, month] = m.split("-");
                      const monthNamesPt = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                      const monthNamesIt = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                      const name = lang === "pt" ? monthNamesPt[parseInt(month) - 1] : monthNamesIt[parseInt(month) - 1];
                      return (
                        <option 
                          key={m} 
                          value={m}
                          style={{ color: "#fff", background: "#1e1e2d" }}
                        >
                          {`${name} / ${year}`}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Filtros rápidos por turno */}
              <div className={styles.filterRow}>
                <button
                  className={`${styles.filterBtn} ${selectedShiftType === "" ? styles.filterActive : ""}`}
                  onClick={() => setSelectedShiftType("")}
                >
                  🌐 {t.filterAll}
                </button>
                <button
                  className={`${styles.filterBtn} ${selectedShiftType === "M" ? styles.filterActive : ""}`}
                  onClick={() => setSelectedShiftType("M")}
                >
                  ☀️ Mattino
                </button>
                <button
                  className={`${styles.filterBtn} ${selectedShiftType === "P" ? styles.filterActive : ""}`}
                  onClick={() => setSelectedShiftType("P")}
                >
                  ⛅ Pomeriggio
                </button>
                <button
                  className={`${styles.filterBtn} ${selectedShiftType === "N" ? styles.filterActive : ""}`}
                  onClick={() => setSelectedShiftType("N")}
                >
                  🌙 Notte
                </button>
                <button
                  className={`${styles.filterBtn} ${selectedShiftType === "R" ? styles.filterActive : ""}`}
                  onClick={() => setSelectedShiftType("R")}
                >
                  🌿 Riposo
                </button>
              </div>

              {/* Tabela/Lista de Turnos */}
              <div className={styles.shiftsTable}>
                {filteredShifts.length === 0 ? (
                  <div className={styles.empty}>{t.noShiftsFound}</div>
                ) : (
                  filteredShifts.map((s, idx) => {
                    const dt = new Date(s.date);
                    const dayLabel = dt.toLocaleDateString(lang === "pt" ? "pt-BR" : "it-IT", { weekday: "short" }).toUpperCase();
                    const formattedDate = dt.toLocaleDateString(lang === "pt" ? "pt-BR" : "it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
                    
                    return (
                      <div key={s.id || idx} className={styles.tableRow}>
                        <div className={styles.rowDate}>
                          <span className={styles.rowDateStrong}>{formattedDate}</span>
                          <span>{dayLabel}</span>
                        </div>
                        <ShiftBadge type={s.shift_type} lang={lang} size="sm" />
                        <div className={styles.rowInfo}>
                          {s.start_time ? (
                            <div className={styles.rowHours}>⏰ {s.start_time} - {s.end_time}</div>
                          ) : (
                            <div className={styles.rowHours}>🌿 {lang === "pt" ? "Folga" : "Riposo"}</div>
                          )}
                          {s.duration_hours && <div style={{ fontSize: 10 }}>{s.duration_hours} {t.hours}</div>}
                          {s.notes && <div className={styles.rowNotes}>📝 {s.notes}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 3: RELATÓRIOS E ANALYTICS INTELEGENTES                */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "alerts" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t.analyticsTitle}</h2>
              <p className={styles.subtitle} style={{ marginTop: -10 }}>{t.analyticsSub}</p>

              {analytics && (
                <div className={styles.analyticsGrid}>
                  {/* Card Consolidado Geral */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsHeader}>
                      <span className={styles.analyticsIcon}>📊</span>
                      <span>{t.statsAnnual} ({analytics.year})</span>
                    </div>
                    <div className={styles.statMetric}>
                      <span className={styles.metricLabel}>{t.annualWorked}</span>
                      <span className={styles.metricValue}>{analytics.total_shifts}</span>
                    </div>
                    <div className={styles.statMetric}>
                      <span className={styles.metricLabel}>{t.annualHours}</span>
                      <span className={styles.metricValue}>{analytics.total_hours?.toFixed(1)} hrs</span>
                    </div>
                    <div className={styles.statMetric}>
                      <span className={styles.metricLabel}>{t.annualOff}</span>
                      <span className={styles.metricValue}>{analytics.total_days_off}</span>
                    </div>
                  </div>

                  {/* Card Destaques e Curiosidades */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsHeader}>
                      <span className={styles.analyticsIcon}>✨</span>
                      <span>{t.curiosities}</span>
                    </div>
                    <div className={styles.statMetric}>
                      <span className={styles.metricLabel}>{t.mostWorkedDayLabel}</span>
                      <span className={`${styles.metricValue} ${styles.metricValueHighlight}`}>
                        {lang === "pt" ? analytics.most_worked_day?.pt : analytics.most_worked_day?.it} ({analytics.most_worked_day?.count}x)
                      </span>
                    </div>
                    <div className={styles.statMetric}>
                      <span className={styles.metricLabel}>{t.weekendsLabel}</span>
                      <span className={styles.metricValue}>
                        {t.weekendText
                          .replace("{sw}", String(analytics.weekends?.saturday_worked ?? 0))
                          .replace("{so}", String(analytics.weekends?.saturday_off ?? 0))
                          .replace("{suw}", String(analytics.weekends?.sunday_worked ?? 0))
                          .replace("{suo}", String(analytics.weekends?.sunday_off ?? 0))}
                      </span>
                    </div>
                  </div>

                  {/* Card Férias & Descanso Prolongado */}
                  <div className={styles.analyticsCard} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.analyticsHeader}>
                      <span className={styles.analyticsIcon}>🌴</span>
                      <span>{t.vacationsLabel}</span>
                    </div>
                    {analytics.vacations?.length === 0 ? (
                      <div className={styles.empty} style={{ padding: "10px 0" }}>{t.noVacations}</div>
                    ) : (
                      analytics.vacations?.map((v: any, idx: number) => {
                        const startStr = new Date(v.start).toLocaleDateString(lang === "pt" ? "pt-BR" : "it-IT");
                        const endStr = new Date(v.end).toLocaleDateString(lang === "pt" ? "pt-BR" : "it-IT");
                        return (
                          <div key={idx} className={styles.vacationItem}>
                            <span className={styles.vacationLabel}>🏝️ {v.days} {lang === "pt" ? "Dias" : "Giorni"}</span>
                            <span className={styles.vacationDate}>{startStr} {lang === "pt" ? "até" : "al"} {endStr}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 4: PERFIL E AJUSTES                                  */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t.profile}</h2>

              {user && (
                <div className={styles.profileCard}>
                  <div className={styles.profileAvatar}>{initials}</div>
                  <div>
                    <h3 className={styles.profileName}>{user.name}</h3>
                    <div className={styles.profileEmail}>{user.email}</div>
                    <span className={styles.profileRole}>
                      {user.role === "admin" ? t.roleAdmin : t.roleWorker}
                    </span>
                  </div>

                  {/* Acesso ao painel administrador (se for admin) */}
                  {user.role === "admin" && (
                    <button className={styles.adminBtn} onClick={() => router.push("/admin")}>
                      🛡️ {t.adminPanelBtn}
                    </button>
                  )}

                  {/* Logout */}
                  <button className={styles.logoutBtn} onClick={handleLogout}>
                    🚪 {t.logoutBtn}
                  </button>
                </div>
              )}
            </section>
          )}

        </main>
      )}

      {/* ─── Bottom Navigation ─── */}
      <MobileNav
        lang={lang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={0}
      />
    </div>
  );
}
