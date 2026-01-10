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
  @ApiResponse({ status: 201, description: 'Barbearia criada com sucesso. Usuário torna-se OWNER automaticamente' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou usuário já possui barbearia' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() createTenantDto: CreateTenantDto, @CurrentUser() user) {
    return this.tenantsService.create(createTenantDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as barbearias' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de barbearias retornada com sucesso' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.tenantsService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar barbearias próximas' })
  @ApiResponse({ status: 200, description: 'Barbearias próximas retornadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros de localização inválidos' })
  searchNearby(@Query() searchDto: SearchNearbyDto) {
    return this.tenantsService.searchNearby(searchDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar minha barbearia' })
  @ApiResponse({ status: 200, description: 'Barbearia do usuário logado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findMyTenant(@CurrentUser() user) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar minha barbearia' })
  @ApiResponse({ status: 200, description: 'Barbearia atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  updateMyTenant(@Body() updateTenantDto: UpdateTenantDto, @CurrentUser() user) {
    return this.tenantsService.update(user.tenantId, updateTenantDto, user.id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar barbearia por slug' })
  @ApiResponse({ status: 200, description: 'Barbearia encontrada' })
  @ApiResponse({ status: 404, description: 'Barbearia não encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbearia por ID' })
  @ApiResponse({ status: 200, description: 'Barbearia encontrada' })
  @ApiResponse({ status: 404, description: 'Barbearia não encontrada' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar barbearia' })
  @ApiResponse({ status: 200, description: 'Barbearia atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas OWNER)' })
  @ApiResponse({ status: 404, description: 'Barbearia não encontrada' })
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
  @ApiResponse({ status: 200, description: 'Barbearia desativada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas OWNER)' })
  @ApiResponse({ status: 404, description: 'Barbearia não encontrada' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.tenantsService.remove(id, user.id);
  }
}
