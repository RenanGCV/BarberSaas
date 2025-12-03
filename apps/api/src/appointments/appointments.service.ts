import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsGateway } from './appointments.gateway';
import {
    ChangeStatusDto,
    CheckAvailabilityDto,
    CreateAppointmentDto,
    QueryAppointmentDto,
    UpdateAppointmentDto,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private appointmentsGateway: AppointmentsGateway,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, customerId: string | null, tenantId: string | null) {
    const { serviceId, barberId, scheduledAt, notes } = createAppointmentDto;

    // Converter data
    const appointmentDate = new Date(scheduledAt);

    // Validar data não está no passado
    if (appointmentDate < new Date()) {
      throw new BadRequestException(
        'Não é possível criar agendamento com data/hora no passado. Por favor, escolha um horário futuro.'
      );
    }

    // Buscar barbeiro primeiro para obter tenantId se necessário
    const barber = await this.prisma.barber.findFirst({
      where: {
        id: barberId,
        isActive: true,
      },
      include: {
        services: {
          where: { serviceId },
        },
        tenant: true,
      },
    });

    if (!barber) {
      throw new NotFoundException(
        `Barbeiro não encontrado ou inativo. Verifique se o ID está correto: ${barberId}`
      );
    }

    // Usar tenantId do barbeiro se não foi fornecido
    const effectiveTenantId = tenantId || barber.tenantId;

    // Verificar serviço existe e pertence ao tenant
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId: effectiveTenantId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException(
        `Serviço não encontrado ou inativo. Verifique se o serviço ${serviceId} existe e está ativo.`
      );
    }

    if (barber.services.length === 0) {
      throw new BadRequestException('Este barbeiro não oferece o serviço selecionado');
    }

    // Verificar horário de funcionamento
    const tenant = barber.tenant;
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5);

    if (appointmentTime < tenant.openTime || appointmentTime > tenant.closeTime) {
      throw new BadRequestException(
        `Horário fora do expediente. Funcionamento: ${tenant.openTime} - ${tenant.closeTime}`,
      );
    }

    // Verificar conflito de horário
    const conflict = await this.checkConflict(barberId, appointmentDate, service.duration);

    if (conflict) {
      throw new ConflictException('Barbeiro não disponível neste horário');
    }

    // Criar agendamento
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: effectiveTenantId,
        serviceId,
        barberId,
        customerId,
        scheduledAt: appointmentDate,
        notes,
        status: 'PENDING',
      },
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        customer: customerId ? {
          select: {
            name: true,
            phone: true,
          },
        } : false,
      },
    });

    // Notificar via WebSocket
    this.appointmentsGateway.notifyAppointmentCreated(appointment);

    return appointment;
  }

  async findAll(tenantId: string, customerId?: string) {
    const where: any = {
      barber: { tenantId },
    };

    if (customerId) {
      where.customerId = customerId;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findAllWithFilters(queryDto: QueryAppointmentDto, tenantId: string) {
    const { barberId, clientId, status, startDate, endDate, page = 1, limit = 20 } = queryDto;

    const where: any = {
      barber: { tenantId },
    };

    if (barberId) where.barberId = barberId;
    if (clientId) where.customerId = clientId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          service: true,
          barber: {
            include: {
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          customer: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUpcoming(tenantId: string, customerId?: string) {
    const where: any = {
      barber: { tenantId },
      scheduledAt: { gte: new Date() },
      status: { in: ['PENDING', 'CONFIRMED'] },
    };

    if (customerId) {
      where.customerId = customerId;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    });
  }

  async findOne(id: string, tenantId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        barber: { tenantId },
      },
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, tenantId: string) {
    const appointment = await this.findOne(id, tenantId);

    // Se mudar data, validar novamente
    if (updateAppointmentDto.scheduledAt) {
      const newDate = new Date(updateAppointmentDto.scheduledAt);

      if (newDate < new Date()) {
        throw new BadRequestException('Não é possível agendar no passado');
      }

      const service = await this.prisma.service.findUnique({
        where: { id: appointment.serviceId },
      });

      const conflict = await this.checkConflict(
        appointment.barberId,
        newDate,
        service!.duration,
        id,
      );

      if (conflict) {
        throw new ConflictException('Barbeiro não disponível neste horário');
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        scheduledAt: updateAppointmentDto.scheduledAt
          ? new Date(updateAppointmentDto.scheduledAt)
          : undefined,
      },
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    }).then((updated) => {
      // Notificar via WebSocket
      this.appointmentsGateway.notifyAppointmentUpdated(updated);
      return updated;
    });
  }

  async changeStatus(id: string, changeStatusDto: ChangeStatusDto, tenantId: string) {
    const appointment = await this.findOne(id, tenantId);

    // Validar transição de status
    this.validateStatusTransition(appointment.status, changeStatusDto.status);

    // Se marcar como COMPLETED, criar transação
    if (changeStatusDto.status === 'COMPLETED') {
      const service = await this.prisma.service.findUnique({
        where: { id: appointment.serviceId },
      });

      await this.prisma.transaction.create({
        data: {
          tenantId,
          type: 'INCOME',
          category: 'Serviço',
          amount: service!.price,
          description: `Agendamento #${id.slice(0, 8)} - ${service!.name}`,
          appointmentId: id,
          createdBy: appointment.customerId,
        },
      });
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: changeStatusDto.status },
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    }).then((updated) => {
      // Notificar via WebSocket
      this.appointmentsGateway.notifyAppointmentStatusChanged(updated);
      return updated;
    });
  }

  async cancel(id: string, tenantId: string, userId: string, userRole?: string) {
    const appointment = await this.findOne(id, tenantId);

    // Validar ownership: apenas o cliente dono, barbeiro responsável, admin ou owner podem cancelar
    const isCustomer = appointment.customerId === userId;
    const isBarber = appointment.barberId === userId;
    const isAdmin = userRole && ['ADMIN', 'OWNER'].includes(userRole);
    
    if (!isCustomer && !isBarber && !isAdmin) {
      throw new BadRequestException('Você não tem permissão para cancelar este agendamento');
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Não é possível cancelar agendamento já concluído');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Agendamento já cancelado');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    }).then((cancelled) => {
      // Notificar via WebSocket
      this.appointmentsGateway.notifyAppointmentCancelled(cancelled);
      return cancelled;
    });
  }

  private async checkConflict(
    barberId: string,
    scheduledAt: Date,
    duration: number,
    excludeId?: string,
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);

    const where: any = {
      barberId,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      OR: [
        {
          scheduledAt: {
            gte: scheduledAt,
            lt: endTime,
          },
        },
        {
          AND: [
            { scheduledAt: { lte: scheduledAt } },
            {
              service: {
                // Verificar se termina depois do início do novo agendamento
              },
            },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflicts = await this.prisma.appointment.findMany({
      where,
      include: { service: true },
    });

    // Validar se há overlap real considerando duração
    for (const conflict of conflicts) {
      const conflictEnd = new Date(
        conflict.scheduledAt.getTime() + conflict.service.duration * 60000,
      );

      if (
        (scheduledAt >= conflict.scheduledAt && scheduledAt < conflictEnd) ||
        (endTime > conflict.scheduledAt && endTime <= conflictEnd) ||
        (scheduledAt <= conflict.scheduledAt && endTime >= conflictEnd)
      ) {
        return true;
      }
    }

    return false;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transição de ${currentStatus} para ${newStatus} não permitida`,
      );
    }
  }

  // Agenda do barbeiro em um dia específico
  async getBarberSchedule(barberId: string, date: string, tenantId: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        barber: { tenantId },
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return appointments;
  }

  // Verificar horários disponíveis
  async checkAvailability(
    barberId: string,
    checkAvailabilityDto: CheckAvailabilityDto,
    tenantId: string,
  ) {
    const { date, serviceId } = checkAvailabilityDto;

    // Buscar barbeiro e validações
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId, isActive: true },
      include: {
        tenant: true,
        services: {
          where: { serviceId },
          include: {
            service: true,
          },
        },
      },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    if (barber.services.length === 0) {
      throw new BadRequestException('Barbeiro não oferece este serviço');
    }

    const service = barber.services[0].service;
    const tenant = barber.tenant;

    // Gerar slots de horário
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Buscar agendamentos do dia
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        service: {
          select: {
            duration: true,
          },
        },
      },
    });

    // Criar slots disponíveis
    const slots: Array<{ time: string; available: boolean }> = [];
    const [openHour, openMinute] = tenant.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = tenant.closeTime.split(':').map(Number);

    const slotDuration = 30; // 30 minutos por slot

    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (hour === closeHour && minute >= closeMinute) break;

        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        const [h, m] = slotTime.split(':').map(Number);
        slotDate.setHours(h, m, 0, 0);

        // Verificar se slot está no passado
        if (slotDate < new Date()) {
          continue;
        }

        // Verificar se há conflito
        const hasConflict = existingAppointments.some((appointment) => {
          const appointmentEnd = new Date(
            appointment.scheduledAt.getTime() + appointment.service.duration * 60000,
          );
          const slotEnd = new Date(slotDate.getTime() + service.duration * 60000);

          return (
            (slotDate >= appointment.scheduledAt && slotDate < appointmentEnd) ||
            (slotEnd > appointment.scheduledAt && slotEnd <= appointmentEnd) ||
            (slotDate <= appointment.scheduledAt && slotEnd >= appointmentEnd)
          );
        });

        slots.push({
          time: slotTime,
          available: !hasConflict,
        });
      }
    }

    return {
      date,
      barberId,
      serviceId,
      serviceDuration: service.duration,
      slots,
    };
  }

  // Estatísticas de agendamentos
  async getStats(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = {
      barber: { tenantId },
    };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'CONFIRMED' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'NO_SHOW' } }),
      this.prisma.appointment.findMany({
        where: { ...where, status: 'COMPLETED' },
        include: { service: { select: { price: true } } },
      }),
    ]);

    const revenue = totalRevenue.reduce((sum, apt) => sum + apt.service.price, 0);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';
    const noShowRate = total > 0 ? ((noShow / total) * 100).toFixed(2) : '0';
    const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0';

    return {
      total,
      byStatus: {
        pending,
        confirmed,
        completed,
        cancelled,
        noShow,
      },
      rates: {
        completion: `${completionRate}%`,
        noShow: `${noShowRate}%`,
        cancellation: `${cancellationRate}%`,
      },
      revenue,
    };
  }

  // Calendário mensal
  async getCalendar(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barber: { tenantId },
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        barber: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Agrupar por dia
    const calendar: Record<string, any[]> = {};

    appointments.forEach((appointment) => {
      const day = appointment.scheduledAt.getDate();
      const key = day.toString().padStart(2, '0');

      if (!calendar[key]) {
        calendar[key] = [];
      }

      calendar[key].push({
        id: appointment.id,
        time: appointment.scheduledAt.toTimeString().slice(0, 5),
        customer: appointment.customer.name,
        barber: appointment.barber.user.name,
        service: appointment.service.name,
        status: appointment.status,
      });
    });

    return {
      month,
      year,
      appointments: calendar,
      total: appointments.length,
    };
  }
}
