import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.barberService.deleteMany();
  await prisma.review.deleteMany();
  await prisma.pushToken.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.cashFlow.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('🧹 Dados antigos removidos');

  // Hash de senha padrão
  const hashedPassword = await bcrypt.hash('123456', 10);

  // ============= CRIAR BARBEARIA 1 =============
  console.log('🏪 Criando Barbearia Premium...');
  
  const tenant1 = await prisma.tenant.create({
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

  // Criar usuário proprietário (OWNER)
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@barbearia.com',
      password: hashedPassword,
      name: 'Carlos Silva',
      phone: '(11) 98765-4321',
      role: UserRole.OWNER,
      tenantId: tenant1.id,
    },
  });

  // Criar serviços padrão
  const services = await prisma.service.createMany({
    data: [
      {
        tenantId: tenant1.id,
        name: 'Corte Simples',
        description: 'Corte de cabelo tradicional',
        price: 45.0,
        duration: 30,
      },
      {
        tenantId: tenant1.id,
        name: 'Corte + Barba',
        description: 'Corte de cabelo + barba completa',
        price: 70.0,
        duration: 60,
      },
      {
        tenantId: tenant1.id,
        name: 'Barba',
        description: 'Aparar e modelar barba',
        price: 30.0,
        duration: 30,
      },
      {
        tenantId: tenant1.id,
        name: 'Corte Premium',
        description: 'Corte premium com produtos especiais',
        price: 90.0,
        duration: 45,
      },
    ],
  });

  // Buscar todos os serviços criados para linkar com barbeiros
  const allServices = await prisma.service.findMany({
    where: { tenantId: tenant1.id },
  });

  // Buscar todos os barbeiros ativos para criar relações
  const allBarbers = await prisma.barber.findMany({
    where: { tenantId: tenant1.id, isActive: true },
  });

  // Criar relações barber_services (todos os barbeiros oferecem todos os serviços)
  if (allBarbers.length > 0 && allServices.length > 0) {
    for (const barber of allBarbers) {
      for (const service of allServices) {
        await prisma.barberService.create({
          data: {
            barberId: barber.id,
            serviceId: service.id,
          },
        });
      }
    }
    console.log(`🔗 ${allBarbers.length * allServices.length} relações barber-service criadas`);
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- 1 Barbearia`);
  console.log(`- 1 Usuário Owner (Carlos Silva)`);
  console.log(`- ${allBarbers.length} Barbeiro(s)`);
  console.log(`- ${allServices.length} Serviços cadastrados`);
  console.log('\n👤 Credenciais de acesso:');
  console.log('Owner: owner@barbearia.com / 123456');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
