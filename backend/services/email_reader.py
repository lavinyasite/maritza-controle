import imaplib
import email
import os
import logging
from email.header import decode_header
from datetime import datetime, timedelta
from typing import Optional
from .email_providers import get_provider_config

logger = logging.getLogger(__name__)


class EmailReader:
    """
    Leitor de e-mails via IMAP.
    Suporta: Gmail, Yahoo, Hotmail, iCloud, Libero.it e mais 15+ provedores.
    """

    def __init__(self, email_address: str, app_password: str):
        self.email_address = email_address
        self.app_password = app_password
        self.provider = get_provider_config(email_address)
        self.connection: Optional[imaplib.IMAP4_SSL] = None

    def connect(self) -> bool:
        """Conecta ao servidor IMAP do provedor detectado automaticamente."""
        if not self.provider:
            logger.error(f"Provedor não suportado para: {self.email_address}")
            return False
        try:
            self.connection = imaplib.IMAP4_SSL(
                self.provider["host"],
                self.provider["port"]
            )
            self.connection.login(self.email_address, self.app_password)
            logger.info(f"Conectado ao {self.provider['name']} para {self.email_address}")
            return True
        except imaplib.IMAP4.error as e:
            logger.error(f"Falha ao conectar ao IMAP: {e}")
            return False

    def disconnect(self):
        if self.connection:
            try:
                self.connection.logout()
            except Exception:
                pass
            self.connection = None

    def fetch_pdf_attachments(self, since_days: int = 7) -> list[dict]:
        """
        Busca e-mails não lidos com anexos PDF nos últimos N dias.
        Retorna lista de: {filename, content, sender, date, subject}
        """
        if not self.connection:
            if not self.connect():
                return []

        results = []
        try:
            self.connection.select("INBOX")
            since_date = (datetime.now() - timedelta(days=since_days)).strftime("%d-%b-%Y")

            # Busca e-mails não lidos desde a data
            status, messages = self.connection.search(
                None,
                f'(UNSEEN SINCE "{since_date}")'
            )
            if status != "OK":
                return []

            email_ids = messages[0].split()
            logger.info(f"Encontrados {len(email_ids)} e-mails não lidos")

            for email_id in email_ids:
                status, msg_data = self.connection.fetch(email_id, "(RFC822)")
                if status != "OK":
                    continue

                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                sender = msg.get("From", "")
                subject = self._decode_header(msg.get("Subject", ""))
                date_str = msg.get("Date", "")

                # Procura anexos PDF
                for part in msg.walk():
                    if part.get_content_type() == "application/pdf":
                        filename = self._decode_header(
                            part.get_filename() or "anexo.pdf"
                        )
                        content = part.get_payload(decode=True)
                        if content:
                            results.append({
                                "filename": filename,
                                "content": content,
                                "sender": sender,
                                "subject": subject,
                                "date": date_str,
                                "email_id": email_id,
                            })
                            logger.info(f"PDF encontrado: {filename} de {sender}")

            return results

        except Exception as e:
            logger.error(f"Erro ao buscar e-mails: {e}")
            return []

    def mark_as_read(self, email_id: bytes):
        """Marca o e-mail como lido após processar."""
        if self.connection:
            try:
                self.connection.store(email_id, "+FLAGS", "\\Seen")
            except Exception as e:
                logger.error(f"Erro ao marcar como lido: {e}")

    def _decode_header(self, value: str) -> str:
        decoded_parts = decode_header(value)
        result = []
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                result.append(part.decode(encoding or "utf-8", errors="replace"))
            else:
                result.append(part)
        return "".join(result)
