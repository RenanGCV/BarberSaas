import { Controller, Get, Query, UseGuards, Header, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  async getFinancialReport(
    @Query() reportDto: FinancialReportDto,
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.reportsService.getFinancialReport(reportDto, user.tenantId);

    if (reportDto.format === 'csv') {
      const csv = await this.reportsService.exportToCSV(
        report.transactions,
        'relatorio-financeiro.csv',
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-financeiro.csv');
      return csv;
    }

    return report;
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Relatório de comissões dos barbeiros' })
  @ApiQuery({ name: 'barberId', required: false })
  @ApiQuery({ name: 'month', example: 2 })
  @ApiQuery({ name: 'year', example: 2024 })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], required: false })
  async getCommissionReport(
    @Query() reportDto: CommissionReportDto,
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.reportsService.getCommissionReport(reportDto, user.tenantId);

    if (reportDto.format === 'csv') {
      const csvData = report.barbers.map(b => ({
        Barbeiro: b.barberName,
        'Taxa Comissão': b.commissionRate,
        'Total Serviços': b.totalServices,
        'Total Gerado': b.totalGenerated,
        'Comissão': b.commissionAmount,
      }));

      const csv = await this.reportsService.exportToCSV(csvData, 'relatorio-comissoes.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-comissoes.csv');
      return csv;
    }

    return report;
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Relatório de agendamentos' })
  @ApiQuery({ name: 'startDate', example: '2024-02-01' })
  @ApiQuery({ name: 'endDate', example: '2024-02-29' })
  getAppointmentReport(@Query() reportDto: AppointmentReportDto, @CurrentUser() user) {
    return this.reportsService.getAppointmentReport(reportDto, user.tenantId);
  }

  @Get('dashboard/today')
  @ApiOperation({ summary: 'Métricas do dashboard - hoje' })
  getDashboardMetrics(@CurrentUser() user) {
    return this.reportsService.getDashboardMetrics(user.tenantId);
  }
}
