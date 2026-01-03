import { Controller, Get, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentReportDto, CommissionReportDto, FinancialReportDto } from './dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Relatório financeiro completo' })
  @ApiQuery({ name: 'startDate', example: '2024-02-01' })
  @ApiQuery({ name: 'endDate', example: '2024-02-29' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], required: false })
  @ApiResponse({ status: 200, description: 'Relatório financeiro gerado com sucesso. Pode retornar JSON ou CSV' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getFinancialReport(
    @Query() reportDto: FinancialReportDto,
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    const format = reportDto.format || 'json';

    if (format === 'csv') {
      const csv = await this.reportsService.exportFinancialReportToCSV(
        reportDto,
        user.tenantId,
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-financeiro.csv',
      );
      return csv;
    }

    if (format === 'pdf') {
      const pdf = await this.reportsService.exportFinancialReportToPDF(
        reportDto,
        user.tenantId,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-financeiro.pdf',
      );
      return new StreamableFile(pdf);
    }

    return this.reportsService.getFinancialReport(reportDto, user.tenantId);
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Relatório de comissões dos barbeiros' })
  @ApiQuery({ name: 'barberId', required: false })
  @ApiQuery({ name: 'month', example: 2 })
  @ApiQuery({ name: 'year', example: 2024 })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], required: false })
  @ApiResponse({ status: 200, description: 'Relatório de comissões gerado com sucesso. Pode retornar JSON ou CSV' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getCommissionReport(
    @Query() reportDto: CommissionReportDto,
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    const format = reportDto.format || 'json';

    if (format === 'csv') {
      const csv = await this.reportsService.exportCommissionReportToCSV(
        reportDto,
        user.tenantId,
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-comissoes.csv',
      );
      return csv;
    }

    if (format === 'pdf') {
      const pdf = await this.reportsService.exportCommissionReportToPDF(
        reportDto,
        user.tenantId,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-comissoes.pdf',
      );
      return new StreamableFile(pdf);
    }

    return this.reportsService.getCommissionReport(reportDto, user.tenantId);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Relatório de agendamentos' })
  @ApiQuery({ name: 'startDate', example: '2024-02-01' })
  @ApiQuery({ name: 'endDate', example: '2024-02-29' })
  @ApiResponse({ status: 200, description: 'Relatório de agendamentos retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getAppointmentReport(@Query() reportDto: AppointmentReportDto, @CurrentUser() user) {
    return this.reportsService.getAppointmentReport(reportDto, user.tenantId);
  }

  @Get('dashboard/today')
  @ApiOperation({ summary: 'Métricas do dashboard - hoje' })
  @ApiResponse({ status: 200, description: 'Métricas do dia retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getDashboardMetrics(@CurrentUser() user) {
    return this.reportsService.getDashboardMetrics(user.tenantId);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Estatísticas gerais do dashboard' })
  getDashboardStats(@CurrentUser() user) {
    return this.reportsService.getDashboardStats(user.tenantId);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Dados de receita para gráfico' })
  @ApiQuery({ name: 'days', example: 7, required: false })
  getRevenueChart(@Query('days') days: number = 7, @CurrentUser() user) {
    return this.reportsService.getRevenueChart(user.tenantId, days);
  }

  @Get('appointments-by-day')
  @ApiOperation({ summary: 'Agendamentos por dia para gráfico' })
  @ApiQuery({ name: 'days', example: 7, required: false })
  getAppointmentsByDay(@Query('days') days: number = 7, @CurrentUser() user) {
    return this.reportsService.getAppointmentsByDay(user.tenantId, days);
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Top serviços mais agendados' })
  @ApiQuery({ name: 'limit', example: 5, required: false })
  getTopServices(@Query('limit') limit: number = 5, @CurrentUser() user) {
    return this.reportsService.getTopServices(user.tenantId, limit);
  }

  @Get('top-barbers')
  @ApiOperation({ summary: 'Top barbeiros por receita' })
  @ApiQuery({ name: 'limit', example: 5, required: false })
  getTopBarbers(@Query('limit') limit: number = 5, @CurrentUser() user) {
    return this.reportsService.getTopBarbers(user.tenantId, limit);
  }
}
