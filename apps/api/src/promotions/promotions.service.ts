import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreatePromotionDto,
    DiscountType,
    UpdatePromotionDto,
} from './dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar nova promoção
   */
  async create(dto: CreatePromotionDto, tenantId: string) {
    const { startDate, endDate, discountType, discountValue, name, description, maxUses, isActive } = dto;

    // Validar datas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException(
        'Data de início deve ser anterior à data de término',
      );
    }

    // Validar desconto FIXED_AMOUNT
    if (discountType === DiscountType.FIXED_AMOUNT && discountValue > 10000) {
      throw new BadRequestException(
        'Desconto fixo não pode exceder R$ 10.000,00',
      );
    }

    // Gerar código único para a promoção
    const code = await this.generateUniqueCode(name, tenantId);

    // Criar promoção usando o schema atual
    const promotion = await this.prisma.promotion.create({
      data: {
        code,
        name,
        description,
        type: this.mapDiscountTypeToPromotionType(discountType),
        value: discountValue,
        startDate: start,
        endDate: end,
        maxUses,
        currentUses: 0,
        isActive: isActive ?? true,
        tenantId,
      },
    });

    return {
      message: 'Promoção criada com sucesso',
      promotion,
    };
  }

  /**
   * Listar todas promoções da barbearia
   */
  async findAll(tenantId: string, activeOnly = false) {
    const now = new Date();

    const promotions = await this.prisma.promotion.findMany({
      where: {
        tenantId,
        ...(activeOnly && {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: promotions.length,
      promotions: promotions.map(p => ({
        ...p,
        isCurrentlyActive: this.isPromotionActive(p),
        usagePercentage: p.maxUses ? (p.currentUses / p.maxUses) * 100 : null,
      })),
    };
  }

  /**
   * Buscar promoção por ID
   */
  async findOne(id: string, tenantId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, tenantId },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    return {
      ...promotion,
      isCurrentlyActive: this.isPromotionActive(promotion),
      usagePercentage: promotion.maxUses
        ? (promotion.currentUses / promotion.maxUses) * 100
        : null,
    };
  }

  /**
   * Atualizar promoção
   */
  async update(id: string, dto: UpdatePromotionDto, tenantId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, tenantId },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    const { startDate, endDate, discountType, discountValue, name, description, maxUses, isActive } = dto;

    // Validar datas se fornecidas
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new BadRequestException(
          'Data de início deve ser anterior à data de término',
        );
      }
    }

    // Atualizar promoção
    const updated = await this.prisma.promotion.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(discountType && { type: this.mapDiscountTypeToPromotionType(discountType) }),
        ...(discountValue !== undefined && { value: discountValue }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(maxUses !== undefined && { maxUses }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return {
      message: 'Promoção atualizada com sucesso',
      promotion: updated,
    };
  }

  /**
   * Deletar promoção
   */
  async remove(id: string, tenantId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, tenantId },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    await this.prisma.promotion.delete({ where: { id } });

    return {
      message: 'Promoção deletada com sucesso',
    };
  }

  /**
   * Validar código de promoção
   */
  async validateCode(code: string, tenantId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        tenantId,
      },
    });

    if (!promotion) {
      return {
        valid: false,
        message: 'Código de promoção não encontrado',
      };
    }

    if (!promotion.isActive) {
      return {
        valid: false,
        message: 'Promoção desativada',
      };
    }

    // Validar período
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return {
        valid: false,
        message: 'Promoção fora do período de validade',
      };
    }

    // Validar limite de uso
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
      return {
        valid: false,
        message: 'Promoção esgotada',
      };
    }

    return {
      valid: true,
      message: 'Promoção válida',
      promotion: {
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
      },
    };
  }

  /**
   * Aplicar promoção (incrementar uso)
   */
  async applyPromotion(code: string, tenantId: string) {
    const validation = await this.validateCode(code, tenantId);

    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const promotion = await this.prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        tenantId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    // Incrementar uso
    await this.prisma.promotion.update({
      where: { id: promotion.id },
      data: { currentUses: { increment: 1 } },
    });

    return {
      message: 'Promoção aplicada com sucesso',
      type: promotion.type,
      value: promotion.value,
    };
  }

  /**
   * Helper: Verificar se promoção está ativa
   */
  private isPromotionActive(promotion: any): boolean {
    const now = new Date();
    return (
      promotion.isActive &&
      now >= promotion.startDate &&
      now <= promotion.endDate &&
      (!promotion.maxUses || promotion.currentUses < promotion.maxUses)
    );
  }

  /**
   * Helper: Mapear DiscountType para PromotionType do schema
   */
  private mapDiscountTypeToPromotionType(discountType: DiscountType): 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE' {
    switch (discountType) {
      case DiscountType.PERCENTAGE:
        return 'PERCENTAGE';
      case DiscountType.FIXED_AMOUNT:
        return 'FIXED_AMOUNT';
      case DiscountType.FREE_SERVICE:
        return 'FREE_SERVICE';
      default:
        return 'PERCENTAGE';
    }
  }

  /**
   * Helper: Gerar código único para promoção
   */
  private async generateUniqueCode(name: string, tenantId: string): Promise<string> {
    const baseCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    let code = `${baseCode}${randomSuffix}`;

    // Verificar se código já existe
    const existing = await this.prisma.promotion.findFirst({
      where: { code, tenantId },
    });

    if (existing) {
      // Gerar novo código
      return this.generateUniqueCode(name + Date.now(), tenantId);
    }

    return code;
  }

  /**
   * Calcular desconto de uma promoção
   */
  calculateDiscount(
    originalPrice: number,
    discountType: string,
    discountValue: number,
  ): number {
    switch (discountType) {
      case 'PERCENTAGE':
        return originalPrice * (discountValue / 100);
      case 'FIXED_AMOUNT':
        return Math.min(discountValue, originalPrice);
      case 'FREE_SERVICE':
        return originalPrice;
      default:
        return 0;
    }
  }
}
