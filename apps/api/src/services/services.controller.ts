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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user) {
    return this.servicesService.create(createServiceDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços' })
  @ApiResponse({ status: 200, description: 'Lista de serviços retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
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
  @ApiResponse({ status: 200, description: 'Serviços do barbeiro retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Barbeiro não encontrado' })
  findByBarber(@Param('barberId') barberId: string, @CurrentUser() user) {
    return this.servicesService.findByBarber(barberId, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.servicesService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user,
  ) {
    return this.servicesService.update(id, updateServiceDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar serviço' })
  @ApiResponse({ status: 200, description: 'Serviço desativado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.servicesService.remove(id, user.tenantId);
  }
}
