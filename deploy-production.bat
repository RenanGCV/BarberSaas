@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  BarberSaaS - Deploy Automatico
echo ========================================
echo.

REM Verificar se esta no diretorio correto
if not exist "package.json" (
    echo ERRO: Execute este script na raiz do projeto BarberSaaS
    exit /b 1
)

echo [1/5] Verificando dependencias...

REM Verificar Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Instalando Vercel CLI...
    call npm install -g vercel
)

REM Verificar Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo Instalando Railway CLI...
    call npm install -g @railway/cli
)

echo [OK] Dependencias verificadas
echo.

echo [2/5] Fazendo build do backend...
cd apps\api
call npm install
call npx prisma generate
call npm run build
cd ..\..
echo [OK] Build do backend concluido
echo.

echo [3/5] Fazendo build do frontend...
cd apps\web
call npm install
call npm run build
cd ..\..
echo [OK] Build do frontend concluido
echo.

echo [4/5] Fazendo deploy do backend no Railway...
call railway up
echo [OK] Backend deployado
echo.

echo [5/5] Fazendo deploy do frontend na Vercel...
cd apps\web
call vercel --prod
cd ..\..
echo [OK] Frontend deployado
echo.

echo ========================================
echo  Deploy Concluido com Sucesso!
echo ========================================
echo.
echo Proximos passos:
echo 1. Configurar variaveis de ambiente no Railway
echo 2. Configurar NEXT_PUBLIC_API_URL na Vercel
echo 3. Executar migrations: railway run npx prisma migrate deploy
echo 4. Testar a aplicacao
echo.
echo URLs:
echo - Frontend: Verifique o output do Vercel acima
echo - Backend: Execute 'railway status' para ver a URL
echo.

pause
