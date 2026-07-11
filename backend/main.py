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


# ─── Lifecycle ────────────────────────────────
@asynccontextmanager
async def lifespan(app):
    await init_db()
    yield

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


# ─── Turnos e escalas ─────────────────────────
@app.get("/api/shifts/week")
async def get_week_shifts(current_user: dict = Depends(get_current_user)):
    return {
        "worker": current_user["name"],
        "week": [
            {"day": "Dom", "date": "13/07", "shift": "R"},
            {"day": "Seg", "date": "14/07", "shift": "M"},
            {"day": "Ter", "date": "15/07", "shift": "M"},
            {"day": "Qua", "date": "16/07", "shift": "P"},
            {"day": "Qui", "date": "17/07", "shift": "N"},
            {"day": "Sex", "date": "18/07", "shift": "R"},
            {"day": "Sáb", "date": "19/07", "shift": "R"},
        ]
    }


@app.get("/api/shifts/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return {
        "shifts_this_month": 18,
        "total_hours": 144,
        "next_shift": "14:00",
        "days_off": 6,
    }


@app.post("/api/schedules/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas PDFs são aceitos")
    content = await file.read()
    logger.info(f"PDF recebido: {file.filename} por {current_user['email']}")
    try:
        from services.pdf_parser import PDFParser
        parser = PDFParser()
        shifts = parser.parse_from_bytes(content)
        return {"filename": file.filename, "shifts_found": len(shifts), "status": "success"}
    except Exception as e:
        logger.error(f"Erro PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schedules/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    return {
        "schedules": [
            {"filename": "turni inviati A4 Agosto 26.pdf", "date": "10/07/2026", "shifts": 47, "status": "ok"},
            {"filename": "turni inviati A4 Luglio 26.pdf",  "date": "05/06/2026", "shifts": 44, "status": "ok"},
        ]
    }
