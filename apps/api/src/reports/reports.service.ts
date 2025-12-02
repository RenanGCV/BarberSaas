import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentReportDto, CommissionReportDto, FinancialReportDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Relatório Financeiro Completo
  async getFinancialReport(reportDto: FinancialReportDto, tenantId: string) {
    const { startDate, endDate } = reportDto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Buscar todas as transações do período
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        appointment: {
          include: {
            service: true,
            barber: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Agrupar receitas por categoria
    const incomeByCategory = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc: any, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { total: 0, count: 0, percentage: 0 };
        }
        acc[t.category].total += t.amount;
        acc[t.category].count++;
        return acc;
      }, {});

    // Calcular percentuais de receita
    Object.keys(incomeByCategory).forEach(cat => {
      incomeByCategory[cat].percentage = totalIncome > 0 
        ? (incomeByCategory[cat].total / totalIncome) * 100 
        : 0;
    });

    // Agrupar despesas por categoria
    const expenseByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc: any, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { total: 0, count: 0, percentage: 0 };
        }
        acc[t.category].total += t.amount;
        acc[t.category].count++;
        return acc;
      }, {});

    // Calcular percentuais de despesa
    Object.keys(expenseByCategory).forEach(cat => {
      expenseByCategory[cat].percentage = totalExpense > 0 
        ? (expenseByCategory[cat].total / totalExpense) * 100 
        : 0;
    });

    // Métodos de pagamento detalhados
    const paymentMethods = transactions
      .filter(t => t.paymentMethod && t.type === 'INCOME')
      .reduce((acc: any, t) => {
        const method = t.paymentMethod || 'N/A';
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0, percentage: 0, avgTicket: 0 };
        }
        acc[method].count++;
        acc[method].total += t.amount;
        return acc;
      }, {});

    // Calcular percentuais e ticket médio por método
    Object.keys(paymentMethods).forEach(method => {
      paymentMethods[method].percentage = totalIncome > 0 
        ? (paymentMethods[method].total / totalIncome) * 100 
        : 0;
      paymentMethods[method].avgTicket = paymentMethods[method].total / paymentMethods[method].count;
    });

    // Evolução diária com breakdown detalhado
    const dailyEvolution = transactions.reduce((acc: any, t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { 
          income: 0, 
          expense: 0, 
          balance: 0,
          incomeCount: 0,
          expenseCount: 0,
          paymentMethods: {},
        };
      }
      if (t.type === 'INCOME') {
        acc[day].income += t.amount;
        acc[day].incomeCount++;
        
        // Agrupar por método de pagamento
        if (t.paymentMethod) {
          if (!acc[day].paymentMethods[t.paymentMethod]) {
            acc[day].paymentMethods[t.paymentMethod] = 0;
          }
          acc[day].paymentMethods[t.paymentMethod] += t.amount;
        }
      } else {
        acc[day].expense += t.amount;
        acc[day].expenseCount++;
      }
      acc[day].balance = acc[day].income - acc[day].expense;
      return acc;
    }, {});

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        avgDailyIncome: totalIncome / Object.keys(dailyEvolution).length || 0,
        avgDailyExpense: totalExpense / Object.keys(dailyEvolution).length || 0,
      },
      incomeByCategory: Object.entries(incomeByCategory)
        .map(([category, data]: [string, any]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage: data.percentage,
          avgTicket: data.total / data.count,
        }))
        .sort((a, b) => b.total - a.total),
      expenseByCategory: Object.entries(expenseByCategory)
        .map(([category, data]: [string, any]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage: data.percentage,
          avgAmount: data.total / data.count,
        }))
        .sort((a, b) => b.total - a.total),
      paymentMethods: Object.entries(paymentMethods)
        .map(([method, data]: [string, any]) => ({
          method,
          count: data.count,
          total: data.total,
          percentage: data.percentage,
          avgTicket: data.avgTicket,
        }))
        .sort((a, b) => b.total - a.total),
      dailyEvolution: Object.entries(dailyEvolution)
        .map(([date, data]: [string, any]) => ({
          date,
          income: data.income,
          expense: data.expense,
          balance: data.balance,
          incomeCount: data.incomeCount,
          expenseCount: data.expenseCount,
          paymentMethods: data.paymentMethods,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.createdAt,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        paymentMethod: t.paymentMethod,
        barberName: t.appointment?.barber?.user?.name,
        serviceName: t.appointment?.service?.name,
      })),
    };
  }

  // Relatório de Comissões dos Barbeiros
  async getCommissionReport(reportDto: CommissionReportDto, tenantId: string) {
    const { barberId, month, year } = reportDto;

    // Calcular datas do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where: any = {
      barber: { tenantId },
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'COMPLETED',
    };

    if (barberId) {
      where.barberId = barberId;
    }

    // Buscar agendamentos completados
    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Buscar dados dos barbeiros
    const barberWhere: any = { tenantId, isActive: true };
    if (barberId) {
      barberWhere.id = barberId;
    }

    const barbers = await this.prisma.barber.findMany({
      where: barberWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calcular comissões por barbeiro
    const commissions = barbers.map(barber => {
      const barberAppointments = appointments.filter(a => a.barberId === barber.id);
      
      const totalServices = barberAppointments.length;
      const totalGenerated = barberAppointments.reduce((sum, a) => sum + a.service.price, 0);
      
      // Usar comissão do barbeiro ou padrão de 40%
      const commissionRate = barber.commissionRate || 40;
      const commissionAmount = (totalGenerated * commissionRate) / 100;

      // Agrupar por serviço com mais detalhes
      const serviceBreakdown = barberAppointments.reduce((acc: any, a) => {
        const serviceName = a.service.name;
        const servicePrice = a.service.price;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            count: 0,
            total: 0,
            price: servicePrice,
            avgPerDay: 0,
          };
        }
        acc[serviceName].count++;
        acc[serviceName].total += servicePrice;
        return acc;
      }, {});

      // Calcular média por dia para cada serviço
      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      Object.keys(serviceBreakdown).forEach(service => {
        serviceBreakdown[service].avgPerDay = serviceBreakdown[service].count / daysInPeriod;
      });

      // Agrupar por dia com mais informações
      const dailyBreakdown = barberAppointments.reduce((acc: any, a) => {
        const day = a.scheduledAt.toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = {
            count: 0,
            total: 0,
            services: [],
            hours: [],
          };
        }
        acc[day].count++;
        acc[day].total += a.service.price;
        acc[day].services.push(a.service.name);
        acc[day].hours.push(a.scheduledAt.toISOString().substring(11, 16));
        return acc;
      }, {});

      return {
        barberId: barber.id,
        barberName: barber.user.name,
        commissionRate: `${commissionRate}%`,
        totalServices,
        totalGenerated,
        commissionAmount,
        avgPerDay: totalServices / daysInPeriod,
        avgTicket: totalServices > 0 ? totalGenerated / totalServices : 0,
        serviceBreakdown: Object.entries(serviceBreakdown)
          .map(([service, data]: any) => ({
            service,
            count: data.count,
            total: data.total,
            commission: (data.total * commissionRate) / 100,
            price: data.price,
            avgPerDay: data.avgPerDay,
            percentage: totalGenerated > 0 ? (data.total / totalGenerated) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total),
        dailyBreakdown: Object.entries(dailyBreakdown)
          .map(([date, data]: any) => ({
            date,
            count: data.count,
            total: data.total,
            commission: (data.total * commissionRate) / 100,
            services: data.services,
            peakHours: data.hours.sort(),
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    return {
      period: {
        month,
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalBarbers: commissions.length,
        totalServices: commissions.reduce((sum, c) => sum + c.totalServices, 0),
        totalGenerated: commissions.reduce((sum, c) => sum + c.totalGenerated, 0),
        totalCommissions,
      },
      barbers: commissions,
    };
  }

  // Relatório de Agendamentos
  async getAppointmentReport(reportDto: AppointmentReportDto, tenantId: string) {
    const { startDate, endDate } = reportDto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barber: { tenantId },
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        barber: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    const noShow = appointments.filter(a => a.status === 'NO_SHOW').length;

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';
    const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0';
    const noShowRate = total > 0 ? ((noShow / total) * 100).toFixed(2) : '0';

    // Horários mais procurados
    const timeSlots = appointments.reduce((acc: any, a) => {
      const hour = a.scheduledAt.getHours();
      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour]++;
      return acc;
    }, {});

    const popularTimeSlots = Object.entries(timeSlots)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
      }))
      .sort((a: any, b: any) => b.count - a.count);

    // Serviços mais procurados
    const services = appointments.reduce((acc: any, a) => {
      const serviceName = a.service.name;
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      if (a.status === 'COMPLETED') {
        acc[serviceName].revenue += a.service.price;
      }
      return acc;
    }, {});

    const popularServices = Object.entries(services)
      .map(([name, data]: any) => ({
        service: name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count);

    // Barbeiros mais requisitados
    const barbers = appointments.reduce((acc: any, a) => {
      const barberName = a.barber.user.name;
      if (!acc[barberName]) {
        acc[barberName] = 0;
      }
      acc[barberName]++;
      return acc;
    }, {});

    const popularBarbers = Object.entries(barbers)
      .map(([name, count]) => ({ barber: name, count }))
      .sort((a: any, b: any) => b.count - a.count);

    return {
      period: { startDate, endDate },
      summary: {
        total,
        completed,
        cancelled,
        noShow,
        pending: total - completed - cancelled - noShow,
        completionRate: `${completionRate}%`,
        cancellationRate: `${cancellationRate}%`,
        noShowRate: `${noShowRate}%`,
      },
      popularTimeSlots,
      popularServices,
      popularBarbers,
    };
  }

  // Dashboard - Métricas do Dia
  async getDashboardMetrics(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      appointmentsToday,
      upcomingAppointments,
      cashFlow,
      transactions,
      barbers,
    ] = await Promise.all([
      // Agendamentos de hoje
      this.prisma.appointment.findMany({
        where: {
          barber: { tenantId },
          scheduledAt: {
            gte: today,
            lte: endOfDay,
          },
        },
        include: {
          service: true,
          customer: {
            select: {
              name: true,
            },
          },
          barber: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      }),

      // Próximos agendamentos
      this.prisma.appointment.findMany({
        where: {
          barber: { tenantId },
          scheduledAt: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          service: true,
          customer: {
            select: {
              name: true,
            },
          },
          barber: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      // Caixa do dia
      this.prisma.cashFlow.findFirst({
        where: {
          tenantId,
          date: {
            gte: today,
            lte: endOfDay,
          },
        },
      }),

      // Transações de hoje
      this.prisma.transaction.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: today,
            lte: endOfDay,
          },
        },
      }),

      // Status dos barbeiros
      this.prisma.barber.findMany({
        where: { tenantId, isActive: true },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          appointments: {
            where: {
              scheduledAt: {
                gte: today,
                lte: endOfDay,
              },
              status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
            },
            include: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 1,
          },
        },
      }),
    ]);

    // Calcular faturamento de hoje
    const totalToday = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    // Status dos barbeiros
    const barbersStatus = barbers.map(barber => {
      const nextAppointment = barber.appointments[0];
      
      let status: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE' = 'AVAILABLE';
      
      if (nextAppointment) {
        const now = new Date();
        const appointmentEnd = new Date(
          nextAppointment.scheduledAt.getTime() + 60 * 60 * 1000 // Assumindo 1h de duração
        );
        
        if (now >= nextAppointment.scheduledAt && now <= appointmentEnd) {
          status = 'BUSY';
        }
      }

      return {
        id: barber.id,
        name: barber.user.name,
        avatar: barber.user.avatar,
        status,
        nextAppointment: nextAppointment ? {
          time: nextAppointment.scheduledAt.toTimeString().slice(0, 5),
          customer: nextAppointment.customer.name,
        } : null,
      };
    });

    // Alertas personalizados
    const alerts = [];
    
    // Alerta: Caixa não aberto
    if (!cashFlow) {
      alerts.push({
        type: 'warning',
        priority: 'high',
        title: 'Caixa não aberto',
        message: 'O caixa ainda não foi aberto hoje. Abra o caixa para começar a registrar movimentações.',
        action: 'open-cash-flow',
      });
    }

    // Alerta: Agendamentos pendentes de confirmação
    const pendingAppointments = appointmentsToday.filter(a => a.status === 'PENDING');
    if (pendingAppointments.length > 0) {
      alerts.push({
        type: 'info',
        priority: 'medium',
        title: 'Agendamentos pendentes',
        message: `${pendingAppointments.length} agendamento(s) pendente(s) de confirmação`,
        count: pendingAppointments.length,
        action: 'view-pending-appointments',
      });
    }

    // Alerta: Barbeiros sem agendamentos hoje
    const barbersWithoutAppointments = barbers.filter(b => b.appointments.length === 0);
    if (barbersWithoutAppointments.length > 0) {
      alerts.push({
        type: 'info',
        priority: 'low',
        title: 'Barbeiros sem agendamentos',
        message: `${barbersWithoutAppointments.length} barbeiro(s) sem agendamentos para hoje`,
        barbers: barbersWithoutAppointments.map(b => b.user.name),
        action: 'create-appointment',
      });
    }

    // Alerta: Faturamento abaixo da meta (exemplo: meta de R$ 500/dia)
    const dailyGoal = 500;
    const currentRevenue = totalToday;
    const now = new Date();
    const currentHour = now.getHours();
    const expectedRevenue = (dailyGoal / 12) * Math.max(currentHour - 8, 0); // Assumindo trabalho das 8h às 20h
    
    if (currentHour > 12 && currentRevenue < expectedRevenue * 0.7) {
      alerts.push({
        type: 'warning',
        priority: 'medium',
        title: 'Faturamento abaixo da meta',
        message: `Faturamento atual (R$ ${currentRevenue.toFixed(2)}) está abaixo do esperado para este horário (R$ ${expectedRevenue.toFixed(2)})`,
        currentRevenue,
        expectedRevenue,
        dailyGoal,
        action: 'view-promotions',
      });
    }

    // Alerta: Próximo agendamento em 15 minutos
    const now15min = new Date(Date.now() + 15 * 60 * 1000);
    const upcomingSoon = appointmentsToday.filter(a => 
      a.scheduledAt <= now15min && 
      a.scheduledAt > new Date() &&
      a.status === 'CONFIRMED'
    );
    
    if (upcomingSoon.length > 0) {
      alerts.push({
        type: 'info',
        priority: 'high',
        title: 'Próximos agendamentos',
        message: `${upcomingSoon.length} agendamento(s) nos próximos 15 minutos`,
        appointments: upcomingSoon.map(a => ({
          time: a.scheduledAt.toTimeString().slice(0, 5),
          customer: a.customer.name,
          barber: a.barber.user.name,
          service: a.service.name,
        })),
        action: 'view-schedule',
      });
    }

    // Alerta: Taxa de cancelamento alta
    const cancelledToday = appointmentsToday.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW');
    const cancelRate = appointmentsToday.length > 0 
      ? (cancelledToday.length / appointmentsToday.length) * 100 
      : 0;
    
    if (cancelRate > 20 && appointmentsToday.length >= 5) {
      alerts.push({
        type: 'error',
        priority: 'high',
        title: 'Taxa de cancelamento alta',
        message: `${cancelRate.toFixed(0)}% dos agendamentos foram cancelados hoje (${cancelledToday.length}/${appointmentsToday.length})`,
        cancelRate,
        totalCancelled: cancelledToday.length,
        action: 'review-cancellations',
      });
    }

    // Alerta: Caixa está aberto há muito tempo (mais de 14 horas)
    if (cashFlow && !cashFlow.closedAt) {
      const hoursSinceOpened = (now.getTime() - cashFlow.openedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceOpened > 14) {
        alerts.push({
          type: 'warning',
          priority: 'medium',
          title: 'Caixa aberto há muito tempo',
          message: `O caixa está aberto há ${hoursSinceOpened.toFixed(1)} horas. Considere fechar o caixa.`,
          hoursSinceOpened,
          action: 'close-cash-flow',
        });
      }
    }

    // Alerta: Sem agendamentos para amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const appointmentsTomorrow = await this.prisma.appointment.count({
      where: {
        barber: { tenantId },
        scheduledAt: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
      },
    });

    if (appointmentsTomorrow === 0 && currentHour > 16) {
      alerts.push({
        type: 'info',
        priority: 'low',
        title: 'Sem agendamentos para amanhã',
        message: 'Não há agendamentos confirmados para amanhã. Faça uma promoção para atrair clientes.',
        action: 'create-promotion',
      });
    }

    // Ordenar alertas por prioridade
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      date: today.toISOString().split('T')[0],
      summary: {
        appointmentsToday: appointmentsToday.length,
        completedToday: appointmentsToday.filter(a => a.status === 'COMPLETED').length,
        totalToday,
        cashFlowStatus: cashFlow ? (cashFlow.closedAt ? 'closed' : 'open') : 'not-opened',
      },
      appointmentsToday,
      upcomingAppointments,
      barbersStatus,
      alerts,
    };
  }

  // Exportar para CSV
  async exportToCSV(data: any[], filename: string): Promise<string> {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}
