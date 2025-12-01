import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [process.env.WEB_URL, process.env.MOBILE_URL],
    credentials: true,
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
  await app.listen(port);

  console.log(`\n🚀 BarberSaas API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs\n`);
}

bootstrap();
