import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import {
    ChangeStatusDto,
    CheckAvailabilityDto,
    CreateAppointmentDto,
    QueryAppointmentDto,
    UpdateAppointmentDto,
} from './dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ 
    summary: 'Criar novo agendamento (público ou autenticado)',
    description: 'Permite criar agendamento sem login (fornecendo nome e telefone) ou com login (usando token JWT)'
  })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nome/telefone obrigatórios para convidados' })
  @ApiResponse({ status: 404, description: 'Barbeiro ou serviço não encontrado' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user) {
    const customerId = user?.id || null;
    const tenantId = user?.tenantId || null;
    return this.appointmentsService.create(createAppointmentDto, customerId, tenantId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll(@CurrentUser() user, @Query('customerId') customerId?: string) {
    return this.appointmentsService.findAll(user.tenantId, customerId);
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar agendamentos com filtros avançados' })
  @ApiResponse({ status: 200, description: 'Agendamentos filtrados retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAllWithFilters(@Query() queryDto: QueryAppointmentDto, @CurrentUser() user) {
    return this.appointmentsService.findAllWithFilters(queryDto, user.tenantId);
  }

  @Get('upcoming')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar próximos agendamentos' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiResponse({ status: 200, description: 'Próximos agendamentos retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findUpcoming(@CurrentUser() user, @Query('customerId') customerId?: string) {
    return this.appointmentsService.findUpcoming(user.tenantId, customerId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.appointmentsService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, user.tenantId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Alterar status do agendamento' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.changeStatus(id, changeStatusDto, user.tenantId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancelar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento cancelado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  cancel(@Param('id') id: string, @CurrentUser() user) {
    return this.appointmentsService.cancel(id, user.tenantId, user.id, user.role);
  }

  @Get('barber/:barberId/schedule')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Ver agenda de um barbeiro em data específica (público)' })
  @ApiQuery({ name: 'date', required: true, example: '2024-02-15' })
  @ApiResponse({ status: 200, description: 'Agenda do barbeiro retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  getBarberSchedule(
    @Param('barberId') barberId: string,
    @Query('date') date: string,
    @CurrentUser() user,
  ) {
    const tenantId = user?.tenantId || null;
    return this.appointmentsService.getBarberSchedule(barberId, date, tenantId);
  }

  @Post('barber/:barberId/check-availability')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Verificar horários disponíveis de um barbeiro (público)' })
  @ApiResponse({ status: 200, description: 'Disponibilidade verificada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  checkAvailability(
    @Param('barberId') barberId: string,
    @Body() checkAvailabilityDto: CheckAvailabilityDto,
    @CurrentUser() user,
  ) {
    const tenantId = user?.tenantId || null;
    return this.appointmentsService.checkAvailability(
      barberId,
      checkAvailabilityDto,
      tenantId,
    );
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Estatísticas de agendamentos' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-12-31' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getStats(
    @CurrentUser() user,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getStats(user.tenantId, startDate, endDate);
  }

  @Get('calendar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Visualização de calendário mensal' })
  @ApiQuery({ name: 'month', required: true, example: 2 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  @ApiResponse({ status: 200, description: 'Calendário retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getCalendar(
    @CurrentUser() user,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.appointmentsService.getCalendar(user.tenantId, parseInt(month), parseInt(year));
  }
}
