#!/bin/bash

echo "========================================"
echo " BarberSaas - Setup Automatizado"
echo "========================================"
echo ""

echo "[1/7] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não está instalado"
    echo "Por favor, instale o Docker: https://www.docker.com/products/docker-desktop/"
    exit 1
fi
echo "Docker encontrado!"
echo ""

echo "[2/7] Instalando dependências do projeto..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO ao instalar dependências"
    exit 1
fi
echo ""

echo "[3/7] Iniciando serviços Docker (PostgreSQL, Redis, MailHog)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "ERRO ao iniciar serviços Docker"
    exit 1
fi
echo "Aguardando serviços iniciarem..."
sleep 10
echo ""

echo "[4/7] Configurando variáveis de ambiente..."
if [ ! -f "apps/api/.env" ]; then
    cp "apps/api/.env.example" "apps/api/.env"
    echo "Arquivo .env criado em apps/api"
fi
echo ""

echo "[5/7] Gerando Prisma Client..."
cd apps/api
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "ERRO ao gerar Prisma Client"
    cd ../..
    exit 1
fi
echo ""

echo "[6/7] Executando migrations do banco de dados..."
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "ERRO ao executar migrations"
    cd ../..
    exit 1
fi
echo ""

echo "[7/7] Populando banco com dados de exemplo..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "ERRO ao popular banco de dados"
    cd ../..
    exit 1
fi
cd ../..
echo ""

echo "========================================"
echo " Setup concluído com sucesso!"
echo "========================================"
echo ""
echo "Serviços disponíveis:"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo "- MailHog: http://localhost:8025"
echo ""
echo "Credenciais de acesso:"
echo "- Owner: owner@barbearia.com / 123456"
echo "- Barbeiro: joao@barbearia.com / 123456"
echo "- Cliente: cliente1@email.com / 123456"
echo ""
echo "Para iniciar o projeto:"
echo "1. Backend:  cd apps/api && npm run dev"
echo "2. Web:      cd apps/web && npm run dev"
echo "3. Mobile:   cd apps/mobile && npm start"
echo ""
echo "Documentação: http://localhost:3333/api/docs"
echo ""
