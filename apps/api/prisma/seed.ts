import { AppointmentStatus, PaymentMethod, PaymentStatus, PrismaClient, TransactionType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
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

  // Criar usuário proprietário
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

  // Criar barbeiros
  const barber1User = await prisma.user.create({
    data: {
      email: 'joao@barbearia.com',
      password: hashedPassword,
      name: 'João Santos',
      phone: '(11) 91234-5678',
      role: UserRole.BARBER,
      tenantId: tenant1.id,
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
  });

  const barber1 = await prisma.barber.create({
    data: {
      userId: barber1User.id,
      tenantId: tenant1.id,
      specialties: ['Corte Clássico', 'Barba', 'Degradê'],
      commissionRate: 0.5,
    },
  });

  const barber2User = await prisma.user.create({
    data: {
      email: 'pedro@barbearia.com',
      password: hashedPassword,
      name: 'Pedro Oliveira',
      phone: '(11) 92345-6789',
      role: UserRole.BARBER,
      tenantId: tenant1.id,
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
  });

  const barber2 = await prisma.barber.create({
    data: {
      userId: barber2User.id,
      tenantId: tenant1.id,
      specialties: ['Corte Moderno', 'Sobrancelha', 'Relaxamento'],
      commissionRate: 0.45,
    },
  });

  // Criar horários para barbeiros
  const daysOfWeek = [1, 2, 3, 4, 5, 6]; // Segunda a Sábado
  for (const day of daysOfWeek) {
    await prisma.schedule.create({
      data: {
        barberId: barber1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
      },
    });

    await prisma.schedule.create({
      data: {
        barberId: barber2.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '20:00',
      },
    });
  }

  // Criar serviços
  const service1 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      name: 'Corte Simples',
      description: 'Corte de cabelo tradicional',
      price: 45.0,
      duration: 30,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      name: 'Corte + Barba',
      description: 'Corte de cabelo + barba completa',
      price: 70.0,
      duration: 60,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      name: 'Barba',
      description: 'Aparar e modelar barba',
      price: 30.0,
      duration: 30,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      name: 'Corte Premium',
      description: 'Corte premium com produtos especiais',
      price: 90.0,
      duration: 45,
    },
  });

  // Criar clientes
  const customers = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `cliente${i}@email.com`,
        password: hashedPassword,
        name: `Cliente ${i}`,
        phone: `(11) 9${1000 + i * 100}-${1000 + i * 10}`,
        role: UserRole.CUSTOMER,
        avatar: `https://i.pravatar.cc/150?img=${i}`,
      },
    });
    customers.push(customer);
  }

  console.log(`👥 ${customers.length} clientes criados`);

  // Criar agendamentos
  const today = new Date();
  const appointments = [];

  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    appointmentDate.setHours(10, 0, 0, 0);

    for (let hour = 10; hour < 18; hour++) {
      const scheduledAt = new Date(appointmentDate);
      scheduledAt.setHours(hour, 0, 0, 0);

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const barber = Math.random() > 0.5 ? barber1 : barber2;
      const service = [service1, service2, service3, service4][
        Math.floor(Math.random() * 4)
      ];

      let status: AppointmentStatus = AppointmentStatus.CONFIRMED;
      if (dayOffset < 0) {
        status = Math.random() > 0.2 ? AppointmentStatus.COMPLETED : AppointmentStatus.CANCELLED;
      } else if (dayOffset === 0 && hour < new Date().getHours()) {
        status = AppointmentStatus.COMPLETED;
      }

      const appointment = await prisma.appointment.create({
        data: {
          tenantId: tenant1.id,
          customerId: customer.id,
          barberId: barber.id,
          serviceId: service.id,
          scheduledAt,
          status,
          notes: Math.random() > 0.7 ? 'Cliente preferencial' : null,
        },
      });

      appointments.push(appointment);

      // Criar pagamento se concluído
      if (status === AppointmentStatus.COMPLETED) {
        const paymentMethod = [
          PaymentMethod.CASH,
          PaymentMethod.PIX,
          PaymentMethod.CREDIT_CARD,
          PaymentMethod.DEBIT_CARD,
        ][Math.floor(Math.random() * 4)];

        await prisma.payment.create({
          data: {
            appointmentId: appointment.id,
            amount: service.price,
            method: paymentMethod,
            status: PaymentStatus.PAID,
            paidAt: scheduledAt,
          },
        });
      }
    }
  }

  console.log(`📅 ${appointments.length} agendamentos criados`);

  // Criar caixa do dia atual
  const cashFlow = await prisma.cashFlow.create({
    data: {
      tenantId: tenant1.id,
      date: today,
      openingBalance: 500.0,
      openedBy: owner1.id,
      isOpen: true,
    },
  });

  // Criar transações
  const completedAppointments = appointments.filter(
    a => a.status === AppointmentStatus.COMPLETED,
  );

  for (const appointment of completedAppointments) {
    const service = [service1, service2, service3, service4].find(
      s => s.id === appointment.serviceId,
    );

    if (service) {
      const payment = await prisma.payment.findUnique({
        where: { appointmentId: appointment.id },
      });

      await prisma.transaction.create({
        data: {
          tenantId: tenant1.id,
          type: TransactionType.INCOME,
          category: 'Serviços',
          amount: service.price,
          description: `Serviço: ${service.name}`,
          paymentMethod: payment?.method,
          appointmentId: appointment.id,
          cashFlowId: appointment.scheduledAt.toDateString() === today.toDateString() ? cashFlow.id : null,
          createdBy: owner1.id,
        },
      });
    }
  }

  // Criar algumas despesas
  const expenseCategories = [
    { category: 'Produtos', amount: 350.0 },
    { category: 'Energia', amount: 280.0 },
    { category: 'Água', amount: 120.0 },
    { category: 'Internet', amount: 100.0 },
  ];

  for (const expense of expenseCategories) {
    await prisma.transaction.create({
      data: {
        tenantId: tenant1.id,
        type: TransactionType.EXPENSE,
        category: expense.category,
        amount: expense.amount,
        paymentMethod: PaymentMethod.PIX,
        cashFlowId: cashFlow.id,
        createdBy: owner1.id,
      },
    });
  }

  console.log('💰 Transações criadas');

  // Criar promoções
  const promotion = await prisma.promotion.create({
    data: {
      tenantId: tenant1.id,
      code: 'PRIMEIRA',
      name: 'Primeira vez',
      description: '20% de desconto para novos clientes',
      type: 'PERCENTAGE',
      value: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUses: 100,
    },
  });

  console.log('🎁 Promoções criadas');

  // Criar avaliações
  const completedWithBarber1 = completedAppointments
    .filter(a => a.barberId === barber1.id)
    .slice(0, 5);

  for (const appointment of completedWithBarber1) {
    await prisma.review.create({
      data: {
        tenantId: tenant1.id,
        customerId: appointment.customerId,
        barberId: barber1.id,
        appointmentId: appointment.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 ou 5 estrelas
        comment: 'Excelente atendimento! Muito profissional.',
      },
    });
  }

  console.log('⭐ Avaliações criadas');

  // ============= CRIAR BARBEARIA 2 =============
  console.log('🏪 Criando Barbearia Estilo...');
  
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Barbearia Estilo',
      slug: 'barbearia-estilo',
      phone: '(11) 97654-3210',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      latitude: -23.5611,
      longitude: -46.6562,
      openTime: '08:00',
      closeTime: '19:00',
      isActive: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner@estilo.com',
      password: hashedPassword,
      name: 'Roberto Costa',
      phone: '(11) 97654-3210',
      role: UserRole.OWNER,
      tenantId: tenant2.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        tenantId: tenant2.id,
        name: 'Corte Executivo',
        price: 55.0,
        duration: 30,
      },
      {
        tenantId: tenant2.id,
        name: 'Pacote Completo',
        price: 85.0,
        duration: 90,
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- 2 Barbearias`);
  console.log(`- ${customers.length} Clientes`);
  console.log(`- 3 Barbeiros`);
  console.log(`- 6 Serviços`);
  console.log(`- ${appointments.length} Agendamentos`);
  console.log(`- 1 Caixa aberto`);
  console.log(`- 1 Promoção ativa`);
  console.log('\n👤 Credenciais de acesso:');
  console.log('Owner: owner@barbearia.com / 123456');
  console.log('Barbeiro 1: joao@barbearia.com / 123456');
  console.log('Barbeiro 2: pedro@barbearia.com / 123456');
  console.log('Cliente: cliente1@email.com / 123456');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
