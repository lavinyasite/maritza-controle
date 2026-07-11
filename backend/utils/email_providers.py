EMAIL_PROVIDERS = {
    # Brasil
    "gmail.com":      {"host": "imap.gmail.com",           "port": 993, "ssl": True, "name": "Gmail"},
    "googlemail.com": {"host": "imap.gmail.com",           "port": 993, "ssl": True, "name": "Gmail"},
    # Microsoft
    "hotmail.com":    {"host": "imap-mail.outlook.com",    "port": 993, "ssl": True, "name": "Hotmail"},
    "outlook.com":    {"host": "imap-mail.outlook.com",    "port": 993, "ssl": True, "name": "Outlook"},
    "live.com":       {"host": "imap-mail.outlook.com",    "port": 993, "ssl": True, "name": "Live"},
    "msn.com":        {"host": "imap-mail.outlook.com",    "port": 993, "ssl": True, "name": "MSN"},
    # Yahoo
    "yahoo.com":      {"host": "imap.mail.yahoo.com",      "port": 993, "ssl": True, "name": "Yahoo"},
    "yahoo.it":       {"host": "imap.mail.yahoo.com",      "port": 993, "ssl": True, "name": "Yahoo IT"},
    "yahoo.com.br":   {"host": "imap.mail.yahoo.com",      "port": 993, "ssl": True, "name": "Yahoo BR"},
    "ymail.com":      {"host": "imap.mail.yahoo.com",      "port": 993, "ssl": True, "name": "Yahoo"},
    # Apple iCloud — muito usado na Itália (iPhone dominante)
    "icloud.com":     {"host": "imap.mail.me.com",         "port": 993, "ssl": True, "name": "iCloud"},
    "me.com":         {"host": "imap.mail.me.com",         "port": 993, "ssl": True, "name": "iCloud"},
    "mac.com":        {"host": "imap.mail.me.com",         "port": 993, "ssl": True, "name": "iCloud"},
    # Italia specifici
    "libero.it":      {"host": "imapmail.libero.it",       "port": 993, "ssl": True, "name": "Libero"},
    "virgilio.it":    {"host": "imapmail.virgilio.it",     "port": 993, "ssl": True, "name": "Virgilio"},
    "alice.it":       {"host": "imap.alice.it",            "port": 993, "ssl": True, "name": "Alice"},
    "tim.it":         {"host": "imap.tim.it",              "port": 993, "ssl": True, "name": "TIM"},
    "tiscali.it":     {"host": "imap.tiscali.it",          "port": 993, "ssl": True, "name": "Tiscali"},
    # Europa Geral
    "protonmail.com": {"host": "imap.protonmail.ch",       "port": 993, "ssl": True, "name": "ProtonMail"},
    "proton.me":      {"host": "imap.protonmail.ch",       "port": 993, "ssl": True, "name": "ProtonMail"},
    "gmx.com":        {"host": "imap.gmx.net",             "port": 993, "ssl": True, "name": "GMX"},
    "gmx.de":         {"host": "imap.gmx.net",             "port": 993, "ssl": True, "name": "GMX DE"},
    "web.de":         {"host": "imap.web.de",              "port": 993, "ssl": True, "name": "Web.de"},
}


def get_provider_config(email: str) -> dict | None:
    """Detecta automaticamente o provedor pelo domínio do e-mail."""
    domain = email.split("@")[-1].lower().strip()
    return EMAIL_PROVIDERS.get(domain, None)
