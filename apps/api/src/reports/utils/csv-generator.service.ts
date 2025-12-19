import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvGenerator {
  /**
   * Converter array de objetos para CSV
   */
  generateCSV(data: any[], headers: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    // Cabeçalho
    const headerRow = headers.join(',');

    // Linhas de dados
    const rows = data.map(item => {
      return headers
        .map(header => {
          const value = this.getNestedValue(item, header);
          return this.escapeCSV(value);
        })
        .join(',');
    });

    return [headerRow, ...rows].join('\n');
  }

  /**
   * Gerar CSV de relatório financeiro
   */
  generateFinancialReportCSV(transactions: any[]): string {
    const headers = [
      'Data',
      'Tipo',
      'Categoria',
      'Descrição',
      'Valor (R$)',
      'Método',
      'Status',
    ];

    const data = transactions.map(t => ({
      Data: new Date(t.createdAt).toLocaleDateString('pt-BR'),
      Tipo: t.type === 'INCOME' ? 'Entrada' : 'Saída',
      Categoria: t.category || 'N/A',
      Descrição: t.description || 'N/A',
      'Valor (R$)': t.amount.toFixed(2),
      Método: t.paymentMethod || 'N/A',
      Status: t.status,
    }));

    return this.generateCSV(data, headers);
  }

  /**
   * Gerar CSV de relatório de comissões
   */
  generateCommissionReportCSV(commissions: any[]): string {
    const headers = [
      'Barbeiro',
      'Total de Serviços',
      'Receita Total (R$)',
      'Taxa de Comissão (%)',
      'Comissão Total (R$)',
    ];

    const data = commissions.map(c => ({
      Barbeiro: c.barberName,
      'Total de Serviços': c.totalAppointments,
      'Receita Total (R$)': c.totalRevenue.toFixed(2),
      'Taxa de Comissão (%)': c.commissionRate,
      'Comissão Total (R$)': c.totalCommission.toFixed(2),
    }));

    return this.generateCSV(data, headers);
  }

  /**
   * Gerar CSV de relatório de agendamentos
   */
  generateAppointmentReportCSV(appointments: any[]): string {
    const headers = [
      'Data/Hora',
      'Cliente',
      'Serviço',
      'Barbeiro',
      'Status',
      'Valor (R$)',
      'Método de Pagamento',
    ];

    const data = appointments.map(a => ({
      'Data/Hora': new Date(a.scheduledAt).toLocaleString('pt-BR'),
      Cliente: a.customer?.user?.name || 'Walk-in',
      Serviço: a.service?.name || 'N/A',
      Barbeiro: a.barber?.user?.name || 'N/A',
      Status: a.status,
      'Valor (R$)': a.totalPrice?.toFixed(2) || '0.00',
      'Método de Pagamento': a.paymentMethod || 'N/A',
    }));

    return this.generateCSV(data, headers);
  }

  /**
   * Gerar CSV de fluxo de caixa
   */
  generateCashFlowReportCSV(cashFlows: any[]): string {
    const headers = [
      'Data Abertura',
      'Data Fechamento',
      'Saldo Inicial (R$)',
      'Saldo Final (R$)',
      'Total Entradas (R$)',
      'Total Saídas (R$)',
      'Status',
    ];

    const data = cashFlows.map(cf => ({
      'Data Abertura': new Date(cf.openedAt).toLocaleString('pt-BR'),
      'Data Fechamento': cf.closedAt
        ? new Date(cf.closedAt).toLocaleString('pt-BR')
        : 'Em aberto',
      'Saldo Inicial (R$)': cf.openingBalance.toFixed(2),
      'Saldo Final (R$)': cf.closingBalance?.toFixed(2) || '0.00',
      'Total Entradas (R$)': cf.totalIncome?.toFixed(2) || '0.00',
      'Total Saídas (R$)': cf.totalExpense?.toFixed(2) || '0.00',
      Status: cf.status,
    }));

    return this.generateCSV(data, headers);
  }

  /**
   * Escape de valores CSV (aspas, vírgulas, quebras de linha)
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Obter valor aninhado de objeto (ex: "customer.user.name")
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
