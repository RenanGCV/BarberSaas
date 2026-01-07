# Configuração de Variáveis de Ambiente para WhatsApp

Para ativar as notificações via WhatsApp, adicione as seguintes variáveis ao arquivo `.env` da API:

```env
# WhatsApp Business API Configuration
WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://api.whatsapp.com/send  # URL do provedor (Twilio, 360Dialog, etc.)
WHATSAPP_API_TOKEN=seu_token_aqui
```

## Provedores Recomendados

### 1. **Twilio** (Recomendado)
- Site: https://www.twilio.com/whatsapp
- Fácil integração
- Pricing: Pay-as-you-go

### 2. **360Dialog**
- Site: https://www.360dialog.com
- WhatsApp Business API oficial
- Bom para volume médio

### 3. **MessageBird**
- Site: https://messagebird.com
- Multi-canal
- Interface simples

## Instruções de Teste

Enquanto não configurar a API do WhatsApp:

1. As mensagens serão logadas no console (modo simulação)
2. O agendamento funcionará normalmente
3. Para ativar, basta configurar as variáveis acima

## Exemplo de Integração com Twilio

```typescript
// No whatsapp.service.ts, ajuste o sendMessage para:

const response = await fetch(`${this.apiUrl}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    To: `whatsapp:${cleanPhone}`,
    Body: message,
  }),
});
```
