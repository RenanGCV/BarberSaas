import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarberAvailabilityDto, CreateBarberDto, UpdateBarberDto } from './dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async create(createBarberDto: CreateBarberDto, tenantId: string) {
    // Verificar se usuário existe e pertence ao tenant
    const user = await this.prisma.user.findFirst({
      where: {
        id: createBarberDto.userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado neste estabelecimento');
    }

    // Verificar se já não é barbeiro
    const existingBarber = await this.prisma.barber.findUnique({
      where: { userId: createBarberDto.userId },
    });

    if (existingBarber) {
      throw new BadRequestException('Este usuário já é um barbeiro');
    }

    // Criar barbeiro e atualizar role do usuário
    const barber = await this.prisma.barber.create({
      data: {
        ...createBarberDto,
        tenantId,
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

  async getSchedule(barberId: string, tenantId: string, date: string) {
    const barber = await this.findOne(barberId, tenantId);

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

    return this.prisma.barber.update({
      where: { id },
      data: updateBarberDto,
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
