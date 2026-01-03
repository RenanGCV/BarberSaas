import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import Tokens = require('csrf');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  
  // Cookie Parser (necessário para CSRF)
  app.use(cookieParser());
  
  // CSRF Protection (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    const tokens = new Tokens();
    const secret = process.env.CSRF_SECRET || tokens.secretSync();
    
    app.use((req: any, res: any, next: any) => {
      // Pular CSRF para rotas públicas (com ou sem prefixo /api)
      const publicRoutes = ['/auth/login', '/auth/register', '/health', '/api/auth/login', '/api/auth/register', '/api/health'];
      if (publicRoutes.some(route => req.path === route || req.path.startsWith(route))) {
        return next();
      }
      
      // Gerar e validar token CSRF
      if (!req.cookies['XSRF-TOKEN']) {
        const token = tokens.create(secret);
        res.cookie('XSRF-TOKEN', token, { httpOnly: false, sameSite: 'strict' });
      }
      
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        const token = req.headers['x-xsrf-token'] || (req.body && req.body._csrf);
        if (!tokens.verify(secret, token)) {
          return res.status(403).json({ message: 'Token CSRF inválido' });
        }
      }
      
      next();
    });
  }
  
  // CORS Configuration - aceita qualquer subdomínio do Vercel/Railway
  const corsOriginHandler = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sem origin (mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }

    // Lista de origens permitidas (via variável de ambiente)
    const allowedOrigins: string[] = [];

    // Em desenvolvimento, permitir localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    }

    // Adicionar origens da variável de ambiente
    if (process.env.CORS_ORIGIN) {
      process.env.CORS_ORIGIN.split(',').forEach(o => allowedOrigins.push(o.trim()));
    }

    // Verificar se a origem está na lista ou é um domínio Vercel/Railway
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') ||
                      origin.endsWith('.railway.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };

  app.enableCors({
    origin: corsOriginHandler,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('BarberSaas API')
    .setDescription('API completa para gestão de barbearias')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('users', 'Usuários')
    .addTag('tenants', 'Barbearias')
    .addTag('barbers', 'Barbeiros')
    .addTag('services', 'Serviços')
    .addTag('appointments', 'Agendamentos')
    .addTag('payments', 'Pagamentos')
    .addTag('transactions', 'Transações')
    .addTag('cash-flow', 'Fluxo de Caixa')
    .addTag('promotions', 'Promoções')
    .addTag('reports', 'Relatórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  
  // IMPORTANTE: Em produção (Railway/Docker), precisa ouvir em 0.0.0.0
  // para aceitar conexões externas
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  await app.listen(port, host);

  console.log(`\n🚀 BarberSaas API rodando em: http://${host}:${port}`);
  console.log(`📚 Documentação Swagger: http://${host}:${port}/api/docs\n`);
}

bootstrap();
