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
import { BarbersService } from './barbers.service';
import { BarberAvailabilityDto, CreateBarberDto, UpdateBarberDto } from './dto';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';

@ApiTags('barbers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barbers')
export class BarbersController {
  constructor(private barbersService: BarbersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo barbeiro' })
  @ApiResponse({ status: 201, description: 'Barbeiro criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou usuário já é barbeiro' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  create(@Body() createBarberDto: CreateBarberDto, @CurrentUser() user) {
    return this.barbersService.create(createBarberDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os barbeiros' })
  @ApiResponse({ status: 200, description: 'Lista de barbeiros retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll(@CurrentUser() user) {
    const tenantId = user?.tenantId || null;
    if (!tenantId) {
      // Retornar todos os barbeiros ativos se não houver tenantId
      return this.barbersService.findAllPublic();
    }
    return this.barbersService.findAll(tenantId);
  }

  @Get('me/appointments')
  @ApiOperation({ summary: 'Buscar agendamentos do barbeiro autenticado' })
  @ApiQuery({ name: 'status', required: false, example: 'CONFIRMED' })
  @ApiQuery({ name: 'date', required: false, example: '2024-12-15' })
  @ApiResponse({ status: 200, description: 'Agendamentos do barbeiro retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getMyAppointments(
    @CurrentUser() user,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.barbersService.getMyAppointments(user.id, user.tenantId, { status, date });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbeiro por ID' })
  @ApiResponse({ status: 200, description: 'Barbeiro encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.barbersService.findOne(id, user.tenantId);
  }

  @Post(':id/check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade do barbeiro' })
  @ApiResponse({ status: 200, description: 'Disponibilidade retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  checkAvailability(
    @Param('id') id: string,
    @Body() availabilityDto: BarberAvailabilityDto,
    @CurrentUser() user,
  ) {
    return this.barbersService.checkAvailability(id, user.tenantId, availabilityDto);
  }

  @Get(':id/schedule/:date')
  @ApiOperation({ summary: 'Obter agenda do barbeiro' })
  @ApiResponse({ status: 200, description: 'Agenda do barbeiro retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  getSchedule(
    @Param('id') id: string,
    @Param('date') date: string,
    @CurrentUser() user,
  ) {
    const tenantId = user?.tenantId || null;
    return this.barbersService.getSchedule(id, tenantId, date);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar barbeiro' })
  @ApiResponse({ status: 200, description: 'Barbeiro atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateBarberDto: UpdateBarberDto,
    @CurrentUser() user,
  ) {
    return this.barbersService.update(id, updateBarberDto, user.tenantId);
  }

  @Put(':id/working-hours')
  @ApiOperation({ summary: 'Atualizar horários de trabalho do barbeiro' })
  @ApiResponse({ status: 200, description: 'Horários de trabalho atualizados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  updateWorkingHours(
    @Param('id') id: string,
    @Body() workingHoursDto: UpdateWorkingHoursDto,
    @CurrentUser() user,
  ) {
    return this.barbersService.updateWorkingHours(id, workingHoursDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar barbeiro' })
  @ApiResponse({ status: 200, description: 'Barbeiro desativado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.barbersService.remove(id, user.tenantId);
  }
}
