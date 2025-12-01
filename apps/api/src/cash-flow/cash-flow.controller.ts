import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CashFlowService } from './cash-flow.service';
import { AddCashMovementDto, CloseCashFlowDto, OpenCashFlowDto } from './dto';

@ApiTags('cash-flow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-flow')
export class CashFlowController {
  constructor(private cashFlowService: CashFlowService) {}

  @Post('open')
  @ApiOperation({ summary: 'Abrir caixa do dia' })
  open(@Body() openCashFlowDto: OpenCashFlowDto, @CurrentUser() user) {
    return this.cashFlowService.open(openCashFlowDto, user.tenantId, user.id);
  }

  @Get('current')
  @ApiOperation({ summary: 'Obter caixa atual aberto' })
  getCurrent(@CurrentUser() user) {
    return this.cashFlowService.getCurrent(user.tenantId);
  }

  @Post(':id/movement')
  @ApiOperation({ summary: 'Adicionar movimento ao caixa' })
  addMovement(
    @Param('id') id: string,
    @Body() movementDto: AddCashMovementDto,
    @CurrentUser() user,
  ) {
    return this.cashFlowService.addMovement(id, movementDto, user.tenantId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Fechar caixa do dia' })
  close(
    @Param('id') id: string,
    @Body() closeCashFlowDto: CloseCashFlowDto,
    @CurrentUser() user,
  ) {
    return this.cashFlowService.close(id, closeCashFlowDto, user.tenantId, user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de caixas' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getHistory(
    @CurrentUser() user,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cashFlowService.getHistory(user.tenantId, startDate, endDate);
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Resumo diário' })
  getDailySummary(@Param('date') date: string, @CurrentUser() user) {
    return this.cashFlowService.getDailySummary(user.tenantId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar caixa por ID' })
  getById(@Param('id') id: string, @CurrentUser() user) {
    return this.cashFlowService.getById(id, user.tenantId);
  }
}
