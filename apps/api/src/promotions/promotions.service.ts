import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateCouponDto,
    CreatePromotionDto,
    DiscountType,
    UpdatePromotionDto,
    ValidateCouponDto,
} from './dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar nova promoção
   */
  async create(dto: CreatePromotionDto, tenantId: string) {
    const { serviceIds, startDate, endDate, ...data } = dto;

    // Validar datas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException(
        'Data de início deve ser anterior à data de término',
      );
    }

    // Validar desconto FIXED_AMOUNT
    if (data.discountType === DiscountType.FIXED_AMOUNT && dto.discountValue > 10000) {
      throw new BadRequestException(
        'Desconto fixo não pode exceder R$ 10.000,00',
      );
    }

    // Validar serviços (se fornecidos)
    if (serviceIds && serviceIds.length > 0) {
      const services = await this.prisma.service.count({
        where: {
          id: { in: serviceIds },
          tenantId,
          isActive: true,
        },
      });

      if (services !== serviceIds.length) {
        throw new NotFoundException('Um ou mais serviços não encontrados');
      }
    }

    // Criar promoção
    const promotion = await this.prisma.promotion.create({
      data: {
        ...data,
        startDate: start,
        endDate: end,
        tenantId,
        currentUses: 0,
        services: serviceIds
          ? {
              connect: serviceIds.map(id => ({ id })),
            }
          : undefined,
      },
      include: {
        services: true,
        coupons: true,
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
      include: {
        services: true,
        coupons: true,
        _count: {
          select: {
            services: true,
            coupons: true,
          },
        },
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
      include: {
        services: true,
        coupons: true,
      },
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

    const { serviceIds, startDate, endDate, ...data } = dto;

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
        ...data,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(serviceIds && {
          services: {
            set: [],
            connect: serviceIds.map(sid => ({ id: sid })),
          },
        }),
      },
      include: {
        services: true,
        coupons: true,
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

    // Verificar se há cupons vinculados
    const couponsCount = await this.prisma.coupon.count({
      where: { promotionId: id },
    });

    if (couponsCount > 0) {
      throw new ConflictException(
        'Não é possível deletar promoção com cupons vinculados',
      );
    }

    await this.prisma.promotion.delete({ where: { id } });

    return {
      message: 'Promoção deletada com sucesso',
    };
  }

  /**
   * ========================================
   * CUPONS
   * ========================================
   */

  /**
   * Criar cupom para promoção
   */
  async createCoupon(dto: CreateCouponDto, tenantId: string) {
    const { code, promotionId } = dto;

    // Validar promoção
    const promotion = await this.prisma.promotion.findFirst({
      where: { id: promotionId, tenantId },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    // Verificar se cupom já existe
    const existing = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        promotion: { tenantId },
      },
    });

    if (existing) {
      throw new ConflictException('Cupom já existe');
    }

    // Criar cupom
    const coupon = await this.prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        promotionId,
        isActive: true,
        usageCount: 0,
      },
      include: {
        promotion: {
          include: {
            services: true,
          },
        },
      },
    });

    return {
      message: 'Cupom criado com sucesso',
      coupon,
    };
  }

  /**
   * Validar cupom
   */
  async validateCoupon(dto: ValidateCouponDto, tenantId: string) {
    const { code, serviceId } = dto;

    // Buscar cupom
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        promotion: { tenantId },
      },
      include: {
        promotion: {
          include: {
            services: true,
          },
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'Cupom não encontrado',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        message: 'Cupom desativado',
      };
    }

    if (!coupon.promotion.isActive) {
      return {
        valid: false,
        message: 'Promoção desativada',
      };
    }

    // Validar período
    const now = new Date();
    if (now < coupon.promotion.startDate || now > coupon.promotion.endDate) {
      return {
        valid: false,
        message: 'Cupom fora do período de validade',
      };
    }

    // Validar limite de uso
    if (
      coupon.promotion.maxUses &&
      coupon.promotion.currentUses >= coupon.promotion.maxUses
    ) {
      return {
        valid: false,
        message: 'Cupom esgotado',
      };
    }

    // Validar serviço específico
    if (serviceId && coupon.promotion.services.length > 0) {
      const isServiceIncluded = coupon.promotion.services.some(
        s => s.id === serviceId,
      );

      if (!isServiceIncluded) {
        return {
          valid: false,
          message: 'Cupom não válido para este serviço',
        };
      }
    }

    return {
      valid: true,
      message: 'Cupom válido',
      coupon: {
        code: coupon.code,
        discountType: coupon.promotion.discountType,
        discountValue: coupon.promotion.discountValue,
        promotionName: coupon.promotion.name,
      },
    };
  }

  /**
   * Aplicar cupom (incrementar uso)
   */
  async applyCoupon(code: string, tenantId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        promotion: { tenantId },
      },
      include: {
        promotion: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    // Incrementar uso
    await this.prisma.$transaction([
      this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      }),
      this.prisma.promotion.update({
        where: { id: coupon.promotionId },
        data: { currentUses: { increment: 1 } },
      }),
    ]);

    return {
      message: 'Cupom aplicado com sucesso',
      discountType: coupon.promotion.discountType,
      discountValue: coupon.promotion.discountValue,
    };
  }

  /**
   * Listar cupons de uma promoção
   */
  async getCoupons(promotionId: string, tenantId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id: promotionId, tenantId },
    });

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    const coupons = await this.prisma.coupon.findMany({
      where: { promotionId },
      include: {
        promotion: {
          select: {
            name: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: coupons.length,
      coupons,
    };
  }

  /**
   * Desativar cupom
   */
  async deactivateCoupon(couponId: string, tenantId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        id: couponId,
        promotion: { tenantId },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });

    return {
      message: 'Cupom desativado com sucesso',
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
   * Calcular desconto de uma promoção
   */
  calculateDiscount(
    originalPrice: number,
    discountType: string,
    discountValue: number,
  ): number {
    switch (discountType) {
      case DiscountType.PERCENTAGE:
        return originalPrice * (discountValue / 100);
      case DiscountType.FIXED_AMOUNT:
        return Math.min(discountValue, originalPrice);
      case DiscountType.FREE_SERVICE:
        return originalPrice;
      default:
        return 0;
    }
  }
}
