import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeStatusDto, CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, customerId: string, tenantId: string) {
    const { serviceId, barberId, scheduledAt, notes } = createAppointmentDto;

    // Converter data
    const appointmentDate = new Date(scheduledAt);

    // Validar data não está no passado
    if (appointmentDate < new Date()) {
      throw new BadRequestException('Não é possível agendar no passado');
    }

    // Verificar serviço existe e pertence ao tenant
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Verificar barbeiro existe, pertence ao tenant e oferece o serviço
    const barber = await this.prisma.barber.findFirst({
      where: {
        id: barberId,
        tenantId,
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
      throw new NotFoundException('Barbeiro não encontrado');
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
        tenantId,
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
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

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
    });
  }

  async cancel(id: string, tenantId: string, userId: string) {
    const appointment = await this.findOne(id, tenantId);

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Não é possível cancelar agendamento já concluído');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Agendamento já cancelado');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
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
}
