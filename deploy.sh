#!/bin/bash

echo "🚀 BarberSaas - Quick Deploy Script"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    git add .
    git commit -m "feat: complete BarberSaas project ready for deploy"
fi

# Backend Deploy (Railway)
echo ""
echo "🔧 BACKEND DEPLOY (Railway)"
echo "===================================="
echo ""
echo "1. Instale Railway CLI:"
echo "   npm install -g @railway/cli"
echo ""
echo "2. Login no Railway:"
echo "   railway login"
echo ""
echo "3. Crie novo projeto:"
echo "   cd apps/api && railway init"
echo ""
echo "4. Adicione serviços:"
echo "   railway add postgresql"
echo "   railway add redis"
echo ""
echo "5. Configure variáveis de ambiente no Railway Dashboard:"
echo "   - JWT_SECRET=your-secret"
echo "   - JWT_REFRESH_SECRET=your-refresh-secret"
echo "   - CORS_ORIGIN=https://seu-app.vercel.app"
echo ""
echo "6. Deploy:"
echo "   railway up"
echo ""

# Frontend Deploy (Vercel)
echo "💻 FRONTEND DEPLOY (Vercel)"
echo "===================================="
echo ""
echo "1. Instale Vercel CLI:"
echo "   npm install -g vercel"
echo ""
echo "2. Login no Vercel:"
echo "   vercel login"
echo ""
echo "3. Deploy:"
echo "   cd apps/web && vercel --prod"
echo ""
echo "4. Configure variável de ambiente:"
echo "   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app/api"
echo ""

echo "✅ Pronto! Siga os passos acima para fazer deploy."
echo ""
echo "📖 Para mais detalhes, veja: DEPLOY.md"
echo ""
