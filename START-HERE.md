# 🚀 Quick Start - BarberSaaS

> **Para desenvolvedores que vão continuar o projeto em outra máquina**  
> **Última atualização:** 03/12/2025

## 📋 Leia Primeiro

**IMPORTANTE:** Antes de começar a codificar, leia:

1. 📘 **CONTEXTO-COMPLETO-PROJETO.md** - Documento principal com TUDO
2. 📊 **SPRINT-MELHORIAS-CONCLUIDA.md** - Última sprint (o que foi feito)
3. ✅ **Todo List** no VS Code - Próximas tarefas priorizadas

## ⚡ Setup Rápido (5 minutos)

```bash
# 1. Clone
git clone https://github.com/RenanGCV/BarberSaas.git
cd BarberSaas

# 2. Instale dependências
npm install

# 3. Configure ambiente
cd apps/api
cp .env.example .env
# Edite .env com suas credenciais PostgreSQL

# 4. Setup banco
npx prisma migrate dev
npx prisma db seed

# 5. Volte para raiz
cd ../..
```

## 🏃 Rodar Projeto

```bash
# Terminal 1 - API
cd apps/api
npm run start:dev

# Terminal 2 - Web  
cd apps/web
npm run dev
```

**Acessar:**
- 🔗 API: http://localhost:3000
- 📚 Swagger: http://localhost:3000/api/docs
- 🌐 Web: http://localhost:3001

## 👤 Usuários de Teste

```
Owner:    owner@barbershop.com    / password123
Admin:    admin@barbershop.com    / password123
Barber:   barber@barbershop.com   / password123
Customer: customer@barbershop.com / password123
```

## 📊 Status Atual

- ✅ **20 de 47 problemas resolvidos (43%)**
- ✅ **3 sprints concluídas**
- ✅ **0 erros de compilação**
- ✅ **Validações 100% em português**
- ✅ **Multi-tenant funcionando**

## 🎯 Próximas Tarefas (Prioridade)

### 🔥 ALTA (Sprint 4)
1. **Auto-detect OWNER** - Primeiro usuário de tenant vira OWNER
2. **WorkingHours** - Adicionar horários de trabalho no schema
3. **CSRF Protection** - Implementar proteção CSRF

### 🟡 MÉDIA
4. **Endpoint de Schedule** - GET /barbers/:id/schedule
5. **Endpoint de Disponibilidade** - POST /appointments/check-availability
6. **Swagger Completo** - Documentar todos endpoints

## 📁 Estrutura Importante

```
apps/
├── api/src/
│   ├── auth/          ✅ Completo
│   ├── appointments/  ✅ Completo + validações
│   ├── barbers/       ✅ Completo + /me/appointments
│   ├── common/
│   │   ├── filters/   ✅ HttpExceptionFilter
│   │   ├── decorators/✅ Custom validators
│   │   └── dto/       ✅ PaginationDto
│   └── tenants/       ✅ Multi-tenant funcionando
└── web/src/
    └── app/           ⚠️ Faltam loading states
```

## 🔧 Comandos Úteis

```bash
# Migration nova
cd apps/api
npx prisma migrate dev --name nome_da_migration

# Reset banco (CUIDADO!)
npx prisma migrate reset

# Testes
npm run test
npm run test:watch

# Build
npm run build
```

## ⚠️ Pontos de Atenção

- ✅ Multi-tenant está 100% isolado
- ✅ Validações completas em português
- ✅ Global Exception Filter ativo
- ⚠️ CSRF ainda não implementado
- ⚠️ Cache Redis preparado mas não usado
- ⚠️ Testes E2E faltam

## 📚 Documentação Completa

| Documento | Conteúdo |
|-----------|----------|
| **CONTEXTO-COMPLETO-PROJETO.md** | 📘 Tudo sobre o projeto |
| **SPRINT-MELHORIAS-CONCLUIDA.md** | 📊 Sprint 3 detalhada |
| **VALIDATION-IMPROVEMENTS.md** | 🛡️ Guia de validações |
| **ANALISE-COMPLETA-PROJETO.md** | 🔍 47 problemas identificados |
| **API.md** | 🔗 Endpoints disponíveis |

## 🚨 Antes de Commitar

- [ ] `npm run build` - sem erros
- [ ] `npm run test` - testes passando
- [ ] Validações em português
- [ ] Transform decorators aplicados
- [ ] TenantId validado
- [ ] Swagger atualizado
- [ ] Documentação atualizada

## 💡 Dica

Se está começando agora, faça nesta ordem:

1. ✅ Rode o projeto localmente
2. ✅ Teste login com usuários de seed
3. ✅ Leia CONTEXTO-COMPLETO-PROJETO.md
4. ✅ Escolha uma tarefa da todo list
5. ✅ Implemente seguindo os padrões existentes
6. ✅ Atualize documentação

## 📞 Ajuda

- **Repositório:** https://github.com/RenanGCV/BarberSaas
- **Branch:** main
- **Última atualização:** 03/12/2025

---

**Boa codificação! 🚀**
