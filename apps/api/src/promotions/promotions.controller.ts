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
    CreatePromotionDto,
    UpdatePromotionDto,
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
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.promotionsService.remove(id, tenantId);
  }

  @Post('validate/:code')
  @ApiOperation({ summary: 'Validar código de promoção' })
  @ApiResponse({ status: 200, description: 'Validação realizada' })
  async validateCode(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.validateCode(code, tenantId);
  }

  @Post('apply/:code')
  @ApiOperation({ summary: 'Aplicar promoção (incrementar uso)' })
  @ApiResponse({ status: 200, description: 'Promoção aplicada' })
  @ApiResponse({ status: 404, description: 'Promoção não encontrada' })
  async applyPromotion(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.promotionsService.applyPromotion(code, tenantId);
  }
}
