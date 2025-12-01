@echo off
echo ========================================
echo  BarberSaas - Setup Automatizado
echo ========================================
echo.

echo [1/7] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao esta instalado ou nao esta no PATH
    echo Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo Docker encontrado!
echo.

echo [2/7] Instalando dependencias do projeto...
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias
    pause
    exit /b 1
)
echo.

echo [3/7] Iniciando servicos Docker (PostgreSQL, Redis, MailHog)...
docker-compose up -d
if errorlevel 1 (
    echo ERRO ao iniciar servicos Docker
    pause
    exit /b 1
)
echo Aguardando servicos iniciarem...
timeout /t 10 /nobreak >nul
echo.

echo [4/7] Configurando variaveis de ambiente...
if not exist "apps\api\.env" (
    copy "apps\api\.env.example" "apps\api\.env"
    echo Arquivo .env criado em apps/api
)
echo.

echo [5/7] Gerando Prisma Client...
cd apps\api
call npm run prisma:generate
if errorlevel 1 (
    echo ERRO ao gerar Prisma Client
    cd ..\..
    pause
    exit /b 1
)
echo.

echo [6/7] Executando migrations do banco de dados...
call npm run prisma:migrate
if errorlevel 1 (
    echo ERRO ao executar migrations
    cd ..\..
    pause
    exit /b 1
)
echo.

echo [7/7] Populando banco com dados de exemplo...
call npm run prisma:seed
if errorlevel 1 (
    echo ERRO ao popular banco de dados
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo ========================================
echo  Setup concluido com sucesso!
echo ========================================
echo.
echo Servicos disponiveis:
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo - MailHog: http://localhost:8025
echo.
echo Credenciais de acesso:
echo - Owner: owner@barbearia.com / 123456
echo - Barbeiro: joao@barbearia.com / 123456
echo - Cliente: cliente1@email.com / 123456
echo.
echo Para iniciar o projeto:
echo 1. Backend:  cd apps\api ^&^& npm run dev
echo 2. Web:      cd apps\web ^&^& npm run dev
echo 3. Mobile:   cd apps\mobile ^&^& npm start
echo.
echo Documentacao: http://localhost:3333/api/docs
echo.
pause
