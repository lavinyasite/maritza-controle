import pdfplumber
import io
import re
import logging
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger(__name__)


class PDFParser:
    """
    Parser inteligente de escalas de serviço em PDF.
    Extrai: nome do colaborador, datas, horários de entrada/saída,
    tipo de turno e notas do dia.

    Formato suportado (testado nos PDFs reais):
    - Tabela com linhas: nome | hora_entrada | hora_saida (repetido por dia)
    - Agrupado por semanas (settimana 1, 2, 3, 4, 5)
    - Datas nas linhas de cabeçalho de cada semana
    """

    SHIFT_TYPES = {
        "morning":  {"start": 5, "end": 13, "label_pt": "Manhã",    "label_it": "Mattino",  "color": "#f4c430"},
        "afternoon":{"start": 13, "end": 20, "label_pt": "Tarde",   "label_it": "Pomeriggio","color": "#ff7f50"},
        "night":    {"start": 20, "end": 5,  "label_pt": "Noturno", "label_it": "Notte",    "color": "#4169e1"},
    }

    def parse_from_bytes(self, pdf_bytes: bytes) -> list[dict]:
        """Parseia o PDF a partir de bytes (e-mail attachment)."""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return self._extract_all_shifts(pdf)

    def parse_from_path(self, path: str) -> list[dict]:
        """Parseia o PDF a partir de um caminho de arquivo."""
        with pdfplumber.open(path) as pdf:
            return self._extract_all_shifts(pdf)

    def _extract_all_shifts(self, pdf) -> list[dict]:
        self.current_year = datetime.now().year
        all_shifts = []
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                # Tentar extrair o ano do cabeçalho da tabela se houver, ex: "mag-24"
                for r in table:
                    if r and r[0]:
                        match = re.search(r"\b([a-zA-Z]{3})-(\d{2})\b", str(r[0]))
                        if match:
                            y = int(match.group(2))
                            self.current_year = 2000 + y
                            break
                shifts = self._parse_table(table)
                all_shifts.extend(shifts)
        logger.info(f"Total de turnos extraídos: {len(all_shifts)}")
        return all_shifts

    def _parse_table(self, table: list) -> list[dict]:
        """Processa uma tabela de escala e retorna lista de turnos."""
        shifts = []
        current_dates = []
        notes_row = []

        for row in table:
            if not row or not row[0]:
                continue

            first_cell = str(row[0]).strip().lower()

            # Linha de cabeçalho de semana: "settimana N" ou contendo "operatore"
            if "settimana" in first_cell or "operatore" in first_cell:
                current_dates = self._extract_dates_from_row(row)
                notes_row = []
                continue

            # Linha de notas
            if first_cell == "note":
                notes_row = row
                continue

            # Linha de colaborador: primeiro campo é o nome
            if current_dates and self._is_worker_row(row):
                worker_name = str(row[0]).strip()
                day_shifts = self._extract_shifts_for_worker(
                    worker_name, row[1:], current_dates, notes_row
                )
                shifts.extend(day_shifts)

        return shifts

    def _extract_dates_from_row(self, row: list) -> list[Optional[date]]:
        """Extrai as datas da linha de cabeçalho da semana."""
        dates = []
        for cell in row[1:]:
            if cell and isinstance(cell, str):
                parsed = self._parse_date(cell)
                if parsed:
                    # Cada data ocupa 4 colunas (início, pausa_in, pausa_out, fim)
                    dates.extend([parsed, parsed, parsed, parsed])
        return dates

    def _extract_shifts_for_worker(
        self, name: str, cells: list, dates: list, notes: list
    ) -> list[dict]:
        """Extrai os turnos de um colaborador para a semana."""
        shifts = []
        # Células em grupos de 4: [entrada, pausa_in, pausa_out, saída]
        for i in range(0, min(len(cells), len(dates)), 4):
            if i >= len(dates):
                break

            work_date = dates[i]
            if not work_date:
                continue

            start_time = self._clean_time(cells[i] if i < len(cells) else None)
            end_time = self._clean_time(cells[i+3] if i+3 < len(cells) else None)

            if not start_time and not end_time:
                continue  # Dia de folga

            note = ""
            if notes and i < len(notes):
                note = str(notes[i] or "").strip()

            shift_type = self._detect_shift_type(start_time)
            duration_hours = self._calculate_duration(start_time, end_time)

            shifts.append({
                "worker_name": name,
                "date": work_date.isoformat() if work_date else None,
                "start_time": start_time,
                "end_time": end_time,
                "shift_type": shift_type,
                "duration_hours": duration_hours,
                "notes": note,
                "is_overnight": self._is_overnight(start_time, end_time),
            })

        return shifts

    def _parse_date(self, value: str) -> Optional[date]:
        """Parseia datas nos formatos: DD/MM/YYYY, D/M/YYYY, e DD/MM."""
        value = value.strip()
        patterns = [
            r"(\d{1,2})/(\d{1,2})/(\d{4})",
            r"(\d{1,2})-(\d{1,2})-(\d{4})",
        ]
        for pattern in patterns:
            m = re.search(pattern, value)
            if m:
                try:
                    return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
                except ValueError:
                    pass

        # Formato curto: lun 29/4 ou 29/4
        short_pattern = r"(\d{1,2})/(\d{1,2})"
        m = re.search(short_pattern, value)
        if m:
            try:
                return date(self.current_year, int(m.group(2)), int(m.group(1)))
            except ValueError:
                pass
        return None

    def _clean_time(self, value) -> Optional[str]:
        """Limpa e valida um valor de horário."""
        if not value:
            return None
        s = str(value).strip()
        if re.match(r"^\d{1,2}:\d{2}$", s):
            return s
        return None

    def _detect_shift_type(self, start_time: Optional[str]) -> str:
        if not start_time:
            return "morning"
        hour = int(start_time.split(":")[0])
        if 5 <= hour < 13:
            return "morning"
        elif 13 <= hour < 20:
            return "afternoon"
        else:
            return "night"

    def _calculate_duration(self, start: Optional[str], end: Optional[str]) -> Optional[float]:
        if not start or not end:
            return None
        try:
            sh, sm = map(int, start.split(":"))
            eh, em = map(int, end.split(":"))
            duration = (eh * 60 + em) - (sh * 60 + sm)
            if duration < 0:
                duration += 24 * 60  # Turno noturno
            return round(duration / 60, 2)
        except Exception:
            return None

    def _is_overnight(self, start: Optional[str], end: Optional[str]) -> bool:
        if not start or not end:
            return False
        sh = int(start.split(":")[0])
        eh = int(end.split(":")[0])
        return eh < sh  # Termina antes de começar = virou a meia-noite

    def _is_worker_row(self, row: list) -> bool:
        """Verifica se a linha é de um colaborador (não é cabeçalho)."""
        first = str(row[0] or "").strip()
        skip = {"settimana", "note", "data", "nome", ""}
        return (
            first not in skip
            and not first.isdigit()
            and len(first) > 1
        )
