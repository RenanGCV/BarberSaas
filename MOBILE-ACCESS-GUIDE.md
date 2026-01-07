# 📱 Guia Completo: Como Acessar o App Mobile

## 🎯 3 Formas de Acessar

### 1️⃣ Via Expo Go (Desenvolvimento - Mais Rápido) ⚡

**Pré-requisitos:**
- Smartphone (Android ou iOS)
- App **Expo Go** instalado
- Estar na mesma rede Wi-Fi do computador

**Passo a Passo:**

```bash
# 1. Navegue até a pasta mobile
cd apps/mobile

# 2. Instale as dependências (primeira vez)
npm install

# 3. Configure o arquivo .env
# Copie o .env.example e ajuste as URLs
cp .env.example .env

# 4. Edite o .env com a URL da API
# EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333
# Exemplo: EXPO_PUBLIC_API_URL=http://192.168.1.100:3333

# 5. Inicie o Expo
npx expo start
```

**No seu celular:**

1. **Instale o Expo Go:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Abra o Expo Go**

3. **Escaneie o QR Code** que apareceu no terminal
   - Android: Use o Expo Go para escanear
   - iOS: Use a câmera nativa do iPhone

4. **Aguarde o carregamento** - O app abrirá automaticamente! 🎉

---

### 2️⃣ Build APK (Android - Produção) 📦

**Para instalar direto no Android sem Expo Go:**

```bash
cd apps/mobile

# Build APK para desenvolvimento/teste
npx eas build --platform android --profile preview --local

# Ou build na nuvem do Expo
npx eas build --platform android --profile preview
```

**Após o build:**
- O APK ficará disponível para download
- Envie para o celular e instale
- **Atenção**: Ative "Instalar apps desconhecidos" nas configurações

**Link direto do APK:**
- Será gerado após o build
- Compartilhe o link com clientes/testadores

---

### 3️⃣ Emulador Local (Desenvolvimento) 💻

#### Android Studio

```bash
# 1. Instale o Android Studio
# https://developer.android.com/studio

# 2. Configure um AVD (Android Virtual Device)

# 3. Inicie o emulador

# 4. Execute o app
cd apps/mobile
npx expo start
# Pressione 'a' para abrir no Android
```

#### iOS Simulator (apenas Mac)

```bash
# 1. Instale Xcode via App Store

# 2. Execute o app
cd apps/mobile
npx expo start
# Pressione 'i' para abrir no iOS
```

---

## 🔧 Configuração do .env

Crie o arquivo `apps/mobile/.env`:

```env
# URL da API (ajuste para seu IP local ou servidor)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3333

# Em produção, use o domínio
# EXPO_PUBLIC_API_URL=https://api.barbersaas.com
```

**Como descobrir seu IP local:**

Windows:
```bash
ipconfig
# Procure por "Endereço IPv4"
```

Linux/Mac:
```bash
ifconfig
# ou
ip addr show
```

---

## 🚀 Testando Localmente

### Checklist Antes de Iniciar:

✅ **Backend rodando** - `http://localhost:3333`  
✅ **Banco de dados ativo** - PostgreSQL  
✅ **Dependências instaladas** - `npm install` na pasta mobile  
✅ **.env configurado** - Com IP correto da API  
✅ **Expo Go instalado** - No celular  
✅ **Mesma rede Wi-Fi** - Computador e celular  

### Comandos Úteis:

```bash
# Iniciar em modo desenvolvimento
npx expo start

# Limpar cache e reiniciar
npx expo start -c

# Ver logs em tempo real
npx expo start --dev-client

# Build para preview
eas build --platform android --profile preview
```

---

## 📲 Fluxos Disponíveis no App

### 🔓 Sem Login (Público):

1. **Abra o app**
2. **Clique em "Continuar como convidado"**
3. **Navegue pelas barbearias**
4. **Selecione serviço e horário**
5. **Informe nome e telefone**
6. **Receba confirmação via WhatsApp**

### 🔐 Com Login (Cliente Cadastrado):

1. **Faça login** com email e senha
2. **Acesse "Meus Agendamentos"**
3. **Veja histórico completo**
4. **Agende novos serviços**
5. **Gerencie seu perfil**

---

## 🎨 Interface do App

### Tema Dark Premium:
- **Background:** `#1a1a1a` (preto suave)
- **Primary:** `#F5A027` (laranja vibrante)
- **Cards:** `#2a2a2a` (cinza escuro)

### Navegação:
- **Bottom Tabs:** Início, Agendamentos, Perfil
- **Stack Navigator:** Fluxo de agendamento
- **Animações:** Transições suaves com Reanimated

---

## 🔍 Troubleshooting

### Problema: "Não consigo conectar na API"

**Solução:**
1. Verifique se o backend está rodando: `http://SEU_IP:3333/health`
2. Confirme que está na mesma rede Wi-Fi
3. Verifique o `.env` com IP correto
4. Desative firewall temporariamente para testar

### Problema: "QR Code não funciona"

**Solução:**
1. Use a opção "Entrar manualmente" no Expo Go
2. Digite a URL que aparece no terminal
3. Ou pressione `a` (Android) ou `i` (iOS) no terminal

### Problema: "App não atualiza"

**Solução:**
```bash
# Limpar cache
npx expo start -c

# Ou reinstalar dependências
rm -rf node_modules
npm install
npx expo start
```

---

## 📦 Estrutura de Navegação

```
App
├── (auth)          # Rotas de autenticação
│   ├── login       # Tela de login
│   └── register    # Tela de cadastro
│
├── (public)        # Rotas públicas (sem login)
│   └── index       # Home com lista de barbearias
│
├── booking         # Fluxo de agendamento
│   ├── barbershop/[id]   # Detalhes da barbearia
│   └── guest-info        # Formulário de agendamento
│
└── (tabs)          # Área autenticada
    ├── index              # Home
    ├── appointments       # Meus agendamentos
    └── profile            # Perfil
```

---

## 🌐 URLs de Acesso

### Desenvolvimento:
- **API Local:** `http://192.168.x.x:3333`
- **Expo DevTools:** `http://localhost:19002`

### Produção:
- **API:** `https://api.barbersaas.com`
- **Download APK:** Link gerado após build

---

## 💡 Dicas

✨ **Reload rápido:** Agite o celular e clique em "Reload"  
✨ **Debug:** Use Expo DevTools para ver logs  
✨ **Performance:** Modo produção é mais rápido que dev  
✨ **Testes:** Use credenciais de teste do README principal  

---

## 🆘 Suporte

**Problemas comuns:**
- [Troubleshooting Expo](https://docs.expo.dev/troubleshooting/overview/)
- [React Native Docs](https://reactnative.dev/docs/troubleshooting)

**Logs úteis:**
```bash
# Ver logs do app
npx expo start
# Depois pressione 'j' para abrir debugger
```

---

## 🚀 Deploy Produção

### Expo Application Services (EAS):

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure o projeto
eas build:configure

# 4. Build produção
eas build --platform android --profile production

# 5. Publicar na Play Store/App Store
eas submit
```

**Documentação completa:** https://docs.expo.dev/build/setup/

---

**Pronto para testar!** 🎉

Qualquer dúvida, consulte os documentos:
- [README.md](../../../README.md) - Guia geral
- [GUEST-BOOKING-GUIDE.md](../../../GUEST-BOOKING-GUIDE.md) - Fluxo sem login
- [WHATSAPP-CONFIG.md](../../../WHATSAPP-CONFIG.md) - Configurar WhatsApp
