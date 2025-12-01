import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, SearchNearbyDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, userId: string) {
    // Gerar slug único
    const slug = await this.generateUniqueSlug(createTenantDto.name);

    const tenant = await this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        slug,
      },
    });

    // Atualizar usuário para OWNER e vincular ao tenant
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'OWNER',
        tenantId: tenant.id,
      },
    });

    return tenant;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where: { isActive: true } }),
    ]);

    return {
      data: tenants,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        barbers: {
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
        services: {
          where: { isActive: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Barbearia não encontrada');
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        barbers: {
          where: { isActive: true },
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
        services: {
          where: { isActive: true },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Barbearia não encontrada');
    }

    return tenant;
  }

  async searchNearby(searchDto: SearchNearbyDto) {
    const { latitude, longitude, radius = 10 } = searchDto;

    // Buscar todas as barbearias com coordenadas
    const tenants = await this.prisma.tenant.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calcular distância e filtrar
    const nearby = tenants
      .map(tenant => ({
        ...tenant,
        distance: this.calculateDistance(
          latitude,
          longitude,
          tenant.latitude!,
          tenant.longitude!,
        ),
      }))
      .filter(tenant => tenant.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, userId: string) {
    const tenant = await this.findOne(id);

    // Verificar se usuário é owner do tenant
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.tenantId !== id) {
      throw new BadRequestException('Você não tem permissão para editar esta barbearia');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string, userId: string) {
    const tenant = await this.findOne(id);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.tenantId !== id) {
      throw new BadRequestException('Você não tem permissão para desativar esta barbearia');
    }

    await this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Barbearia desativada com sucesso' };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    let uniqueSlug = slug;
    let counter = 1;

    while (await this.prisma.tenant.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
