# Copilot Instructions - BarberSaas

1. Descrição Geral do Produto

Crie um MicroSaaS composto por:

1. App Mobile (APK Android) — Parte pública/cliente

Onde os clientes encontram barbearias, visualizam serviços, horários e fazem agendamentos.

Sincronização em tempo real.

Pagamentos internos (Pix, cartão futuramente).

Aplicação deve ser totalmente fluida e animada, com transições premium semelhantes ao design referencial anexado.

2. Web App (Painel do barbeiro)

Gestão da barbearia.

Relatórios.

Controle financeiro.

Cadastro de profissionais.

Gestão da agenda.

Marketing (promoções, cupons e notificações push).

3. Backend

API escalável.

Banco de dados otimizado.

Suporte a multi-tenant (cada barbearia = espaço isolado).

Webhooks para pagamentos.

2. Requisitos de Design

Use como referência estética o layout anexado (tema dark + laranja premium).
O design deve seguir:

Estilo premium, minimalista, fluido.

Praticamente nenhuma “troca brusca de tela”:
utilizar animações suaves e micro-transições.

UI responsiva no web e mobile.

3. Funcionalidades — especificação detalhada
3.1 — APP MOBILE (Cliente)
Autenticação

Login com email, telefone ou Google.

Recuperação de senha com OTP.

Cadastro rápido.

Home

Lista de barbearias próximas.

Destaques do dia.

Serviços populares.

Promoções.

Agenda do Cliente

Seleção de profissional.

Seleção de serviço.

Seleção de horário.

Confirmação de agendamento.

Histórico de agendamentos.

Cancelamentos.

Avaliações.

Perfil

Nome, foto, telefone, email.

Endereço opcional.

Preferências.

Meu financeiro (histórico de pagamentos).

3.2 — PAINEL WEB (Barbeiro / Gestor)
Dashboard

Agendamentos do dia.

Total recebido hoje.

Caixa atual.

Próximos agendamentos.

Status dos profissionais.

Gestão da Agenda

Criar/editar serviços (preço, duração).

Criar horários disponíveis.

Agenda visual (dia, semana, mês).

Confirmar/recusar agendamentos.

Bloquear horários.

Gestão de Profissionais

Cadastro de funcionários.

Comissão por serviço.

Controle de horários individuais.

Relatório individual.

Gestão Financeira (CORE DO PRODUTO)

Registro automático de entradas (via agendamentos pagos).

Registro manual de entradas (produtos vendidos).

Registro de despesas.

Caixa diário: abertura, movimentações, fechamento.

Extrato completo.

Categorias de despesas e receitas.

Relatório de fluxo de caixa.

Relatório de comissão dos barbeiros.

Exportação: CSV + PDF.

Tela de conciliação financeira.

Marketing

Push notifications.

Promoções.

Cupons.

Programas de fidelidade.

4. Arquitetura Recomendada

A LLM deve automaticamente escolher ou gerar:

Front-end Mobile

React Native + Expo
ou

Flutter
(priorizar RN caso não especificado)

Front-end Web

Next.js 14 (app router) + Tailwind

Backend

Node.js (NestJS) ou Django FastAPI (LLM decide e implementa de forma limpa)

JWT + Refresh Token

Multi-tenant (cada barbearia separada)

Rate limiting

Middlewares de segurança

Banco de Dados

PostgreSQL (principal)

Redis (fila + cache)

Prisma ou equivalente

Infraestrutura

Docker

Migrations automatizadas

Cloud deploy (Vercel + Railway ou Render)

Real-time

Socket.io ou WebSockets nativos

Notificações push via Firebase

Pagamentos

Pix (via API de terceiros)

Preparar camada para cartões

5. Entregáveis esperados pela LLM

A LLM deve gerar:

1. Arquitetura completa

Fluxo geral

Diagramas (ASCII mesmo)

Organização de pastas

Explicação técnica

2. Back-end completo

Rotas, controllers, services, modules

Schemas do banco

Migrations

Autenticação segura

Middlewares

Multitenant

Webhooks

3. Aplicação Mobile

Todas telas baseadas no design referência

Navegação fluida com animações avançadas

Tela por tela com código

Estilos premium

Validações

Consumo da API

Controle offline mínimo (cache)

4. Painel Web

Dashboard completo

Telas de gestão

Tabelas, filtros e relatórios

Código 100% funcional

Layout responsivo

5. Sistema Financeiro

Criar modelos, endpoints, cálculos, regras e operações:

Fechamento de caixa

Fluxo de caixa

Históricos

Categorias

Despesas

Receitas

Conciliação

Exportação CSV/PDF

Cálculo de comissão

6. Documentação

README principal

Documentação da API

Instruções de instalação

Passo a passo para rodar localmente

Fluxo de desenvolvimento

7. Scripts

Script de seed com dados falsos

Script de criação inicial do admin

Script de build

6. Estilo de Entrega

A LLM deve:

Responder tudo em português.

Incluir blocos de código completos.

Não omitir arquivos.

Mostrar toda a estrutura do projeto.

Produzir código organizado, comentado e pronto para subir em repositório.

Usar práticas modernas e seguras.

Incluir animações premium na UI (mobile e web).

Utilizar o design referencial anexado como guia visual.

7. Objetivo final da resposta da LLM

Ao receber este prompt, você (LLM) deve entregar o projeto inteiro,
incluindo código, estrutura, arquitetura, telas, backend, banco de dados e documentação — pronto para rodar.

8. Estilo de Design (com base na imagem anexada)

O aplicativo deve seguir integralmente o estilo visual apresentado na referência anexada, composto por um design premium, moderno e altamente polido, com as seguintes características:

Paleta Dark Premium: fundo em tons de grafite e preto suave, com contrastes em laranja vibrante (#F5A027 aprox.).

Tipografia Clean e Minimalista: fontes finas, legíveis e equilibradas, com espaçamento confortável e hierarquia visual clara.

Componentes com Cantos Arredondados e Sombras Suaves: cartões, botões e containers com bordas arredondadas em 16–24px e sombras difusas para profundidade.

Ícones Minimalistas: ícones simples e monocromáticos, com visual flat ou outline fino.

Fotos com Destaque Visual: miniaturas e banners com imagens em alta qualidade, nos padrões estéticos de barbearias premium.

Ilustrações no Estilo Flat Moderno: personagens e elementos ilustrados com formas suaves, paleta reduzida e cenários simples.

Navegação Fluida e Transições Suaves: animações naturais, microinterações e deslizamentos consistentes entre telas.

Botões e Ações Claras: botões principais em laranja intenso, com alto contraste e feedback visual imediato.

Layout Modular e Bem Organizado: sessões bem separadas, alinhamento preciso e consistência entre todas as telas.

Estética de App Premium: a interface passa sensação de produto caro, refinado e profissional, com foco em beleza, simetria e equilíbrio visual.