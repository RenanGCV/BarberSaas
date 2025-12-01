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
import { ChangeStatusDto, CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user) {
    return this.appointmentsService.create(createAppointmentDto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiQuery({ name: 'customerId', required: false })
  findAll(@CurrentUser() user, @Query('customerId') customerId?: string) {
    return this.appointmentsService.findAll(user.tenantId, customerId);
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
    return this.appointmentsService.cancel(id, user.tenantId, user.id);
  }
}
