import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo serviço' })
  create(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user) {
    return this.servicesService.create(createServiceDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços' })
  findAll(@CurrentUser() user) {
    const tenantId = user?.tenantId || null;
    if (!tenantId) {
      // Retornar todos os serviços ativos se não houver tenantId
      return this.servicesService.findAllPublic();
    }
    return this.servicesService.findAll(tenantId);
  }

  @Get('barber/:barberId')
  @ApiOperation({ summary: 'Listar serviços de um barbeiro' })
  findByBarber(@Param('barberId') barberId: string, @CurrentUser() user) {
    return this.servicesService.findByBarber(barberId, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.servicesService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user,
  ) {
    return this.servicesService.update(id, updateServiceDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar serviço' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.servicesService.remove(id, user.tenantId);
  }
}
