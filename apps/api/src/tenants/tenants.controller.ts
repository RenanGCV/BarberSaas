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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTenantDto, SearchNearbyDto, UpdateTenantDto } from './dto';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar nova barbearia' })
  create(@Body() createTenantDto: CreateTenantDto, @CurrentUser() user) {
    return this.tenantsService.create(createTenantDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as barbearias' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.tenantsService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar barbearias próximas' })
  searchNearby(@Query() searchDto: SearchNearbyDto) {
    return this.tenantsService.searchNearby(searchDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar barbearia por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbearia por ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar barbearia' })
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user,
  ) {
    return this.tenantsService.update(id, updateTenantDto, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Desativar barbearia' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.tenantsService.remove(id, user.id);
  }
}
