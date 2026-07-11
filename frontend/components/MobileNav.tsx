"use client";

interface MobileNavProps {
  lang: "pt" | "it";
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

const LABELS = {
  pt: { home: "Início", calendar: "Calendário", alerts: "Avisos", profile: "Perfil" },
  it: { home: "Home",   calendar: "Calendario", alerts: "Avvisi", profile: "Profilo" },
};

const NAV_ITEMS = [
  {
    id: "home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: "alerts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    hasBadge: true,
  },
  {
    id: "profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function MobileNav({ lang, activeTab, onTabChange, unreadCount = 0 }: MobileNavProps) {
  const labels = LABELS[lang];

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const label = labels[item.id as keyof typeof labels];

        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            style={{ position: "relative" }}
          >
            {item.icon}
            <span>{label}</span>
            {item.hasBadge && unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} não lidas`}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 8,
                  width: 16,
                  height: 16,
                  background: "var(--color-accent)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  border: "2px solid var(--color-bg)",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
