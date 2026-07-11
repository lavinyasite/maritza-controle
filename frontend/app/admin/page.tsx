"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

const T = {
  pt: {
    title: "Painel Admin",
    subtitle: "Gestão de Usuários",
    tabs: { pending: "Pendentes", all: "Todos", create: "Criar Usuário", email: "Robô de E-mail" },
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
  },
  it: {
    title: "Pannello Admin",
    subtitle: "Gestione Utenti",
    tabs: { pending: "In Attesa", all: "Tutti", create: "Crea Utente", email: "Bot Email" },
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
  const [tab, setTab] = useState<"pending" | "all" | "create" | "email">("pending");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  
  // States para formulário de usuário
  const [form, setForm] = useState({ name: "", email: "", password: "", lang: "it", role: "worker" });
  const [submitting, setSubmitting] = useState(false);

  // States para Robô de e-mail
  const [emailForm, setEmailForm] = useState({ email: "", app_password: "", imap_server: "imap.mail.yahoo.com", imap_port: 993, active: true });
  const [botStatus, setBotStatus] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const t = T[lang];

  useEffect(() => {
    const l = localStorage.getItem("cs_lang") as "pt" | "it";
    if (l === "pt" || l === "it") setLang(l);
    fetchUsers();
    fetchEmailSettings();
  }, []);

  const getToken = () => localStorage.getItem("cs_token") || "";

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
        setForm({ name: "", email: "", password: "", lang: "it", role: "worker" });
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
          {(["pending", "all", "create", "email"] as const).map(tb => (
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
                  {u.role !== "admin" && (
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
          </form>
        )}
      </div>
    </main>
  );
}
