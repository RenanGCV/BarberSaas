import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ReportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
}

export class FinancialReportDto {
  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-02-29' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: ReportFormat, default: ReportFormat.JSON })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;
}

export class CommissionReportDto {
  @ApiProperty({ example: 'barber-id-123', required: false })
  @IsString()
  @IsOptional()
  barberId?: string;

  @ApiProperty({ example: 2, description: 'Mês (1-12)' })
  @IsNumber()
  @IsNotEmpty()
  month: number;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @ApiProperty({ enum: ReportFormat, default: ReportFormat.JSON })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;
}

export class AppointmentReportDto {
  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-02-29' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
