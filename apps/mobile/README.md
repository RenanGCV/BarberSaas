# BarberSaaS Mobile App

App mobile do BarberSaaS desenvolvido com **React Native** + **Expo**.

## 🚀 Tecnologias

- **React Native** 0.73
- **Expo** ~50.0
- **Expo Router** (file-based routing)
- **TypeScript**
- **Zustand** (state management)
- **Axios** (HTTP client)
- **React Native Reanimated** (animações)
- **React Navigation** (navegação)
- **Expo Notifications** (push notifications)

## 📁 Estrutura de Pastas

```
apps/mobile/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── screens/          # Telas do app
│   ├── services/         # Serviços (API, auth, etc)
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilitários
│   └── constants/        # Constantes e tema
├── assets/               # Imagens, fontes, etc
├── app/                  # Expo Router (rotas)
├── app.json             # Configuração Expo
├── package.json
└── tsconfig.json
```

## 🎯 Funcionalidades

### Cliente:
- ✅ Login/Cadastro com validação
- ✅ Busca de barbearias próximas
- ✅ Visualização de serviços e preços
- ✅ Agendamento de horários
- ✅ Histórico de agendamentos
- ✅ Notificações push
- ✅ Pagamentos via Pix
- ✅ Avaliações de serviços
- ✅ Perfil do usuário

### Design:
- 🎨 **Tema Dark Premium** (preto + laranja #F5A027)
- 🎭 **Animações fluidas** com Reanimated
- 📱 **UI responsiva** e minimalista
- ✨ **Micro-interações** em todos os componentes

## 📦 Instalação

```bash
# Navegar para pasta mobile
cd apps/mobile

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Editar .env com suas credenciais
```

## 🏃 Rodar o App

### Desenvolvimento:

```bash
# Iniciar Expo Dev Server
npm start

# Ou diretamente no Android
npm run android

# Ou diretamente no iOS
npm run ios
```

### Produção:

```bash
# Build para Android (APK)
eas build --platform android --profile preview

# Build para iOS
eas build --platform ios --profile preview
```

## 📱 Testar no Dispositivo

1. Instalar **Expo Go** no celular
2. Escanear QR Code que aparece ao rodar `npm start`
3. App abrirá automaticamente no Expo Go

## 🔧 Configuração do Backend

Certifique-se de que a API está rodando:

```bash
cd apps/api
npm run dev
```

No `.env` do mobile, configure:

```
API_URL=http://SEU_IP_LOCAL:3000/api
```

**Importante:** Use o IP local da máquina, não `localhost`.

## 🔔 Push Notifications

### Configurar Firebase:

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicionar app Android/iOS
3. Baixar `google-services.json` (Android) ou `GoogleService-Info.plist` (iOS)
4. Adicionar credenciais no `.env`

### Testar notificações:

```typescript
import * as Notifications from 'expo-notifications';

// Registrar token
const token = await Notifications.getExpoPushTokenAsync();

// Enviar via backend
await api.post('/notifications/register-token', {
  token: token.data,
  platform: Platform.OS.toUpperCase()
});
```

## 🎨 Tema e Cores

```typescript
const theme = {
  colors: {
    primary: '#F5A027',      // Laranja premium
    background: '#1a1a1a',   // Preto suave
    card: '#2a2a2a',        // Card background
    text: '#ffffff',        // Texto principal
    textSecondary: '#999', // Texto secundário
    border: '#333',        // Bordas
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};
```

## 📸 Screenshots

_(Adicionar screenshots após implementação)_

## 🚧 Status: EM DESENVOLVIMENTO

- [x] Estrutura base
- [ ] Autenticação
- [ ] Home e listagem
- [ ] Agendamento
- [ ] Histórico
- [ ] Notificações
- [ ] Pagamentos

## 📝 Licença

MIT
