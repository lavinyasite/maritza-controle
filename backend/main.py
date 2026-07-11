"""
Controllo Servizi — Backend Principal (FastAPI)
================================================
API REST para gestão de escalas de serviço.
Suporta multi-usuário, JWT auth, upload de PDF e agente OpenAI.
"""

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from typing import Optional
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# ─── Configuração ─────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "controllo-servizi-secret-change-me")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── App ──────────────────────────────────────
app = FastAPI(
    title="Controllo Servizi API",
    description="API para gestão de escalas de serviço — PT/IT",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ─────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# Usuários demo (em produção: banco de dados)
DEMO_USERS = {
    "maritza@demo.com": {
        "name": "Maritza",
        "email": "maritza@demo.com",
        "hashed_password": bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode(),
        "lang": "pt",
        "role": "worker",
    },
    "admin@controllo.com": {
        "name": "Admin",
        "email": "admin@controllo.com",
        "hashed_password": bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(),
        "lang": "it",
        "role": "admin",
    },
}

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    lang: str


def create_token(data: dict, expires_minutes: int = TOKEN_EXPIRE_MINUTES) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email or email not in DEMO_USERS:
            raise HTTPException(status_code=401, detail="Token inválido")
        return DEMO_USERS[email]
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ─── Rotas ────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "Controllo Servizi API", "version": "1.0.0"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = DEMO_USERS.get(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    token = create_token({"sub": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_name=user["name"],
        lang=user["lang"],
    )


@app.post("/api/auth/token")
def token_form(form: OAuth2PasswordRequestForm = Depends()):
    """Compatibilidade com OAuth2 form (Swagger UI)"""
    user = DEMO_USERS.get(form.username)
    if not user or not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/user/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user["name"],
        "email": current_user["email"],
        "lang": current_user["lang"],
        "role": current_user["role"],
    }


@app.get("/api/shifts/week")
def get_week_shifts(current_user: dict = Depends(get_current_user)):
    """Retorna os turnos da semana atual do usuário logado."""
    # Demo data — em produção: buscar do banco
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
def get_stats(current_user: dict = Depends(get_current_user)):
    """Resumo mensal do colaborador."""
    return {
        "shifts_this_month": 18,
        "total_hours": 144,
        "next_shift": "14:00",
        "days_off": 6,
    }


@app.post("/api/schedules/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Recebe um PDF de escala e processa com o agente OpenAI."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos")

    content = await file.read()
    logger.info(f"PDF recebido: {file.filename} ({len(content)} bytes) por {current_user['email']}")

    try:
        from services.pdf_parser import PDFParser
        parser = PDFParser()
        shifts = parser.parse_from_bytes(content)
        return {
            "filename": file.filename,
            "shifts_found": len(shifts),
            "workers": list(set(s.get("worker_name", "") for s in shifts)),
            "status": "success",
        }
    except Exception as e:
        logger.error(f"Erro ao processar PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")


@app.get("/api/schedules/history")
def get_history(current_user: dict = Depends(get_current_user)):
    """Histórico de escalas importadas."""
    return {
        "schedules": [
            {"filename": "turni inviati A4 Agosto 26.pdf", "date": "10/07/2026", "shifts": 47, "status": "ok"},
            {"filename": "turni inviati A4 Luglio 26.pdf",  "date": "05/06/2026", "shifts": 44, "status": "ok"},
            {"filename": "turni inviati A4 Giugno 26.pdf",  "date": "28/05/2026", "shifts": 46, "status": "ok"},
        ]
    }
