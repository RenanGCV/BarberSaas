import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da API' })
  @ApiResponse({ status: 200, description: 'API e banco de dados operacionais' })
  async check() {
    try {
      // Testar conexão com o banco
      await this.prisma.$queryRaw`SELECT 1`;
      
      const userCount = await this.prisma.user.count();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
        users: userCount,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        uptime: process.uptime(),
      };
    }
  }

  @Post('seed')
  @ApiOperation({ summary: 'Inicializar banco de dados com dados de exemplo' })
  async seed(@Query('secret') secret: string) {
    // Proteção simples por secret
    if (secret !== process.env.SEED_SECRET && secret !== 'barbersaas2026') {
      return { error: 'Unauthorized' };
    }

    // Verificar se já tem dados
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      return { 
        message: 'Banco já possui dados',
        users: userCount 
      };
    }

    try {
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Criar barbearia
      const tenant = await this.prisma.tenant.create({
        data: {
          name: 'Barbearia Premium',
          slug: 'barbearia-premium',
          phone: '(11) 98765-4321',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          latitude: -23.5505,
          longitude: -46.6333,
          openTime: '09:00',
          closeTime: '20:00',
          isActive: true,
        },
      });

      // Criar owner
      const owner = await this.prisma.user.create({
        data: {
          name: 'João Silva (Dono)',
          email: 'owner@barbearia.com',
          phone: '(11) 98765-4321',
          password: hashedPassword,
          role: 'OWNER',
          tenantId: tenant.id,
          isActive: true,
        },
      });

      // Criar barbeiro
      const barberUser = await this.prisma.user.create({
        data: {
          name: 'Carlos Barbeiro',
          email: 'barber@barbearia.com',
          phone: '(11) 91234-5678',
          password: hashedPassword,
          role: 'BARBER',
          tenantId: tenant.id,
          isActive: true,
        },
      });

      const barber = await this.prisma.barber.create({
        data: {
          userId: barberUser.id,
          tenantId: tenant.id,
          specialties: ['Corte', 'Barba'],
          commissionRate: 0.5,
          isActive: true,
        },
      });

      // Criar cliente
      await this.prisma.user.create({
        data: {
          name: 'Cliente Teste',
          email: 'cliente@teste.com',
          phone: '(11) 99999-8888',
          password: hashedPassword,
          role: 'CUSTOMER',
          tenantId: tenant.id,
          isActive: true,
        },
      });

      // Criar serviços
      const corte = await this.prisma.service.create({
        data: {
          name: 'Corte Masculino',
          description: 'Corte tradicional ou moderno',
          price: 45.00,
          duration: 30,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      const barba = await this.prisma.service.create({
        data: {
          name: 'Barba Completa',
          description: 'Aparar e modelar barba',
          price: 35.00,
          duration: 20,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      // Vincular serviços ao barbeiro
      await this.prisma.barberService.createMany({
        data: [
          { barberId: barber.id, serviceId: corte.id },
          { barberId: barber.id, serviceId: barba.id },
        ],
      });

      return {
        message: 'Seed executado com sucesso!',
        tenant: tenant.name,
        users: 3,
        credentials: {
          owner: 'owner@barbearia.com / 123456',
          barber: 'barber@barbearia.com / 123456',
          customer: 'cliente@teste.com / 123456',
        },
      };
    } catch (error: any) {
      return {
        error: 'Erro ao executar seed',
        message: error.message,
      };
    }
  }
}
