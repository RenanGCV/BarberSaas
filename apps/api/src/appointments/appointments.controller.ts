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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import {
    ChangeStatusDto,
    CheckAvailabilityDto,
    CreateAppointmentDto,
    QueryAppointmentDto,
    UpdateAppointmentDto,
} from './dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user) {
    const customerId = user?.id || null;
    const tenantId = user?.tenantId || null;
    return this.appointmentsService.create(createAppointmentDto, customerId, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiQuery({ name: 'customerId', required: false })
  findAll(@CurrentUser() user, @Query('customerId') customerId?: string) {
    return this.appointmentsService.findAll(user.tenantId, customerId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar agendamentos com filtros avançados' })
  findAllWithFilters(@Query() queryDto: QueryAppointmentDto, @CurrentUser() user) {
    return this.appointmentsService.findAllWithFilters(queryDto, user.tenantId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Listar próximos agendamentos' })
  @ApiQuery({ name: 'customerId', required: false })
  findUpcoming(@CurrentUser() user, @Query('customerId') customerId?: string) {
    return this.appointmentsService.findUpcoming(user.tenantId, customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.appointmentsService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, user.tenantId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do agendamento' })
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.changeStatus(id, changeStatusDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar agendamento' })
  cancel(@Param('id') id: string, @CurrentUser() user) {
    return this.appointmentsService.cancel(id, user.tenantId, user.id, user.role);
  }

  @Get('barber/:barberId/schedule')
  @ApiOperation({ summary: 'Ver agenda de um barbeiro em data específica' })
  @ApiQuery({ name: 'date', required: true, example: '2024-02-15' })
  getBarberSchedule(
    @Param('barberId') barberId: string,
    @Query('date') date: string,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.getBarberSchedule(barberId, date, user.tenantId);
  }

  @Post('barber/:barberId/check-availability')
  @ApiOperation({ summary: 'Verificar horários disponíveis de um barbeiro' })
  checkAvailability(
    @Param('barberId') barberId: string,
    @Body() checkAvailabilityDto: CheckAvailabilityDto,
    @CurrentUser() user,
  ) {
    return this.appointmentsService.checkAvailability(
      barberId,
      checkAvailabilityDto,
      user.tenantId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de agendamentos' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-12-31' })
  getStats(
    @CurrentUser() user,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getStats(user.tenantId, startDate, endDate);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Visualização de calendário mensal' })
  @ApiQuery({ name: 'month', required: true, example: 2 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  getCalendar(
    @CurrentUser() user,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.appointmentsService.getCalendar(user.tenantId, parseInt(month), parseInt(year));
  }
}
