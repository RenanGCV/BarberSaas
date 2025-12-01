# 🤖 Guia para Agentes de IA - BarberSaas

Este documento contém instruções específicas para agentes de IA trabalharem eficientemente neste codebase.

## 📋 Estrutura do Projeto (Implementada)

### Monorepo Workspace

```
barbersaas/
├── apps/api/          ✅ Backend NestJS + Prisma + PostgreSQL
├── apps/web/          ⏳ Next.js 14 (estrutura criada, aguardando implementação)
├── apps/mobile/       ⏳ React Native + Expo (estrutura criada, aguardando implementação)
└── packages/shared/   ✅ Tipos TypeScript compartilhados
```

**Status**:
- ✅ Backend: Estrutura completa, autenticação JWT, Prisma schema, seed
- ✅ Shared: Tipos, constantes, utils
- ⏳ Web: Aguardando implementação das telas
- ⏳ Mobile: Aguardando implementação das telas

## 🎯 Backend - Implementação NestJS

### Módulos Criados

#### ✅ Completos
- **Auth**: Login, register, refresh token, JWT strategy
- **Users**: CRUD de usuários
- **Prisma**: Service global com conexão ao PostgreSQL

#### ⏳ Stubs Criados (aguardando implementação)
- Tenants (Barbearias)
- Barbers (Barbeiros)
- Services (Serviços da barbearia)
- Appointments (Agendamentos)
- Payments (Pagamentos Pix)
- Transactions (Movimentações financeiras)
- CashFlow (Fluxo de caixa)
- Promotions (Cupons e promoções)
- Reports (Relatórios financeiros)
- Notifications (Push notifications)

### Padrão de Implementação

Ao criar um novo módulo, siga este template:

**1. DTOs** (`dto/index.ts`):
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDto {
  @ApiProperty({ example: 'Exemplo' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
```

**2. Service** (`{módulo}.service.ts`):
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModuloService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.model.findMany({
      where: { tenantId }, // SEMPRE filtrar por tenant
    });
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.prisma.model.findFirst({
      where: { id, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    return item;
  }
}
```

**3. Controller** (`{módulo}.controller.ts`):
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ModuloService } from './modulo.service';
import { CreateDto, UpdateDto } from './dto';

@ApiTags('modulo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('modulo')
export class ModuloController {
  constructor(private service: ModuloService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos' })
  findAll(@CurrentUser() user) {
    return this.service.findAll(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo' })
  create(@Body() createDto: CreateDto, @CurrentUser() user) {
    return this.service.create(createDto, user.tenantId);
  }
}
```

**4. Module** (`{módulo}.module.ts`):
```typescript
import { Module } from '@nestjs/common';
import { ModuloController } from './modulo.controller';
import { ModuloService } from './modulo.service';

@Module({
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService], // Se usado por outros módulos
})
export class ModuloModule {}
```

## 🗄️ Database - Prisma

### Schema Completo

O schema está em `apps/api/prisma/schema.prisma` com todos os models necessários:

**Models Principais**:
- User
- Tenant (Barbearia)
- Barber
- Service
- Appointment
- Payment
- Transaction
- CashFlow
- Promotion
- Review
- RefreshToken
- PushToken

### Comandos Essenciais

```bash
cd apps/api

# Após alterar schema.prisma
npm run prisma:generate

# Criar migration
npm run prisma:migrate

# Popular banco
npm run prisma:seed

# Visualizar dados
npm run prisma:studio
```

### Multi-Tenant CRÍTICO

**SEMPRE** filtrar queries por `tenantId`:

```typescript
// ❌ ERRADO - permite acesso cross-tenant
await this.prisma.appointment.findMany();

// ✅ CORRETO - isolamento por tenant
await this.prisma.appointment.findMany({
  where: { tenantId: user.tenantId }
});
```

## 🎨 Design System - Implementado

### Cores (Theme Dark Premium)

Definidas em `packages/shared/src/constants.ts`:

```typescript
COLORS = {
  primary: '#F5A027',           // Laranja principal (botões, highlights)
  primaryDark: '#D68A1F',      // Hover states
  background: '#0F0F0F',        // Fundo principal
  backgroundSecondary: '#1A1A1A', // Cards, sections
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
}
```

### Tipos Compartilhados

Todos os tipos estão em `packages/shared/src/types.ts`:

**Exemplo de uso**:
```typescript
import { User, Appointment, AppointmentStatus } from '@barbersaas/shared';

async function createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
  // ...
}
```

## 🔐 Autenticação - Funcionando

### Flow de Auth

1. **Login**: `POST /auth/login`
   - Valida credenciais
   - Retorna `accessToken` (15min) e `refreshToken` (7d)
   - Refresh token armazenado no banco

2. **Register**: `POST /auth/register`
   - Cria usuário com role CUSTOMER
   - Hash bcrypt da senha
   - Retorna tokens

3. **Refresh**: `POST /auth/refresh`
   - Valida refresh token
   - Gera novos tokens
   - Invalida token antigo

4. **Rotas Protegidas**:
```typescript
@UseGuards(JwtAuthGuard)
async protectedRoute(@CurrentUser() user) {
  // user contém: id, email, name, role, tenantId
}
```

### Credenciais de Teste (Seed)

```
Owner: owner@barbearia.com / 123456
Barbeiro: joao@barbearia.com / 123456
Cliente: cliente1@email.com / 123456
```

## 🚀 Setup e Execução

### Primeira Vez

**Windows**:
```bash
setup.bat
```

**Linux/Mac**:
```bash
chmod +x setup.sh
./setup.sh
```

### Desenvolvimento

```bash
# Backend
cd apps/api
npm run dev
# API: http://localhost:3333
# Docs: http://localhost:3333/api/docs

# Web (quando implementado)
cd apps/web
npm run dev

# Mobile (quando implementado)
cd apps/mobile
npm start
```

### Docker

```bash
# Iniciar serviços
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f postgres
```

## 📝 Checklist para Implementar Módulo

Ao implementar um dos módulos stub:

- [ ] Criar DTOs com validações (class-validator)
- [ ] Implementar Service com lógica de negócio
- [ ] SEMPRE filtrar por `tenantId` em queries
- [ ] Criar Controller com decorators Swagger
- [ ] Proteger rotas com `@UseGuards(JwtAuthGuard)`
- [ ] Usar `@CurrentUser()` para obter usuário
- [ ] Adicionar testes unitários
- [ ] Documentar endpoints no Swagger
- [ ] Testar manualmente via Swagger UI

## 🎯 Próximas Implementações Prioritárias

### 1. Backend - Módulos Críticos

**Appointments (Alta Prioridade)**:
- Validar conflitos de horário
- Verificar disponibilidade do barbeiro
- Criar pagamento vinculado
- Enviar notificação

**Transactions + CashFlow (CORE)**:
- Abrir/fechar caixa diário
- Registrar movimentações
- Calcular saldos
- Categorizar receitas/despesas

**Reports**:
- Relatório financeiro
- Comissões por barbeiro
- Exportar CSV/PDF

### 2. Web - Dashboard

Criar em `apps/web`:
- Login page
- Dashboard com métricas
- Tela de agendamentos (calendário)
- Módulo financeiro completo
- Gestão de barbeiros/serviços

### 3. Mobile - App Cliente

Criar em `apps/mobile`:
- Splash screen animada
- Login/Registro
- Home com barbearias próximas
- Tela de agendamento (passo a passo)
- Perfil do usuário

## 🔍 Troubleshooting

### Erro: "Property 'user' does not exist on type 'PrismaService'"

**Causa**: Prisma Client não foi gerado após criar/alterar schema.

**Solução**:
```bash
cd apps/api
npm run prisma:generate
```

### Erro: Migration Pendente

```bash
cd apps/api
npm run prisma:migrate
```

### Erro: Docker não Conecta

```bash
docker-compose down
docker-compose up -d
# Aguardar 10 segundos
```

### Logs de Erro

```bash
# Ver logs do backend
cd apps/api
npm run dev

# Logs do Docker
docker-compose logs -f
```

## 📚 Recursos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Visão geral do projeto |
| `INSTALLATION.md` | Guia detalhado de instalação |
| `ARCHITECTURE.md` | Estrutura completa do monorepo |
| `apps/api/prisma/schema.prisma` | Schema do banco |
| `packages/shared/src/types.ts` | Tipos compartilhados |
| `packages/shared/src/constants.ts` | Constantes (cores, rotas, mensagens) |
| `apps/api/src/auth/` | Exemplo completo de módulo |

## 💡 Dicas Finais

1. **Sempre** usar tipos do `@barbersaas/shared`
2. **Sempre** incluir decorators Swagger (`@ApiTags`, `@ApiOperation`)
3. **Sempre** filtrar por `tenantId` em queries multi-tenant
4. **Sempre** tratar erros com exceções do NestJS
5. **Sempre** validar inputs com class-validator
6. **Nunca** retornar senhas nas respostas (use `select` no Prisma)
7. **Nunca** commitar arquivos `.env`

---

**Projeto Status**: Estrutura base implementada, aguardando implementação dos módulos de negócio
**Última Atualização**: Setup inicial completo