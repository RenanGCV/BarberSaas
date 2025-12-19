#!/bin/bash

echo "========================================"
echo " BarberSaaS - Deploy Automático"
echo "========================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}ERRO: Execute este script na raiz do projeto BarberSaaS${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/5] Verificando dependências...${NC}"

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    npm install -g vercel
fi

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Instalando Railway CLI...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✓ Dependências verificadas${NC}"
echo ""

echo -e "${YELLOW}[2/5] Fazendo build do backend...${NC}"
cd apps/api
npm install
npx prisma generate
npm run build
cd ../..
echo -e "${GREEN}✓ Build do backend concluído${NC}"
echo ""

echo -e "${YELLOW}[3/5] Fazendo build do frontend...${NC}"
cd apps/web
npm install
npm run build
cd ../..
echo -e "${GREEN}✓ Build do frontend concluído${NC}"
echo ""

echo -e "${YELLOW}[4/5] Fazendo deploy do backend no Railway...${NC}"
railway up
echo -e "${GREEN}✓ Backend deployado${NC}"
echo ""

echo -e "${YELLOW}[5/5] Fazendo deploy do frontend na Vercel...${NC}"
cd apps/web
vercel --prod
cd ../..
echo -e "${GREEN}✓ Frontend deployado${NC}"
echo ""

echo -e "${GREEN}========================================"
echo " ✓ Deploy Concluído com Sucesso!"
echo "========================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configurar variáveis de ambiente no Railway"
echo "2. Configurar NEXT_PUBLIC_API_URL na Vercel"
echo "3. Executar migrations: railway run npx prisma migrate deploy"
echo "4. Testar a aplicação"
echo ""
echo "URLs:"
echo "- Frontend: Verifique o output do Vercel acima"
echo "- Backend: Execute 'railway status' para ver a URL"
echo ""
