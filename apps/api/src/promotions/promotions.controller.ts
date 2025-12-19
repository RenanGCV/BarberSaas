import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
    CreateCouponDto,
    CreatePromotionDto,
    UpdatePromotionDto,
    ValidateCouponDto,
} from './dto';
import { PromotionsService } from './promotions.service';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Criar nova promoção' })
  @ApiResponse({ status: 201, description: 'Promoção criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() dto: CreatePromotionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.create(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as promoções' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filtrar apenas promoções ativas',
  })
  @ApiResponse({ status: 200, description: 'Lista de promoções retornada' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const active = activeOnly === 'true';
    return this.promotionsService.findAll(tenantId, active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar promoção por ID' })
  @ApiResponse({ status: 200, description: 'Promoção encontrada' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.promotionsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Atualizar promoção' })
  @ApiResponse({ status: 200, description: 'Promoção atualizada' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Deletar promoção' })
  @ApiResponse({ status: 200, description: 'Promoção deletada' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  @ApiResponse({ status: 409, description: 'Promoção possui cupons vinculados' })
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.promotionsService.remove(id, tenantId);
  }

  // ============================================
  // CUPONS
  // ============================================

  @Post('coupons')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Criar cupom para promoção' })
  @ApiResponse({ status: 201, description: 'Cupom criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  @ApiResponse({ status: 409, description: 'Cupom já existe' })
  async createCoupon(
    @Body() dto: CreateCouponDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.createCoupon(dto, tenantId);
  }

  @Post('coupons/validate')
  @ApiOperation({ summary: 'Validar cupom de desconto' })
  @ApiResponse({ status: 200, description: 'Validação realizada' })
  async validateCoupon(
    @Body() dto: ValidateCouponDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.validateCoupon(dto, tenantId);
  }

  @Post('coupons/:code/apply')
  @ApiOperation({ summary: 'Aplicar cupom (incrementar uso)' })
  @ApiResponse({ status: 200, description: 'Cupom aplicado' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async applyCoupon(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.applyCoupon(code, tenantId);
  }

  @Get(':promotionId/coupons')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Listar cupons de uma promoção' })
  @ApiResponse({ status: 200, description: 'Lista de cupons retornada' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  async getCoupons(
    @Param('promotionId') promotionId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.getCoupons(promotionId, tenantId);
  }

  @Patch('coupons/:id/deactivate')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Desativar cupom' })
  @ApiResponse({ status: 200, description: 'Cupom desativado' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async deactivateCoupon(
    @Param('id') couponId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.deactivateCoupon(couponId, tenantId);
  }
}
