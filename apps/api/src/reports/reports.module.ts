import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CsvGenerator } from './utils/csv-generator.service';
import { PdfGenerator } from './utils/pdf-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, CsvGenerator, PdfGenerator],
  exports: [ReportsService],
})
export class ReportsModule {}
