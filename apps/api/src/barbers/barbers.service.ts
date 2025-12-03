import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarberAvailabilityDto, CreateBarberDto, UpdateBarberDto } from './dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async create(createBarberDto: CreateBarberDto, tenantId: string) {
    // Verificar se usuário existe
    let user = await this.prisma.user.findUnique({
      where: { id: createBarberDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuário com ID ${createBarberDto.userId} não encontrado. Certifique-se de que o usuário foi criado antes de vinculá-lo como barbeiro.`
      );
    }

    // Garantir vínculo ao tenant atual caso ainda não tenha
    if (!user.tenantId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { tenantId },
      });
    }

    if (user.tenantId !== tenantId) {
      throw new BadRequestException(
        `Este usuário já pertence a outro estabelecimento. Não é possível vinculá-lo como barbeiro aqui.`
      );
    }

    // Verificar se já não é barbeiro
    const existingBarber = await this.prisma.barber.findUnique({
      where: { userId: createBarberDto.userId },
    });

    if (existingBarber) {
      throw new BadRequestException(
        `Este usuário já está cadastrado como barbeiro. Use a função de atualização para modificar seus dados.`
      );
    }

    // Criar barbeiro e atualizar role do usuário
    const commissionRate = (createBarberDto as any).commission != null
      ? Math.max(0, Math.min(100, Number((createBarberDto as any).commission))) / 100
      : undefined;

    const barber = await this.prisma.barber.create({
      data: {
        userId: createBarberDto.userId,
        tenantId,
        specialties: createBarberDto.specialties || [],
        ...(commissionRate != null ? { commissionRate } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    await this.prisma.user.update({
      where: { id: createBarberDto.userId },
      data: { role: 'BARBER' },
    });

    return barber;
  }

  async findAll(tenantId: string) {
    return this.prisma.barber.findMany({
      where: { tenantId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyAppointments(
    userId: string,
    tenantId: string,
    filters?: { status?: string; date?: string },
  ) {
    // Buscar barbeiro associado ao userId
    const barber = await this.prisma.barber.findFirst({
      where: { userId, tenantId },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    const where: any = {
      barberId: barber.id,
      tenantId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.scheduledAt = {
        gte: date,
        lt: nextDay,
      };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        service: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findAllPublic() {
    return this.prisma.barber.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const barber = await this.prisma.barber.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: { scheduledAt: 'desc' },
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                name: true,
                price: true,
                duration: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    return barber;
  }

  async checkAvailability(
    barberId: string,
    tenantId: string,
    availabilityDto: BarberAvailabilityDto,
  ) {
    const barber = await this.findOne(barberId, tenantId);

    const { date, time } = availabilityDto;
    const scheduledAt = new Date(`${date}T${time}:00`);

    // Buscar agendamentos do barbeiro nesse horário
    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        scheduledAt,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    return {
      available: appointments.length === 0,
      appointments,
    };
  }

  async getSchedule(barberId: string, tenantId: string | null, date: string) {
    // Permitir consulta pública para clientes
    const barber = tenantId 
      ? await this.findOne(barberId, tenantId)
      : await this.prisma.barber.findUnique({
          where: { id: barberId, isActive: true },
          include: { user: true },
        });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return {
      barber: {
        id: barber.id,
        name: barber.user.name,
      },
      date,
      appointments,
    };
  }

  async update(id: string, updateBarberDto: UpdateBarberDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const commissionRate = (updateBarberDto as any).commission != null
      ? Math.max(0, Math.min(100, Number((updateBarberDto as any).commission))) / 100
      : undefined;

    return this.prisma.barber.update({
      where: { id },
      data: {
        specialties: updateBarberDto.specialties,
        ...(commissionRate != null ? { commissionRate } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete
    await this.prisma.barber.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Barbeiro desativado com sucesso' };
  }
}
