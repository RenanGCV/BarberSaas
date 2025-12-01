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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BarbersService } from './barbers.service';
import { BarberAvailabilityDto, CreateBarberDto, UpdateBarberDto } from './dto';

@ApiTags('barbers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barbers')
export class BarbersController {
  constructor(private barbersService: BarbersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo barbeiro' })
  create(@Body() createBarberDto: CreateBarberDto, @CurrentUser() user) {
    return this.barbersService.create(createBarberDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os barbeiros' })
  findAll(@CurrentUser() user) {
    return this.barbersService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbeiro por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.barbersService.findOne(id, user.tenantId);
  }

  @Post(':id/check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade do barbeiro' })
  checkAvailability(
    @Param('id') id: string,
    @Body() availabilityDto: BarberAvailabilityDto,
    @CurrentUser() user,
  ) {
    return this.barbersService.checkAvailability(id, user.tenantId, availabilityDto);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Obter agenda do barbeiro' })
  getSchedule(
    @Param('id') id: string,
    @Query('date') date: string,
    @CurrentUser() user,
  ) {
    return this.barbersService.getSchedule(id, user.tenantId, date);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar barbeiro' })
  update(
    @Param('id') id: string,
    @Body() updateBarberDto: UpdateBarberDto,
    @CurrentUser() user,
  ) {
    return this.barbersService.update(id, updateBarberDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar barbeiro' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.barbersService.remove(id, user.tenantId);
  }
}
