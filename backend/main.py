"""
Controllo Servizi — Backend Principal (FastAPI)
================================================
API REST para gestão de escalas de serviço.
Suporta multi-usuário, JWT auth, SQLite, upload de PDF e agente OpenAI.
Admin: 1nlocker.ia@gmail.com
"""

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import aiosqlite
import uuid
import os
import logging
from dotenv import load_dotenv
from typing import Optional
from contextlib import asynccontextmanager

load_dotenv()

# ─── Configuração ─────────────────────────────
SECRET_KEY           = os.getenv("SECRET_KEY", "controllo-servizi-secret-change-me")
ALGORITHM            = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
DB_PATH              = os.getenv("DB_PATH", "/data/controllo.db")
ADMIN_EMAIL          = "1nlocker.ia@gmail.com"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Banco de dados ───────────────────────────
async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def init_db():
    """Cria tabelas e insere o admin padrão se não existir."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                email       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                role        TEXT NOT NULL DEFAULT 'pending',
                lang        TEXT NOT NULL DEFAULT 'it',
                created_at  TEXT NOT NULL,
                approved_at TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS shifts (
                id             TEXT PRIMARY KEY,
                worker_name    TEXT NOT NULL,
                date           TEXT NOT NULL,
                start_time     TEXT,
                end_time       TEXT,
                shift_type     TEXT NOT NULL,
                duration_hours REAL,
                notes          TEXT,
                uploaded_by    TEXT NOT NULL,
                created_at     TEXT NOT NULL,
                UNIQUE(worker_name, date)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id          TEXT PRIMARY KEY,
                filename    TEXT NOT NULL,
                uploaded_by TEXT NOT NULL,
                uploaded_at TEXT NOT NULL,
                status      TEXT NOT NULL,
                shifts_count INTEGER DEFAULT 0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS email_settings (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT UNIQUE NOT NULL,
                app_password  TEXT NOT NULL,
                imap_server   TEXT NOT NULL,
                imap_port     INTEGER NOT NULL DEFAULT 993,
                active        INTEGER NOT NULL DEFAULT 1,
                last_checked  TEXT
            )
        """)
        await db.commit()

        # Inserir admin padrão
        existing = await db.execute("SELECT id FROM users WHERE email = ?", (ADMIN_EMAIL,))
        if not await existing.fetchone():
            hashed = bcrypt.hashpw(b"Admin@2026!", bcrypt.gensalt()).decode()
            await db.execute("""
                INSERT INTO users (id, name, email, password, role, lang, created_at)
                VALUES (?, ?, ?, ?, 'admin', 'pt', ?)
            """, (str(uuid.uuid4()), "Maritza (Admin)", ADMIN_EMAIL, hashed,
                  datetime.utcnow().isoformat()))
            await db.commit()
            logger.info(f"✅ Admin criado: {ADMIN_EMAIL}")


from apscheduler.schedulers.background import BackgroundScheduler
import asyncio

def check_emails_job():
    """Tarefa periódica do Scheduler para monitorar a caixa de e-mails."""
    import sqlite3
    
    DB_PATH = os.getenv("DB_PATH", "/data/controllo.db")
    if not os.path.exists(DB_PATH):
        return
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email, app_password, imap_server, imap_port FROM email_settings WHERE active = 1 LIMIT 1")
        row = cursor.fetchone()
        if not row:
            return
            
        email_addr, app_pass, imap_host, imap_port = row
        logger.info(f"[JOB] Rodando monitor inteligente de escala para: {email_addr}")
        
        from services.email_agent import ScheduleAgent
        agent = ScheduleAgent()
        
        # Como o scheduler roda em thread síncrona do background, criamos um event loop temporário
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(agent.run(email_addr, app_pass))
        loop.close()
        
        # Atualiza data da última checagem
        now_str = datetime.utcnow().isoformat()
        cursor.execute("UPDATE email_settings SET last_checked = ? WHERE email = ?", (now_str, email_addr))
        conn.commit()
        logger.info(f"[JOB] Resultado: {result[:150]}...")
    except Exception as e:
        logger.error(f"[JOB] Erro ao monitorar e-mails no background: {e}")
    finally:
        conn.close()

scheduler = BackgroundScheduler()

# ─── Lifecycle ────────────────────────────────
@asynccontextmanager
async def lifespan(app):
    await init_db()
    # Adicionar job do scheduler a cada 10 minutos
    scheduler.add_job(check_emails_job, "interval", minutes=10, id="email_monitor_job", replace_existing=True)
    scheduler.start()
    logger.info("⏰ Scheduler de monitoramento de escala iniciado (10 minutos)")
    yield
    scheduler.shutdown()


# ─── App ──────────────────────────────────────
app = FastAPI(
    title="Controllo Servizi API",
    description="API para gestão de escalas de serviço — PT/IT",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth helpers ─────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict, expires_minutes: int = TOKEN_EXPIRE_MINUTES) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")
        row = await db.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = await row.fetchone()
        if not user or user["role"] not in ("admin", "worker"):
            raise HTTPException(status_code=401, detail="Acesso negado ou pendente")
        return dict(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores")
    return current_user


# ─── Modelos ──────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    lang: str
    role: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    lang: Optional[str] = "it"

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    lang: Optional[str] = "it"
    role: Optional[str] = "worker"

class EmailSettingsRequest(BaseModel):
    email: str
    app_password: str
    imap_server: Optional[str] = "imap.mail.yahoo.com"
    imap_port: Optional[int] = 993
    active: Optional[bool] = True



# ─── Rotas de saúde ───────────────────────────
@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "Controllo Servizi API", "version": "2.0.0"}


# ─── Autenticação ─────────────────────────────
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_db)):
    row = await db.execute("SELECT * FROM users WHERE email = ?", (body.email,))
    user = await row.fetchone()
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    if user["role"] == "pending":
        raise HTTPException(status_code=403, detail="Conta aguardando aprovação do administrador")
    token = create_token({"sub": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_name=user["name"],
        lang=user["lang"],
        role=user["role"],
    )


@app.post("/api/auth/token")
async def token_form(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """Swagger UI compatibility"""
    row = await db.execute("SELECT * FROM users WHERE email = ?", (form.username,))
    user = await row.fetchone()
    if not user or not verify_password(form.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/register")
async def register(body: RegisterRequest, db=Depends(get_db)):
    """Trabalhador solicita acesso — fica pendente até admin aprovar."""
    existing = await db.execute("SELECT id FROM users WHERE email = ?", (body.email,))
    if await existing.fetchone():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    hashed = hash_password(body.password)
    user_id = str(uuid.uuid4())
    await db.execute("""
        INSERT INTO users (id, name, email, password, role, lang, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
    """, (user_id, body.name, body.email, hashed, body.lang, datetime.utcnow().isoformat()))
    await db.commit()
    logger.info(f"📬 Novo registro pendente: {body.email}")
    return {"message": "Solicitação enviada! Aguarde aprovação do administrador.", "id": user_id}


# ─── Usuário logado ───────────────────────────
@app.get("/api/user/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "name":  current_user["name"],
        "email": current_user["email"],
        "lang":  current_user["lang"],
        "role":  current_user["role"],
    }


# ─── Admin — gestão de usuários ───────────────
@app.get("/api/admin/users")
async def admin_list_users(admin=Depends(require_admin), db=Depends(get_db)):
    """Lista todos os usuários (admin only)."""
    rows = await db.execute("""
        SELECT id, name, email, role, lang, created_at, approved_at
        FROM users ORDER BY created_at DESC
    """)
    users = [dict(r) for r in await rows.fetchall()]
    return {"users": users, "total": len(users)}


@app.post("/api/admin/users")
async def admin_create_user(body: CreateUserRequest, admin=Depends(require_admin), db=Depends(get_db)):
    """Admin cria usuário diretamente (já aprovado)."""
    existing = await db.execute("SELECT id FROM users WHERE email = ?", (body.email,))
    if await existing.fetchone():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    hashed = hash_password(body.password)
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    await db.execute("""
        INSERT INTO users (id, name, email, password, role, lang, created_at, approved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, body.name, body.email, hashed, body.role, body.lang, now, now))
    await db.commit()
    logger.info(f"✅ Usuário criado pelo admin: {body.email}")
    return {"message": "Usuário criado com sucesso", "id": user_id}


@app.patch("/api/admin/users/{user_id}/approve")
async def admin_approve_user(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
    """Admin aprova um usuário pendente."""
    row = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await row.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    await db.execute("""
        UPDATE users SET role = 'worker', approved_at = ? WHERE id = ?
    """, (datetime.utcnow().isoformat(), user_id))
    await db.commit()
    logger.info(f"✅ Aprovado: {user['email']}")
    return {"message": f"Usuário {user['name']} aprovado com sucesso"}


@app.patch("/api/admin/users/{user_id}/block")
async def admin_block_user(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
    """Admin bloqueia/desativa um usuário."""
    row = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await row.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user["email"] == ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Não é possível bloquear o admin principal")
    await db.execute("UPDATE users SET role = 'blocked' WHERE id = ?", (user_id,))
    await db.commit()
    return {"message": f"Usuário {user['name']} bloqueado"}


@app.delete("/api/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
    """Admin remove um usuário."""
    row = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await row.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user["email"] == ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Não é possível remover o admin principal")
    await db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    await db.commit()
    return {"message": f"Usuário {user['name']} removido"}


@app.get("/api/admin/email-settings")
async def get_email_settings(admin=Depends(require_admin), db=Depends(get_db)):
    row = await db.execute("SELECT id, email, imap_server, imap_port, active, last_checked FROM email_settings LIMIT 1")
    settings = await row.fetchone()
    if not settings:
        return {"configured": False}
    return {
        "configured": True,
        "id": settings["id"],
        "email": settings["email"],
        "imap_server": settings["imap_server"],
        "imap_port": settings["imap_port"],
        "active": bool(settings["active"]),
        "last_checked": settings["last_checked"]
    }

@app.post("/api/admin/email-settings")
async def save_email_settings(body: EmailSettingsRequest, admin=Depends(require_admin), db=Depends(get_db)):
    # 1. Testar conexão IMAP antes de salvar
    from services.email_reader import EmailReader
    reader = EmailReader(body.email, body.app_password)
    if body.imap_server:
        reader.provider = {"host": body.imap_server, "port": body.imap_port, "name": "Custom"}
        
    if not reader.connect():
        raise HTTPException(
            status_code=400, 
            detail="Não foi possível conectar ao servidor de e-mail. Verifique a conta e gere uma Senha de Aplicativo IMAP."
        )
    reader.disconnect()

    # 2. Salvar no banco
    await db.execute("DELETE FROM email_settings")
    await db.execute("""
        INSERT INTO email_settings (email, app_password, imap_server, imap_port, active)
        VALUES (?, ?, ?, ?, ?)
    """, (body.email, body.app_password, body.imap_server, body.imap_port, 1 if body.active else 0))
    await db.commit()
    
    # 3. Disparar checagem assíncrona inicial
    try:
        from services.email_agent import ScheduleAgent
        agent = ScheduleAgent()
        asyncio.create_task(agent.run(body.email, body.app_password))
    except Exception as e:
        logger.error(f"Erro ao disparar check de e-mail inicial: {e}")
        
    return {"message": "Configurações de e-mail salvas e monitor ativo!"}


# ─── Turnos e escalas ─────────────────────────


@app.get("/api/shifts/my-shifts")
async def get_my_shifts(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
    shift_type: Optional[str] = None,
    month: Optional[str] = None # formato: YYYY-MM
):
    """Retorna a lista de turnos do usuário logado com filtros."""
    name_query = f"%{current_user['name'].split()[0].strip()}%"
    query = "SELECT * FROM shifts WHERE worker_name LIKE ? "
    params = [name_query]
    
    if shift_type:
        query += " AND shift_type = ?"
        params.append(shift_type)
        
    if month:
        query += " AND date LIKE ?"
        params.append(f"{month}%")
        
    query += " ORDER BY date ASC"
    
    rows = await db.execute(query, params)
    shifts = [dict(r) for r in await rows.fetchall()]
    return {"shifts": shifts, "total": len(shifts)}


@app.get("/api/shifts/analytics")
async def get_my_analytics(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
    year: Optional[int] = None
):
    """Gera análises detalhadas acumuladas do ano de trabalho a partir do PDF."""
    if not year:
        year = datetime.now().year
        
    name_query = f"%{current_user['name'].split()[0].strip()}%"
    year_prefix = f"{year}%"
    
    # 1. Total de turnos e horas
    row_stats = await db.execute("""
        SELECT COUNT(*) as total_shifts, SUM(duration_hours) as total_hours 
        FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND shift_type != 'dayoff' AND shift_type != 'R'
    """, (name_query, year_prefix))
    stats = dict(await row_stats.fetchone())
    
    # 2. Total de folgas (registradas ou implícitas)
    row_off = await db.execute("""
        SELECT COUNT(*) as total_off 
        FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND (shift_type = 'dayoff' OR shift_type = 'R')
    """, (name_query, year_prefix))
    total_off = (await row_off.fetchone())[0]

    # 3. Dia da semana mais trabalhado
    row_days = await db.execute("""
        SELECT date FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND shift_type != 'dayoff' AND shift_type != 'R'
    """, (name_query, year_prefix))
    dates = [datetime.strptime(r[0], "%Y-%m-%d") for r in await row_days.fetchall() if r[0]]
    
    weekday_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0} # 0=Seg, 6=Dom
    for d in dates:
        weekday_counts[d.weekday()] += 1
        
    weekday_names_pt = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
    weekday_names_it = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    
    max_day_idx = max(weekday_counts, key=weekday_counts.get) if dates else 0
    max_day_count = weekday_counts[max_day_idx]
    
    # 4. Finais de semana (Sábado + Domingo)
    weekend_worked = 0
    weekend_off = 0
    row_weekends = await db.execute("""
        SELECT date, shift_type FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ?
    """, (name_query, year_prefix))
    for r in await row_weekends.fetchall():
        try:
            dt = datetime.strptime(r[0], "%Y-%m-%d")
            if dt.weekday() in (5, 6): # 5=Sáb, 6=Dom
                if r[1] in ('dayoff', 'R'):
                    weekend_off += 1
                else:
                    weekend_worked += 1
        except:
            pass

    # 5. Detecção de Férias/Folgas Prolongadas (sequências de 4+ dias de folga seguidos)
    row_all_off = await db.execute("""
        SELECT date FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND (shift_type = 'dayoff' OR shift_type = 'R')
        ORDER BY date ASC
    """, (name_query, year_prefix))
    off_dates = sorted([datetime.strptime(r[0], "%Y-%m-%d").date() for r in await row_all_off.fetchall() if r[0]])
    
    vacations = []
    if off_dates:
        current_streak = [off_dates[0]]
        for i in range(1, len(off_dates)):
            diff = (off_dates[i] - off_dates[i-1]).days
            if diff == 1:
                current_streak.append(off_dates[i])
            else:
                if len(current_streak) >= 4:
                    vacations.append({
                        "start": current_streak[0].isoformat(),
                        "end": current_streak[-1].isoformat(),
                        "days": len(current_streak)
                    })
                current_streak = [off_dates[i]]
        if len(current_streak) >= 4:
            vacations.append({
                "start": current_streak[0].isoformat(),
                "end": current_streak[-1].isoformat(),
                "days": len(current_streak)
            })

    return {
        "year": year,
        "total_shifts": stats.get("total_shifts") or 0,
        "total_hours": stats.get("total_hours") or 0.0,
        "total_days_off": total_off,
        "most_worked_day": {
            "pt": weekday_names_pt[max_day_idx] if dates else "—",
            "it": weekday_names_it[max_day_idx] if dates else "—",
            "count": max_day_count
        },
        "weekends": {
            "worked": weekend_worked,
            "off": weekend_off
        },
        "vacations": vacations,
        "vacations_count": len(vacations)
    }


@app.get("/api/shifts/week")
async def get_week_shifts(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Retorna os turnos da semana atual."""
    name_query = f"%{current_user['name'].split()[0].strip()}%"
    today = datetime.now().date()
    start_of_week = today - timedelta(days=today.weekday() + 1) # Domingo ou Segunda
    
    week_days = []
    weekday_labels_pt = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    weekday_labels_it = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
    
    for i in range(7):
        current_dt = start_of_week + timedelta(days=i)
        dt_str = current_dt.isoformat()
        
        row = await db.execute("""
            SELECT shift_type, start_time, end_time FROM shifts 
            WHERE worker_name LIKE ? AND date = ?
        """, (name_query, dt_str))
        shift = await row.fetchone()
        
        week_days.append({
            "day_pt": weekday_labels_pt[current_dt.weekday()],
            "day_it": weekday_labels_it[current_dt.weekday()],
            "date": current_dt.strftime("%d/%m"),
            "iso_date": dt_str,
            "shift": shift["shift_type"] if shift else "R",
            "time": f"{shift['start_time']} - {shift['end_time']}" if shift and shift['start_time'] else None
        })
        
    return {
        "worker": current_user["name"],
        "week": week_days
    }


@app.get("/api/shifts/stats")
async def get_stats(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Estatísticas do mês atual."""
    name_query = f"%{current_user['name'].split()[0].strip()}%"
    now = datetime.now()
    month_prefix = now.strftime("%Y-%m-%d")[:7] # YYYY-MM
    
    row_shifts = await db.execute("""
        SELECT COUNT(*) as total_shifts, SUM(duration_hours) as total_hours 
        FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND shift_type != 'dayoff' AND shift_type != 'R'
    """, (name_query, f"{month_prefix}%"))
    stats = dict(await row_shifts.fetchone())
    
    row_off = await db.execute("""
        SELECT COUNT(*) 
        FROM shifts 
        WHERE worker_name LIKE ? AND date LIKE ? AND (shift_type = 'dayoff' OR shift_type = 'R')
    """, (name_query, f"{month_prefix}%"))
    total_off = (await row_off.fetchone())[0]
    
    # Próximo turno
    today_str = now.date().isoformat()
    row_next = await db.execute("""
        SELECT start_time, date FROM shifts 
        WHERE worker_name LIKE ? AND date >= ? AND shift_type != 'dayoff' AND shift_type != 'R'
        ORDER BY date ASC, start_time ASC LIMIT 1
    """, (name_query, today_str))
    next_shift = await row_next.fetchone()
    next_str = next_shift["start_time"] if next_shift else "—"

    return {
        "shifts_this_month": stats.get("total_shifts") or 0,
        "total_hours": stats.get("total_hours") or 0.0,
        "next_shift": next_str,
        "days_off": total_off,
    }


@app.post("/api/schedules/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas PDFs são aceitos")
    content = await file.read()
    logger.info(f"PDF recebido: {file.filename} por {current_user['email']}")
    try:
        from services.pdf_parser import PDFParser
        parser = PDFParser()
        shifts = parser.parse_from_bytes(content)
        
        uploaded_at = datetime.utcnow().isoformat()
        upload_id = str(uuid.uuid4())
        
        inserted_count = 0
        for s in shifts:
            # Converter tipos do parser para os padrões aceitos
            stype = "R" if s["shift_type"] == "dayoff" else s["shift_type"]
            if stype == "morning": stype = "M"
            elif stype == "afternoon": stype = "P"
            elif stype == "night": stype = "N"
            
            shift_id = str(uuid.uuid4())
            
            # Usar INSERT OR REPLACE na tabela do banco
            await db.execute("""
                INSERT INTO shifts (id, worker_name, date, start_time, end_time, shift_type, duration_hours, notes, uploaded_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(worker_name, date) DO UPDATE SET
                    start_time=excluded.start_time,
                    end_time=excluded.end_time,
                    shift_type=excluded.shift_type,
                    duration_hours=excluded.duration_hours,
                    notes=excluded.notes,
                    uploaded_by=excluded.uploaded_by,
                    created_at=excluded.created_at
            """, (shift_id, s["worker_name"], s["date"], s["start_time"], s["end_time"], stype, s["duration_hours"], s["notes"], current_user["email"], uploaded_at))
            inserted_count += 1
            
        await db.execute("""
            INSERT INTO uploads (id, filename, uploaded_by, uploaded_at, status, shifts_count)
            VALUES (?, ?, ?, ?, 'ok', ?)
        """, (upload_id, file.filename, current_user["email"], uploaded_at, inserted_count))
        
        await db.commit()
        return {"filename": file.filename, "shifts_found": len(shifts), "status": "success"}
    except Exception as e:
        logger.error(f"Erro PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schedules/history")
async def get_history(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Histórico de escalas importadas do banco."""
    rows = await db.execute("""
        SELECT filename, uploaded_at as date, shifts_count as shifts, status 
        FROM uploads ORDER BY uploaded_at DESC LIMIT 10
    """)
    schedules = [dict(r) for r in await rows.fetchall()]
    return {"schedules": schedules}

