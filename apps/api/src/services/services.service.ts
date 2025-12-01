import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, tenantId: string) {
    const { barberIds, ...serviceData } = createServiceDto;

    // Criar serviço
    const service = await this.prisma.service.create({
      data: {
        ...serviceData,
        tenantId,
      },
    });

    // Vincular barbeiros se fornecidos
    if (barberIds && barberIds.length > 0) {
      await this.linkBarbers(service.id, barberIds, tenantId);
    }

    return this.findOne(service.id, tenantId);
  }

  async findAll(tenantId: string) {
    return this.prisma.service.findMany({
      where: { tenantId, isActive: true },
      include: {
        barbers: {
          include: {
            barber: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
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
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: {
        barbers: {
          include: {
            barber: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
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

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return service;
  }

  async findByBarber(barberId: string, tenantId: string) {
    return this.prisma.service.findMany({
      where: {
        tenantId,
        isActive: true,
        barbers: {
          some: {
            barberId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const { barberIds, ...serviceData } = updateServiceDto;

    // Atualizar serviço
    await this.prisma.service.update({
      where: { id },
      data: serviceData,
    });

    // Atualizar barbeiros se fornecidos
    if (barberIds !== undefined) {
      // Remover vínculos antigos
      await this.prisma.barberService.deleteMany({
        where: {
          serviceId: id,
        },
      });

      // Adicionar novos vínculos
      if (barberIds.length > 0) {
        await this.linkBarbers(id, barberIds, tenantId);
      }
    }

    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete
    await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Serviço desativado com sucesso' };
  }

  private async linkBarbers(serviceId: string, barberIds: string[], tenantId: string) {
    // Verificar se todos os barbeiros pertencem ao tenant
    const barbers = await this.prisma.barber.findMany({
      where: {
        id: { in: barberIds },
        tenantId,
        isActive: true,
      },
    });

    if (barbers.length !== barberIds.length) {
      throw new NotFoundException('Um ou mais barbeiros não encontrados');
    }

    // Conectar serviço aos barbeiros
    await this.prisma.barberService.createMany({
      data: barberIds.map(barberId => ({
        serviceId,
        barberId,
      })),
    });
  }
}
