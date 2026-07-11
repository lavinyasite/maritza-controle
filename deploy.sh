#!/bin/bash
# ================================================
# Controllo Servizi — Deploy Automático
# Uso: bash /root/controllo-servizi/deploy.sh
# ================================================
set -e

PROJECT_DIR="/root/controllo-servizi"
echo "🚀 Iniciando deploy do Controllo Servizi..."

# 1. Pull do GitHub via Deploy Key (após configuração)
cd "$PROJECT_DIR"
if [ -d .git ]; then
  echo "📥 Atualizando código do GitHub..."
  GIT_SSH_COMMAND='ssh -i /root/.ssh/controllo_deploy -o StrictHostKeyChecking=no' git pull origin master
fi

# 2. Build backend
echo "🔨 Buildando backend..."
cd "$PROJECT_DIR/backend"
docker build -t controllo-backend:latest .

# 3. Build frontend
echo "🎨 Buildando frontend..."
cd "$PROJECT_DIR/frontend"
docker build -t controllo-frontend:latest .

# 4. Reiniciar containers
echo "♻️  Reiniciando containers..."
docker stop controllo-backend controllo-frontend 2>/dev/null || true
docker rm   controllo-backend controllo-frontend 2>/dev/null || true

docker run -d \
  --name controllo-backend \
  --restart unless-stopped \
  --env-file "$PROJECT_DIR/.env" \
  --network=easypanel \
  controllo-backend:latest

docker run -d \
  --name controllo-frontend \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e BACKEND_URL=http://controllo-backend:8000 \
  --network=easypanel \
  controllo-frontend:latest

echo "✅ Deploy concluído!"
docker ps --filter name=controllo --format "  {{.Names}}: {{.Status}}"
