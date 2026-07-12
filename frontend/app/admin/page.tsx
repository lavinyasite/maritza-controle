"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

const T = {
  pt: {
    title: "Painel Admin",
    subtitle: "Gestão & Analítico 360",
    tabs: { pending: "Pendentes", all: "Todos", create: "Criar Usuário", email: "Robô de E-mail", analytics360: "Painel 360", ai_chat: "🚀 Assistente IA" },
    name: "Nome", email: "E-mail", lang: "Idioma", role: "Função",
    password: "Senha", confirm: "Confirmar Senha",
    approve: "Aprovar", block: "Bloquear", remove: "Remover",
    create: "Criar", back: "Voltar",
    pending_empty: "Nenhuma solicitação pendente",
    all_empty: "Nenhum usuário cadastrado",
    roles: { admin: "Admin", worker: "Trabalhador", pending: "Pendente", blocked: "Bloqueado" },
    langs: { pt: "Português", it: "Italiano" },
    created: "Solicitou em",
    approved: "Aprovado em",
    success_approve: "Usuário aprovado!",
    success_create: "Usuário criado!",
    success_block: "Usuário bloqueado.",
    success_remove: "Usuário removido.",
    error: "Erro. Tente novamente.",
    nameHolder: "Nome completo",
    emailHolder: "email@exemplo.com",
    passHolder: "Senha segura",
    emailSettingsTitle: "Monitor de E-mails do Yahoo",
    emailSettingsDesc: "Configure a conta do Yahoo que recebe as escalas da empresa em formato PDF. O robô vai ler a caixa de entrada a cada 10 minutos, processar o PDF com IA e atualizar os turnos de todos de forma automática.",
    appPassLabel: "Senha de Aplicativo Yahoo",
    appPassDesc: "Atenção: Não use sua senha normal de login do Yahoo. Você precisa entrar na Segurança da Conta do Yahoo e clicar em 'Gerar Senha de Aplicativo'.",
    imapServerLabel: "Servidor IMAP",
    imapPortLabel: "Porta IMAP",
    saveEmailBtn: "Salvar e Ativar Robô",
    testConnectionLabel: "Testando conexão com o Yahoo... ⏳",
    successSaveEmail: "Robô ativado com sucesso! Primeira varredura disparada.",
    botStatusActive: "Robô Ativo e Monitorando",
    botStatusInactive: "Robô Desativado",
    lastCheckedLabel: "Última varredura",
    notConfigured: "Nenhum e-mail configurado ainda.",
    importHistBtn: "📥 Importar Todo o Histórico de E-mails",
    importHistLoading: "⏳ Varrendo todos os e-mails... pode demorar alguns minutos",
    importHistDesc: "Lê TODOS os e-mails já enviados pela Francesca (sem limite de data). Seguro: nunca duplica dados já existentes.",
    importHistSuccess: "✅ Importação concluída!",
    importHistError: "❌ Erro na importação. Verifique o robô de e-mail.",
    permissionsLabel: "Permissões de Admin",
    fullControl: "Poder Total",
    readOnly: "Apenas Leitura",
    selectWorker: "Selecionar Trabalhador",
    summaryTitle: "Visão Comparativa de Trabalho",
    mostWorked: "Quem Mais Trabalhou",
    leastWorked: "Quem Menos Trabalhou",
    totalShifts: "Total de Turnos",
    totalHours: "Total de Horas",
    workerDetailTitle: "Relatório Analítico 360",
    daysWorked: "Dias Trabalhados",
    daysOff: "Dias de Folga",
    mostWorkedDay: "Dia Mais Escaldo",
    saturdays: "Sábados",
    sundays: "Domingos",
    vacationsTitle: "Folgas Prolongadas (4+ dias)",
    noVacations: "Nenhuma folga prolongada registrada.",
    vacationFrom: "De",
    vacationTo: "Até",
    vacationDays: "dias",
    creatorBadge: "CRIADOR DO PROJETO",
    adminPowerLabel: "Nível de Permissão",
    aiTitle: "Assistente Inteligente de IA",
    aiDesc: "Peça orientações, calcule recomposição de escalas ou simule alterações. A IA propõe ações que você revisa e decide se quer aplicar no banco de dados.",
    aiInputHolder: "Escreva sua mensagem ou escolha um preset abaixo...",
    aiSendBtn: "Enviar",
    aiPreset1: "⚖️ Equilibrar carga horária de todos",
    aiPreset2: "🌴 Calcular recomposição de férias/folgas",
    aiPreset3: "📅 Simular folgas extras semanais",
    aiProposedChanges: "Ações Sugeridas pela IA (Aprovação Pendente)",
    aiApplyProposed: "Aprovar e Aplicar no Banco de Dados",
    aiApplySuccess: "Alterações aplicadas com sucesso!",
    readOnlyWarning: "Você está em modo Apenas Leitura. Não pode aplicar propostas de alteração.",
  },
  it: {
    title: "Pannello Admin",
    subtitle: "Gestione & Analitica 360",
    tabs: { pending: "In Attesa", all: "Tutti", create: "Crea Utente", email: "Bot Email", analytics360: "Pannello 360", ai_chat: "🚀 Assistente IA" },
    name: "Nome", email: "Email", lang: "Lingua", role: "Ruolo",
    password: "Password", confirm: "Conferma Password",
    approve: "Approva", block: "Blocca", remove: "Rimuovi",
    create: "Crea", back: "Indietro",
    pending_empty: "Nessuna richiesta in attesa",
    all_empty: "Nessun utente registrato",
    roles: { admin: "Admin", worker: "Lavoratore", pending: "In Attesa", blocked: "Bloccato" },
    langs: { pt: "Portoghese", it: "Italiano" },
    created: "Richiesto il",
    approved: "Approvato il",
    success_approve: "Utente approvato!",
    success_create: "Utente creato!",
    success_block: "Utente bloccato.",
    success_remove: "Utente rimosso.",
    error: "Errore. Riprova.",
    nameHolder: "Nome completo",
    emailHolder: "email@esempio.com",
    passHolder: "Password sicura",
    emailSettingsTitle: "Monitor Email Yahoo",
    emailSettingsDesc: "Configura l'account Yahoo che riceve le scale in formato PDF. Il bot leggerà la posta in arrivo ogni 10 minuti, elaborerà il PDF con l'IA e aggiornerà i turni di tutti in modo automatico.",
    appPassLabel: "Password dell'applicazione Yahoo",
    appPassDesc: "Attenzione: Non usare la tua password di accesso normale Yahoo. Devi andare su Sicurezza account di Yahoo e fare clic su 'Genera password dell'applicazione'.",
    imapServerLabel: "Server IMAP",
    imapPortLabel: "Porta IMAP",
    saveEmailBtn: "Salva e Attiva Bot",
    testConnectionLabel: "Test di connessione a Yahoo in corso... ⏳",
    successSaveEmail: "Bot attivato con successo! Prima scansione avviata.",
    botStatusActive: "Bot Attivo e in Scansione",
    botStatusInactive: "Bot Disattivato",
    lastCheckedLabel: "Ultima scansione",
    notConfigured: "Nessuna email configurata.",
    importHistBtn: "📥 Importa Tutto lo Storico Email",
    importHistLoading: "⏳ Scansione di tutta la posta... può richiedere alcuni minuti",
    importHistDesc: "Legge TUTTE le email già inviate da Francesca (senza limite di data). Sicuro: non duplica mai i dati esistenti.",
    importHistSuccess: "✅ Importazione completata!",
    importHistError: "❌ Errore nell'importazione. Controlla il bot email.",
    permissionsLabel: "Permessi Admin",
    fullControl: "Controllo Completo",
    readOnly: "Solo Lettura",
    selectWorker: "Seleziona Lavoratore",
    summaryTitle: "Panoramica Comparativa",
    mostWorked: "Chi ha Lavorato di Più",
    leastWorked: "Chi ha Lavorato di Meno",
    totalShifts: "Turni Totali",
    totalHours: "Ore Totali",
    workerDetailTitle: "Rapporto Analitico 360",
    daysWorked: "Giorni Lavorati",
    daysOff: "Giorni Liberi",
    mostWorkedDay: "Giorno più Frequente",
    saturdays: "Sabato",
    sundays: "Domenica",
    vacationsTitle: "Ferie / Pause (4+ giorni)",
    noVacations: "Nessuna pausa prolungata registrata.",
    vacationFrom: "Dal",
    vacationTo: "Al",
    vacationDays: "giorni",
    creatorBadge: "CREATORE PROGETTO",
    adminPowerLabel: "Livello Permessi",
    aiTitle: "Assistente IA Intelligente",
    aiDesc: "Chiedi linee guida, calcola la compensazione dei turni o simula variazioni. L'IA propone azioni che potrai rivedere e approvare prima di scriverle nel database.",
    aiInputHolder: "Scrivi un messaggio o scegli un preset qui sotto...",
    aiSendBtn: "Invia",
    aiPreset1: "⚖️ Bilanciare le ore di lavoro di tutti",
    aiPreset2: "🌴 Calcola compensazione ferie/riposi",
    aiPreset3: "📅 Simula riposi extra settimanali",
    aiProposedChanges: "Azioni Proposte dall'IA (Approvazione in Sospeso)",
    aiApplyProposed: "Approva e Applica nel Database",
    aiApplySuccess: "Modifiche applicate con successo!",
    readOnlyWarning: "Sei in modalità Solo Lettura. Non puoi applicare proposte di modifica.",
  },
};

function roleBadge(role: string) {
  const colors: Record<string, string> = {
    admin: "#a78bfa", worker: "#34d399", pending: "#fbbf24", blocked: "#f87171",
  };
  return (
    <span style={{
      background: colors[role] || "#6b7280",
      color: "#0f0f1a", borderRadius: 6, padding: "2px 10px",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    }}>{role.toUpperCase()}</span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"pt" | "it">("pt");
  const [tab, setTab] = useState<"pending" | "all" | "create" | "email" | "analytics360" | "ai_chat">("pending");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  
  // Logged in user info
  const [currentUser, setCurrentUser] = useState<any>(null);

  // States para formulário de usuário
  const [form, setForm] = useState({ name: "", email: "", password: "", lang: "it", role: "worker", admin_permissions: "full_control" });
  const [submitting, setSubmitting] = useState(false);

  // States para Robô de e-mail
  const [emailForm, setEmailForm] = useState({ email: "", app_password: "", imap_server: "imap.mail.yahoo.com", imap_port: 993, active: true });
  const [botStatus, setBotStatus] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // States para importação histórica
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // States para Painel 360
  const [workersList, setWorkersList] = useState<string[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [comparativeStats, setComparativeStats] = useState<any>(null);
  const [workerAnalytics, setWorkerAnalytics] = useState<any>(null);
  const [loading360, setLoading360] = useState(false);

  // States para Assistente de IA
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [proposedActions, setProposedActions] = useState<any[]>([]);
  const [applyLoading, setApplyLoading] = useState(false);

  async function handleSendAiMessage(messageText?: string) {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim() || aiLoading) return;
    
    setProposedActions([]);
    
    const userMsg = { role: "user", content: textToSend };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    if (!messageText) setChatInput("");
    setAiLoading(true);
    
    try {
      const res = await fetch("/api/admin/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
        if (data.proposed_actions && data.proposed_actions.length > 0) {
          setProposedActions(data.proposed_actions);
        }
      } else {
        const d = await res.json();
        showToast(d.detail || t.error);
      }
    } catch {
      showToast(t.error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleApplyProposedActions() {
    if (proposedActions.length === 0 || applyLoading) return;
    if (currentUser?.admin_permissions === "read_only") {
      showToast(t.readOnlyWarning);
      return;
    }
    
    setApplyLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assistant/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ actions: proposedActions })
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast(lang === "pt" ? data.message : "Modifiche applicate con successo!");
        setProposedActions([]);
        fetch360Data();
      } else {
        const d = await res.json();
        showToast(d.detail || t.error);
      }
    } catch {
      showToast(t.error);
    } finally {
      setApplyLoading(false);
    }
  }

  const t = T[lang];

  useEffect(() => {
    const l = localStorage.getItem("cs_lang") as "pt" | "it";
    if (l === "pt" || l === "it") setLang(l);
    fetchCurrentUser();
    fetchUsers();
    fetchEmailSettings();
  }, []);

  useEffect(() => {
    if (tab === "analytics360") {
      fetch360Data();
    }
  }, [tab, selectedYear]);

  useEffect(() => {
    if (tab === "analytics360" && selectedWorker) {
      fetchWorkerAnalytics(selectedWorker);
    }
  }, [tab, selectedWorker, selectedYear]);

  const getToken = () => localStorage.getItem("cs_token") || "";

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch { /* ignored */ }
  }

  async function fetch360Data() {
    setLoading360(true);
    try {
      // 1. Obter trabalhadores
      const resWorkers = await fetch("/api/admin/workers", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resWorkers.ok) {
        const d = await resWorkers.json();
        setWorkersList(d.workers || []);
        if (d.workers && d.workers.length > 0 && !selectedWorker) {
          setSelectedWorker(d.workers[0]);
        }
      }
      // 2. Obter estatísticas comparativas
      const resComp = await fetch(`/api/admin/all-workers-stats?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (resComp.ok) {
        setComparativeStats(await resComp.json());
      }
    } catch { /* ignored */ }
    finally { setLoading360(false); }
  }

  async function fetchWorkerAnalytics(worker: string) {
    try {
      const res = await fetch(`/api/admin/worker-analytics?worker_name=${encodeURIComponent(worker)}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setWorkerAnalytics(await res.json());
      }
    } catch { /* ignored */ }
  }

  async function updatePermissions(id: string, perms: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ admin_permissions: perms }),
      });
      if (res.ok) {
        showToast(lang === "pt" ? "Permissões atualizadas!" : "Permessi aggiornati!");
        fetchUsers();
      } else {
        const d = await res.json();
        showToast(d.detail || t.error);
      }
    } catch { showToast(t.error); }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 403 || res.status === 401) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch { /* ignored */ }
    finally { setLoading(false); }
  }

  async function fetchEmailSettings() {
    try {
      const res = await fetch("/api/admin/email-settings", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
        if (data.configured) {
          setEmailForm({
            email: data.email,
            app_password: "", // Não trazer no formulário por segurança
            imap_server: data.imap_server,
            imap_port: data.imap_port,
            active: data.active
          });
        }
      }
    } catch { /* ignored */ }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function approve(id: string) {
    try {
      await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast(t.success_approve);
      fetchUsers();
    } catch { showToast(t.error); }
  }

  async function block(id: string) {
    try {
      await fetch(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast(t.success_block);
      fetchUsers();
    } catch { showToast(t.error); }
  }

  async function remove(id: string) {
    if (!confirm("Confirmar remoção?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast(t.success_remove);
      fetchUsers();
    } catch { showToast(t.error); }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(t.success_create);
        setForm({ name: "", email: "", password: "", lang: "it", role: "worker", admin_permissions: "full_control" });
        setTab("all");
        fetchUsers();
      } else {
        const d = await res.json();
        showToast(d.detail || t.error);
      }
    } catch { showToast(t.error); }
    finally { setSubmitting(false); }
  }

  async function saveEmailSettings(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(emailForm),
      });
      if (res.ok) {
        showToast(t.successSaveEmail);
        fetchEmailSettings();
      } else {
        const d = await res.json();
        showToast(d.detail || t.error);
      }
    } catch {
      showToast(t.error);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleImportHistory() {
    if (!confirm(lang === "pt" ? "Isso pode demorar alguns minutos. Continuar?" : "Questo potrebbe richiedere alcuni minuti. Continuare?")) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/email-import-history", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult({ ok: true, ...data });
        showToast(t.importHistSuccess);
      } else {
        setImportResult({ ok: false, message: data.detail || t.importHistError });
        showToast(t.importHistError);
      }
    } catch {
      setImportResult({ ok: false, message: t.importHistError });
      showToast(t.importHistError);
    } finally {
      setImportLoading(false);
    }
  }

  const pending = users.filter(u => u.role === "pending");
  const displayed = tab === "pending" ? pending : tab === "all" ? users : [];

  function formatDate(dt: string) {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <main className={styles.page}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push("/dashboard")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={18} height={18}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <div className={styles.badge}>
            {pending.length > 0 && (
              <span className={styles.pendingCount}>{pending.length}</span>
            )}
            🛡️ Admin
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["pending", "all", "create", "email", "analytics360", "ai_chat"] as const).map(tb => (
            <button
              key={tb}
              className={`${styles.tab} ${tab === tb ? styles.tabActive : ""}`}
              onClick={() => setTab(tb)}
            >
              {tb === "pending" && pending.length > 0 && (
                <span className={styles.tabBadge}>{pending.length}</span>
              )}
              {t.tabs[tb]}
            </button>
          ))}
        </div>

        {/* User List */}
        {(tab === "pending" || tab === "all") && (
          <div className={styles.list}>
            {loading ? (
              <div className={styles.empty}>⏳</div>
            ) : displayed.length === 0 ? (
              <div className={styles.empty}>
                {tab === "pending" ? t.pending_empty : t.all_empty}
              </div>
            ) : displayed.map(u => (
              <div key={u.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.avatar}>{u.name[0]?.toUpperCase()}</div>
                  <div>
                    <div className={styles.userName}>{u.name}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                    <div className={styles.userMeta}>
                      {roleBadge(u.role)}
                      <span className={styles.metaText}>
                        {u.lang === "it" ? "🇮🇹" : "🇧🇷"} {t.created}: {formatDate(u.created_at)}
                      </span>
                    </div>
                    {u.role === "admin" && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                        <span style={{
                          background: u.is_creator === 1 ? "rgba(167, 139, 250, 0.15)" : "rgba(255, 255, 255, 0.08)",
                          color: u.is_creator === 1 ? "#c084fc" : "#9ca3af",
                          border: u.is_creator === 1 ? "1px solid rgba(167, 139, 250, 0.3)" : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700
                        }}>
                          {u.is_creator === 1 ? t.creatorBadge : u.admin_permissions === "read_only" ? t.readOnly.toUpperCase() : t.fullControl.toUpperCase()}
                        </span>
                        
                        {currentUser?.is_creator === 1 && u.is_creator !== 1 && (
                          <select
                            style={{
                              background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: 6, padding: "2px 6px", fontSize: 10, cursor: "pointer", outline: "none"
                            }}
                            value={u.admin_permissions || "full_control"}
                            onChange={(e) => updatePermissions(u.id, e.target.value)}
                          >
                            <option value="full_control">{t.fullControl}</option>
                            <option value="read_only">{t.readOnly}</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {u.role === "pending" && (
                    <button className={styles.btnApprove} onClick={() => approve(u.id)}>
                      ✅ {t.approve}
                    </button>
                  )}
                  {u.role === "worker" && (
                    <button className={styles.btnBlock} onClick={() => block(u.id)}>
                      🚫 {t.block}
                    </button>
                  )}
                  {(u.role !== "admin" || (currentUser?.is_creator === 1 && u.is_creator !== 1)) && (
                    <button className={styles.btnRemove} onClick={() => remove(u.id)}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create User Form */}
        {tab === "create" && (
          <form className={styles.form} onSubmit={createUser}>
            <div className={styles.formRow}>
              <label>{t.name}</label>
              <input
                className={styles.input}
                placeholder={t.nameHolder}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>{t.email}</label>
              <input
                type="email"
                className={styles.input}
                placeholder={t.emailHolder}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>{t.password}</label>
              <input
                type="password"
                className={styles.input}
                placeholder={t.passHolder}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>{t.lang}</label>
              <select className={styles.input} value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })}>
                <option value="it">🇮🇹 {t.langs.it}</option>
                <option value="pt">🇧🇷 {t.langs.pt}</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>{t.role}</label>
              <select className={styles.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="worker">{t.roles.worker}</option>
                <option value="admin">{t.roles.admin}</option>
              </select>
            </div>
            {form.role === "admin" && (
              <div className={styles.formRow}>
                <label>{t.adminPowerLabel}</label>
                <select className={styles.input} value={form.admin_permissions} onChange={e => setForm({ ...form, admin_permissions: e.target.value })}>
                  <option value="full_control">{t.fullControl}</option>
                  <option value="read_only">{t.readOnly}</option>
                </select>
              </div>
            )}
            <button className={styles.btnCreate} type="submit" disabled={submitting}>
              {submitting ? "⏳..." : `✅ ${t.create}`}
            </button>
          </form>
        )}

        {/* Email Settings Tab */}
        {tab === "email" && (
          <form className={styles.form} onSubmit={saveEmailSettings}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                {t.emailSettingsTitle}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: "4px 0 16px", lineHeight: 1.4 }}>
                {t.emailSettingsDesc}
              </p>

              {botStatus && (
                <div style={{
                  background: botStatus.configured && botStatus.active ? "rgba(52, 211, 153, 0.08)" : "rgba(255, 255, 255, 0.04)",
                  border: botStatus.configured && botStatus.active ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: 14, marginBottom: 20, fontSize: "0.8rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>Status:</span>
                    <span style={{
                      color: botStatus.configured && botStatus.active ? "#34d399" : "#f87171",
                      fontWeight: 700
                    }}>
                      {botStatus.configured && botStatus.active ? t.botStatusActive : t.botStatusInactive}
                    </span>
                  </div>
                  {botStatus.configured && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)" }}>
                        <span>E-mail:</span>
                        <span style={{ color: "#fff" }}>{botStatus.email}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                        <span>{t.lastCheckedLabel}:</span>
                        <span style={{ color: "#fff" }}>{formatDate(botStatus.last_checked)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <label>E-mail do Yahoo</label>
              <input
                type="email"
                className={styles.input}
                placeholder="escala@yahoo.com"
                value={emailForm.email}
                onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.formRow}>
              <label>{t.appPassLabel}</label>
              <input
                type="password"
                className={styles.input}
                placeholder="xxxx xxxx xxxx xxxx"
                value={emailForm.app_password}
                onChange={e => setEmailForm({ ...emailForm, app_password: e.target.value })}
                required
              />
              <p style={{ fontSize: "0.7rem", color: "#a78bfa", marginTop: 4, lineHeight: 1.3 }}>
                ℹ️ {t.appPassDesc}
              </p>
            </div>

            <div className={styles.formRow}>
              <label>{t.imapServerLabel}</label>
              <input
                className={styles.input}
                value={emailForm.imap_server}
                onChange={e => setEmailForm({ ...emailForm, imap_server: e.target.value })}
                required
              />
            </div>

            <div className={styles.formRow}>
              <label>{t.imapPortLabel}</label>
              <input
                type="number"
                className={styles.input}
                value={emailForm.imap_port}
                onChange={e => setEmailForm({ ...emailForm, imap_port: parseInt(e.target.value) || 993 })}
                required
              />
            </div>

            <button className={styles.btnCreate} type="submit" disabled={emailLoading} style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", marginTop: 12 }}>
              {emailLoading ? t.testConnectionLabel : `🚀 ${t.saveEmailBtn}`}
            </button>

            {/* ── Botão de importação histórica ── */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: 10, lineHeight: 1.4 }}>
                📬 {t.importHistDesc}
              </p>

              {importResult && (
                <div style={{
                  background: importResult.ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                  border: `1px solid ${importResult.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                  borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: "0.78rem"
                }}>
                  {importResult.ok ? (
                    <>
                      <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 4 }}>{t.importHistSuccess}</div>
                      <div style={{ color: "rgba(255,255,255,0.7)" }}>📨 E-mails encontrados: <strong>{importResult.emails_found}</strong></div>
                      <div style={{ color: "rgba(255,255,255,0.7)" }}>📄 PDFs processados: <strong>{importResult.pdfs_found}</strong></div>
                      <div style={{ color: "#34d399" }}>💾 Turnos novos importados: <strong>{importResult.shifts_imported}</strong></div>
                    </>
                  ) : (
                    <div style={{ color: "#f87171" }}>{importResult.message}</div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleImportHistory}
                disabled={importLoading}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                  background: importLoading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: importLoading ? "rgba(255,255,255,0.3)" : "#fff",
                  fontWeight: 700, fontSize: "0.9rem", cursor: importLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {importLoading ? t.importHistLoading : t.importHistBtn}
              </button>
            </div>
          </form>
        )}

        {/* Painel 360 */}
        {tab === "analytics360" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
            {/* Controles do Painel */}
            <div style={{
              display: "flex", gap: 16, background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
              alignItems: "center", flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Ano / Anno</label>
                <select
                  style={{
                    background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, padding: "8px 16px", fontSize: "0.85rem", cursor: "pointer", outline: "none"
                  }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{t.selectWorker}</label>
                <select
                  style={{
                    background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, padding: "8px 16px", fontSize: "0.85rem", cursor: "pointer", outline: "none", width: "100%"
                  }}
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                >
                  {workersList.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading360 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>⏳...</div>
            ) : (
              <>
                {/* ─── Visão Comparativa de Trabalho ─── */}
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: 20
                }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "#fff" }}>
                    📊 {t.summaryTitle} ({selectedYear})
                  </h2>

                  {comparativeStats ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
                        {comparativeStats.most_worked && (
                          <div style={{
                            background: "rgba(52, 211, 153, 0.04)", border: "1px solid rgba(52, 211, 153, 0.15)",
                            borderRadius: 12, padding: 14
                          }}>
                            <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>🏆 {t.mostWorked}</div>
                            <div style={{ fontSize: "1.15rem", fontWeight: 700, margin: "4px 0", color: "#fff" }}>
                              {comparativeStats.most_worked.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                              {comparativeStats.most_worked.shifts} {lang === "pt" ? "turnos" : "turni"} ({Number(comparativeStats.most_worked.hours || 0).toFixed(1)}h)
                            </div>
                          </div>
                        )}

                        {comparativeStats.least_worked && (
                          <div style={{
                            background: "rgba(248, 113, 113, 0.04)", border: "1px solid rgba(248, 113, 113, 0.15)",
                            borderRadius: 12, padding: 14
                          }}>
                            <div style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700 }}>⚠️ {t.leastWorked}</div>
                            <div style={{ fontSize: "1.15rem", fontWeight: 700, margin: "4px 0", color: "#fff" }}>
                              {comparativeStats.least_worked.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                              {comparativeStats.least_worked.shifts} {lang === "pt" ? "turnos" : "turni"} ({Number(comparativeStats.least_worked.hours || 0).toFixed(1)}h)
                            </div>
                          </div>
                        )}

                        <div style={{
                          background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: 12, padding: 14
                        }}>
                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>📁 {lang === "pt" ? "Total Geral" : "Totale Generale"}</div>
                          <div style={{ fontSize: "1.15rem", fontWeight: 700, margin: "4px 0", color: "#fff" }}>
                            {comparativeStats.total_shifts_all} {lang === "pt" ? "turnos" : "turni"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                            {Number(comparativeStats.total_hours_all || 0).toFixed(1)}h {lang === "pt" ? "acumuladas" : "accumulate"}
                          </div>
                        </div>
                      </div>

                      {/* Lista Simples de Comparação */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {comparativeStats.workers.map((w: any) => (
                          <div
                            key={w.worker_name}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 14px",
                              border: selectedWorker === w.worker_name ? "1px solid rgba(167, 139, 250, 0.3)" : "1px solid transparent",
                              cursor: "pointer"
                            }}
                            onClick={() => setSelectedWorker(w.worker_name)}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff"
                              }}>
                                {w.worker_name[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{w.worker_name}</span>
                            </div>
                            <div style={{ display: "flex", gap: 16, fontSize: "0.8rem" }}>
                              <span style={{ color: "rgba(255,255,255,0.7)" }}><strong>{w.total_shifts}</strong> {lang === "pt" ? "turnos" : "turni"}</span>
                              <span style={{ color: "#a78bfa", fontWeight: 600 }}>{Number(w.total_hours || 0).toFixed(1)}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>—</div>
                  )}
                </div>

                {/* ─── Relatório Detalhado 360 do Funcionário ─── */}
                {selectedWorker && workerAnalytics && (
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 20
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                        👤 {t.workerDetailTitle}: <span style={{ color: "#a78bfa" }}>{workerAnalytics.worker_name}</span>
                      </h2>
                      <span style={{
                        background: "rgba(167, 139, 250, 0.1)", color: "#a78bfa",
                        borderRadius: 8, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700
                      }}>
                        {workerAnalytics.year}
                      </span>
                    </div>

                    {/* Grade de Estatísticas 360 */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{t.daysWorked}</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: "4px 0" }}>{workerAnalytics.total_shifts}</div>
                        <div style={{ fontSize: "0.7rem", color: "#a78bfa" }}>{Number(workerAnalytics.total_hours || 0).toFixed(1)}h {lang === "pt" ? "trabalhadas" : "lavorate"}</div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{t.daysOff}</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: "4px 0" }}>{workerAnalytics.total_days_off}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{lang === "pt" ? "folgas anuais" : "giorni liberi"}</div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{t.mostWorkedDay}</div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: "8px 0" }}>
                          {lang === "pt" ? workerAnalytics.most_worked_day.pt : workerAnalytics.most_worked_day.it}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>{workerAnalytics.most_worked_day.count} {lang === "pt" ? "vezes escalado" : "volte"}</div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{t.saturdays}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "4px 0" }}>
                          {workerAnalytics.weekends.saturday_worked} / {workerAnalytics.weekends.saturday_worked + workerAnalytics.weekends.saturday_off}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>{lang === "pt" ? "sábados escalados" : "sabati lavorati"}</div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{t.sundays}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "4px 0" }}>
                          {workerAnalytics.weekends.sunday_worked} / {workerAnalytics.weekends.sunday_worked + workerAnalytics.weekends.sunday_off}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>{lang === "pt" ? "domingos escalados" : "domeniche lavorate"}</div>
                      </div>
                    </div>

                    {/* Folgas Prolongadas / Férias */}
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
                        ✈️ {t.vacationsTitle}
                      </h3>
                      {workerAnalytics.vacations && workerAnalytics.vacations.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                          {workerAnalytics.vacations.map((vac: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                background: "rgba(167, 139, 250, 0.03)", border: "1px solid rgba(167, 139, 250, 0.1)",
                                borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
                              }}
                            >
                              <div style={{ fontSize: "0.8rem" }}>
                                <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 4 }}>{t.vacationFrom}</span>
                                <strong style={{ color: "#fff" }}>{new Date(vac.start).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</strong>
                                <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 4px" }}>{t.vacationTo}</span>
                                <strong style={{ color: "#fff" }}>{new Date(vac.end).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</strong>
                              </div>
                              <span style={{
                                background: "rgba(167, 139, 250, 0.15)", color: "#c084fc",
                                borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700
                              }}>
                                {vac.days} {t.vacationDays}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                          🏝️ {t.noVacations}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Aba Chat de IA */}
        {tab === "ai_chat" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
            {/* Cabeçalho do Chat */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: 18
            }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                🚀 {t.aiTitle}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.4 }}>
                {t.aiDesc}
              </p>
            </div>

            {/* Mensagens de Chat */}
            <div style={{
              background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 16, padding: 16, minHeight: 250, maxHeight: 400, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 12
            }}>
              {chatMessages.length === 0 ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200,
                  color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", textAlign: "center", padding: 20
                }}>
                  🤖 Olá! Como posso ajudar com as escalas hoje?<br/>Selecione um preset abaixo ou escreva sua dúvida.
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px", borderRadius: 12, maxWidth: "80%", fontSize: "0.82rem",
                      lineHeight: 1.4, wordBreak: "break-word",
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "rgba(167, 139, 250, 0.1)" : "rgba(255, 255, 255, 0.03)",
                      border: msg.role === "user" ? "1px solid rgba(167, 139, 250, 0.2)" : "1px solid rgba(255,255,255,0.06)",
                      color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.85)"
                    }}
                  >
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: msg.role === "user" ? "#a78bfa" : "#8b5cf6", marginBottom: 3 }}>
                      {msg.role === "user" ? "ADMIN" : "ASSISTENTE IA"}
                    </div>
                    <div style={{ whiteSpace: "pre-line" }}>{msg.content}</div>
                  </div>
                ))
              )}
              {aiLoading && (
                <div style={{
                  padding: "10px 14px", borderRadius: 12, alignSelf: "flex-start",
                  background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.8rem", color: "rgba(255,255,255,0.4)"
                }}>
                  ⏳ IA analisando dados em tempo real...
                </div>
              )}
            </div>

            {/* Presets / Ações Rápidas */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleSendAiMessage(lang === "pt" ? "Equilibrar a carga horária e turnos de todos os funcionários de forma justa" : "Bilancia i turni e le ore di lavoro di tutti i dipendenti")}
                disabled={aiLoading}
                style={{
                  background: "rgba(255,255,255,0.02)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "8px 12px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {t.aiPreset1}
              </button>
              <button
                onClick={() => handleSendAiMessage(lang === "pt" ? "Preciso calcular a recomposição de horários para a Maritza após sua saída de férias" : "Calcola la ricomposizione dei turni per Maritza dopo le sue ferie")}
                disabled={aiLoading}
                style={{
                  background: "rgba(255,255,255,0.02)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "8px 12px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {t.aiPreset2}
              </button>
              <button
                onClick={() => handleSendAiMessage(lang === "pt" ? "Sugira simulações de folgas semanais extras para quem está trabalhando mais" : "Suggerisci riposi extra settimanali per chi lavora di più")}
                disabled={aiLoading}
                style={{
                  background: "rgba(255,255,255,0.02)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "8px 12px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {t.aiPreset3}
              </button>
            </div>

            {/* Input de Texto */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className={styles.input}
                style={{ flex: 1, margin: 0 }}
                placeholder={t.aiInputHolder}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                disabled={aiLoading}
              />
              <button
                onClick={() => handleSendAiMessage()}
                disabled={aiLoading || !chatInput.trim()}
                style={{
                  padding: "0 20px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #a78bfa, #6366f1)",
                  color: "#fff", fontWeight: 700, cursor: "pointer",
                  opacity: aiLoading || !chatInput.trim() ? 0.5 : 1
                }}
              >
                {t.aiSendBtn}
              </button>
            </div>

            {/* ─── Box de Proposta de Ações ─── */}
            {proposedActions.length > 0 && (
              <div style={{
                background: "rgba(167, 139, 250, 0.05)", border: "1px solid rgba(167, 139, 250, 0.25)",
                borderRadius: 16, padding: 18, marginTop: 10
              }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
                  📋 {t.aiProposedChanges}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {proposedActions.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "8px 12px",
                        border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem"
                      }}
                    >
                      <div>
                        <span style={{
                          background: act.type === "UPSERT_SHIFT" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                          color: act.type === "UPSERT_SHIFT" ? "#34d399" : "#f87171",
                          borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 700, marginRight: 8
                        }}>
                          {act.type === "UPSERT_SHIFT" ? "+" : "-"}
                        </span>
                        <strong style={{ color: "#fff" }}>{act.worker_name}</strong>
                        <span style={{ color: "rgba(255,255,255,0.5)", margin: "0 6px" }}>•</span>
                        <span>{new Date(act.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        {act.type === "UPSERT_SHIFT" && (
                          <span style={{ color: "#a78bfa", marginLeft: 8, fontWeight: 600 }}>
                            {act.shift_type} ({act.start_time} - {act.end_time})
                          </span>
                        )}
                      </div>
                      {act.notes && (
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                          {act.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {currentUser?.admin_permissions === "read_only" ? (
                  <div style={{ color: "#f87171", fontSize: "0.78rem", fontWeight: 700 }}>
                    ⚠️ {t.readOnlyWarning}
                  </div>
                ) : (
                  <button
                    onClick={handleApplyProposedActions}
                    disabled={applyLoading}
                    style={{
                      width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, #34d399, #10b981)",
                      color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)", transition: "all 0.2s"
                    }}
                  >
                    {applyLoading ? "⏳..." : `✅ ${t.aiApplyProposed}`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
