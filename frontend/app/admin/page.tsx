"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

const T = {
  pt: {
    title: "Painel Admin",
    subtitle: "Gestão de Usuários",
    tabs: { pending: "Pendentes", all: "Todos", create: "Criar Usuário" },
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
  },
  it: {
    title: "Pannello Admin",
    subtitle: "Gestione Utenti",
    tabs: { pending: "In Attesa", all: "Tutti", create: "Crea Utente" },
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
  const [tab, setTab] = useState<"pending" | "all" | "create">("pending");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", lang: "it", role: "worker" });
  const [submitting, setSubmitting] = useState(false);

  const t = T[lang];

  useEffect(() => {
    const l = localStorage.getItem("cs_lang") as "pt" | "it";
    if (l === "pt" || l === "it") setLang(l);
    fetchUsers();
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
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

  const pending = users.filter(u => u.role === "pending");
  const displayed = tab === "pending" ? pending : tab === "all" ? users : [];

  function formatDate(dt: string) {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
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
          {(["pending", "all", "create"] as const).map(tb => (
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
      </div>
    </main>
  );
}
