import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /**
   * Buscar apenas usuários disponíveis para se tornarem colaboradores
   * (usuários que NÃO possuem registro na tabela Barber)
   */
  async findAvailableForBarber(tenantId?: string) {
    // Buscar todos os userIds que já são barbeiros
    const existingBarbers = await this.prisma.barber.findMany({
      select: { userId: true },
    });

    const barberUserIds = existingBarbers.map(b => b.userId);

    // Buscar usuários que não estão na lista de barbeiros
    return this.prisma.user.findMany({
      where: {
        id: {
          notIn: barberUserIds,
        },
        isActive: true,
        ...(tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        tenantId: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    return { message: 'Usuário desativado com sucesso' };
  }
}
