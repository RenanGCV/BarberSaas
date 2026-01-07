# 📱 Guia: Como Agendar Sem Login

## 🎯 Fluxo Completo de Agendamento Público

### Opção 1: Pela Tela de Login

1. **Abra o app** - Você será direcionado para a tela de login
2. **Clique em "Continuar como convidado"** - Botão cinza na parte inferior
3. **Navegue pela lista de barbearias** - Veja todas as barbearias disponíveis
4. **Selecione uma barbearia** - Clique no card da barbearia desejada
5. **Escolha um serviço** - Veja a lista de serviços com preços
6. **Clique no serviço** - Será redirecionado para seleção de horário
7. **Preencha seus dados**:
   - Nome completo
   - Telefone (WhatsApp)
   - Observações (opcional)
8. **Confirme o agendamento** - Clique em "Confirmar Agendamento"
9. **Pronto!** - Você e a barbearia receberão confirmação via WhatsApp

### Opção 2: Acesso Direto

Se você já está no app e quer navegar sem login:

1. **Use a rota pública**: `/(public)`
2. **Ou navegue para**: `/booking/barbershop/[id]`

## 🔄 Estrutura de Navegação

```
Login
  ↓
  ├─→ Fazer Login (usuário registrado)
  │   └─→ (tabs) - Área autenticada
  │
  └─→ Continuar como convidado
      └─→ (public)
          └─→ Home Pública
              └─→ Selecionar Barbearia
                  └─→ /booking/barbershop/[id]
                      └─→ Lista de Serviços
                          └─→ /booking/guest-info
                              └─→ Preencher Dados
                                  └─→ Confirmar Agendamento
```

## 📂 Rotas Disponíveis

### Rotas Públicas (sem autenticação)

- `/(public)` - Home com lista de barbearias
- `/booking/barbershop/[id]` - Detalhes da barbearia
- `/booking/guest-info` - Formulário de agendamento

### Rotas Protegidas (com autenticação)

- `/(tabs)` - Área do cliente logado
- `/(tabs)/appointments` - Meus agendamentos
- `/(tabs)/profile` - Perfil do usuário

## 🎨 Componentes Criados

### Telas

1. **HomeScreen** (`(public)/index.tsx`)
   - Lista todas as barbearias
   - Campo de busca
   - Cards clicáveis

2. **BarbershopDetailScreen** (`booking/barbershop/[id].tsx`)
   - Informações da barbearia
   - Lista de serviços (clicáveis)
   - Lista de barbeiros (informativo)

3. **GuestBookingScreen** (`booking/guest-info.tsx`)
   - Resumo do agendamento
   - Formulário com nome e telefone
   - Validação de dados
   - Confirmação via WhatsApp

### Guards de Navegação

O `_layout.tsx` principal foi atualizado para permitir:
- Rotas públicas sem autenticação
- Rotas de booking acessíveis a todos
- Redirecionamento inteligente baseado no estado de autenticação

## 🔐 Diferenças entre Fluxos

### Cliente Logado
- Dados preenchidos automaticamente
- Histórico de agendamentos
- Cancelamento direto pelo app
- Notificações push

### Cliente Convidado (Sem Login)
- Precisa informar nome e telefone
- Recebe confirmação via WhatsApp
- Não tem histórico no app
- Barbearia recebe notificação do agendamento

## 📱 Testar Localmente

```bash
# Inicie o app mobile
cd apps/mobile
npx expo start

# Escaneie o QR code
# Ou pressione 'a' para Android / 'i' para iOS
```

## 🚀 Em Produção

Após o deploy:

1. Abra o app
2. Clique em "Continuar como convidado"
3. Navegue e agende sem necessidade de cadastro!

## 💡 Benefícios

✅ **Menos fricção** - Cliente agenda sem criar conta  
✅ **Mais conversões** - Reduz barreiras de entrada  
✅ **Flexibilidade** - Cliente escolhe se quer se cadastrar depois  
✅ **WhatsApp integrado** - Comunicação direta e eficiente  

---

**Nota**: A integração WhatsApp precisa ser configurada no backend (ver [WHATSAPP-CONFIG.md](WHATSAPP-CONFIG.md))
