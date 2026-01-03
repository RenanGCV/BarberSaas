import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS - Configuração permissiva (seguro com Bearer token)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Prefixo global da API
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // Validação de DTOs
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

  // Iniciar servidor
  const port = process.env.PORT || 3333;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, host);
  console.log(`🚀 API rodando em http://${host}:${port}`);
}

bootstrap();
}

bootstrap();
