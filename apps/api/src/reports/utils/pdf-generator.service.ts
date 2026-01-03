import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

interface ReportData {
  title: string;
  period: string;
  data: any[];
  summary?: Record<string, any>;
}

@Injectable()
export class PdfGenerator {
  /**
   * Gerar PDF de relatório financeiro
   */
  async generateFinancialReport(reportData: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc
        .fontSize(20)
        .text(reportData.title, { align: 'center' })
        .fontSize(12)
        .text(reportData.period, { align: 'center' })
        .moveDown(2);

      // Sumário
      if (reportData.summary) {
        doc.fontSize(14).text('Resumo', { underline: true }).moveDown();

        Object.entries(reportData.summary).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${value}`);
        });

        doc.moveDown(2);
      }

      // Tabela de transações
      doc.fontSize(14).text('Transações', { underline: true }).moveDown();

      // Cabeçalho da tabela
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 300;
      const col4 = 450;

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Data', col1, tableTop)
        .text('Tipo', col2, tableTop)
        .text('Descrição', col3, tableTop)
        .text('Valor', col4, tableTop)
        .font('Helvetica');

      doc.moveDown();

      // Linhas da tabela
      reportData.data.forEach((item, i) => {
        const y = doc.y;

        if (y > 700) {
          doc.addPage();
        }

        const date = new Date(item.createdAt).toLocaleDateString('pt-BR');
        const type = item.type === 'INCOME' ? 'Entrada' : 'Saída';
        const description = item.description || item.category || 'N/A';
        const value = `R$ ${item.amount.toFixed(2)}`;

        doc
          .fontSize(8)
          .text(date, col1, y)
          .text(type, col2, y)
          .text(description, col3, y, { width: 140 })
          .text(value, col4, y);

        doc.moveDown(0.5);
      });

      // Rodapé
      doc
        .moveDown(2)
        .fontSize(8)
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
          align: 'center',
        });

      doc.end();
    });
  }

  /**
   * Gerar PDF de relatório de comissões
   */
  async generateCommissionReport(reportData: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc
        .fontSize(20)
        .text(reportData.title, { align: 'center' })
        .fontSize(12)
        .text(reportData.period, { align: 'center' })
        .moveDown(2);

      // Sumário
      if (reportData.summary) {
        doc.fontSize(14).text('Resumo', { underline: true }).moveDown();

        Object.entries(reportData.summary).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${value}`);
        });

        doc.moveDown(2);
      }

      // Tabela de comissões por barbeiro
      doc.fontSize(14).text('Comissões por Barbeiro', { underline: true }).moveDown();

      reportData.data.forEach((barber: any) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`Barbeiro: ${barber.barberName}`)
          .font('Helvetica')
          .fontSize(10)
          .text(`Total de Serviços: ${barber.totalAppointments}`)
          .text(`Receita Total: R$ ${barber.totalRevenue.toFixed(2)}`)
          .text(`Comissão Total: R$ ${barber.totalCommission.toFixed(2)}`)
          .moveDown(1.5);
      });

      // Rodapé
      doc
        .moveDown(2)
        .fontSize(8)
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
          align: 'center',
        });

      doc.end();
    });
  }

  /**
   * Gerar PDF de relatório de agendamentos
   */
  async generateAppointmentReport(reportData: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc
        .fontSize(20)
        .text(reportData.title, { align: 'center' })
        .fontSize(12)
        .text(reportData.period, { align: 'center' })
        .moveDown(2);

      // Sumário
      if (reportData.summary) {
        doc.fontSize(14).text('Resumo', { underline: true }).moveDown();

        Object.entries(reportData.summary).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${value}`);
        });

        doc.moveDown(2);
      }

      // Tabela de agendamentos
      doc.fontSize(14).text('Agendamentos', { underline: true }).moveDown();

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 120;
      const col3 = 250;
      const col4 = 380;
      const col5 = 480;

      doc
        .fontSize(9)
        .text('Data', col1, tableTop)
        .text('Cliente', col2, tableTop)
        .text('Serviço', col3, tableTop)
        .text('Barbeiro', col4, tableTop)
        .text('Status', col5, tableTop);

      doc.moveDown();

      reportData.data.forEach((item: any) => {
        const y = doc.y;

        if (y > 700) {
          doc.addPage();
        }

        const date = new Date(item.scheduledAt).toLocaleDateString('pt-BR');
        const customer = item.customer?.user?.name || 'Sem cliente';
        const service = item.service?.name || 'N/A';
        const barber = item.barber?.user?.name || 'N/A';
        const status = item.status;

        doc
          .fontSize(8)
          .text(date, col1, y, { width: 60 })
          .text(customer, col2, y, { width: 120 })
          .text(service, col3, y, { width: 120 })
          .text(barber, col4, y, { width: 90 })
          .text(status, col5, y);

        doc.moveDown(0.5);
      });

      // Rodapé
      doc
        .moveDown(2)
        .fontSize(8)
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
          align: 'center',
        });

      doc.end();
    });
  }
}
