import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto, TransactionFiltersDto, UpdateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova transação' })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() user) {
    return this.transactionsService.create(createTransactionDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as transações com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll(@CurrentUser() user, @Query() filters: TransactionFiltersDto) {
    return this.transactionsService.findAll(user.tenantId, filters);
  }

  @Get('period')
  @ApiOperation({ summary: 'Obter transações por período' })
  @ApiQuery({ name: 'startDate', example: '2024-02-01' })
  @ApiQuery({ name: 'endDate', example: '2024-02-29' })
  @ApiResponse({ status: 200, description: 'Transações do período retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getByPeriod(
    @CurrentUser() user,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getByPeriod(user.tenantId, startDate, endDate);
  }

  @Get('summary/:type')
  @ApiOperation({ summary: 'Resumo por categoria' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Resumo por categoria retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getCategorySummary(
    @Param('type') type: 'INCOME' | 'EXPENSE',
    @CurrentUser() user,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getCategorySummary(user.tenantId, type, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transação por ID' })
  @ApiResponse({ status: 200, description: 'Transação encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.transactionsService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar transação' })
  @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover transação' })
  @ApiResponse({ status: 200, description: 'Transação removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.transactionsService.remove(id, user.tenantId);
  }
}
