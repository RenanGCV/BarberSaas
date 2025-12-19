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
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentTenant } from '../tenants/current-tenant.decorator';
import { BlockScheduleDto, GetAvailableSlotsDto, UpdateWorkingHoursDto } from './dto';
import { SchedulesService } from './schedules.service';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('available')
  @ApiOperation({ summary: 'Buscar horários disponíveis para agendamento' })
  @ApiResponse({
    status: 200,
    description: 'Slots disponíveis retornados com sucesso',
  })
  async getAvailableSlots(
    @Query() dto: GetAvailableSlotsDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.getAvailableSlots(dto, tenantId);
  }

  @Post('block')
  @Roles('OWNER', 'ADMIN', 'BARBER')
  @ApiOperation({ summary: 'Bloquear horário de um barbeiro' })
  @ApiResponse({ status: 201, description: 'Horário bloqueado com sucesso' })
  async blockSchedule(
    @Body() dto: BlockScheduleDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.blockSchedule(dto, tenantId);
  }

  @Delete('block/:id')
  @Roles('OWNER', 'ADMIN', 'BARBER')
  @ApiOperation({ summary: 'Remover bloqueio de horário' })
  @ApiResponse({ status: 200, description: 'Bloqueio removido com sucesso' })
  async unblockSchedule(
    @Param('id') blockId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.unblockSchedule(blockId, tenantId);
  }

  @Get('barbers/:barberId/blocked')
  @Roles('OWNER', 'ADMIN', 'BARBER')
  @ApiOperation({ summary: 'Listar horários bloqueados de um barbeiro' })
  @ApiResponse({
    status: 200,
    description: 'Horários bloqueados retornados com sucesso',
  })
  async getBlockedSchedules(
    @Param('barberId') barberId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.getBlockedSchedules(barberId, tenantId);
  }

  @Get('barbers/:barberId/working-hours')
  @ApiOperation({ summary: 'Obter horários de trabalho de um barbeiro' })
  @ApiResponse({
    status: 200,
    description: 'Horários de trabalho retornados com sucesso',
  })
  async getWorkingHours(
    @Param('barberId') barberId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.getWorkingHours(barberId, tenantId);
  }

  @Patch('barbers/:barberId/working-hours')
  @Roles('OWNER', 'ADMIN', 'BARBER')
  @ApiOperation({ summary: 'Atualizar horários de trabalho de um barbeiro' })
  @ApiResponse({
    status: 200,
    description: 'Horários de trabalho atualizados com sucesso',
  })
  async updateWorkingHours(
    @Param('barberId') barberId: string,
    @Body() dto: UpdateWorkingHoursDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.schedulesService.updateWorkingHours(barberId, dto, tenantId);
  }
}
