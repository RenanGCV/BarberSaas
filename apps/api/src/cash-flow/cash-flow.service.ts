import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCashMovementDto, CloseCashFlowDto, OpenCashFlowDto } from './dto';

@Injectable()
export class CashFlowService {
  constructor(private prisma: PrismaService) {}

  async open(openCashFlowDto: OpenCashFlowDto, tenantId: string, userId: string) {
    // Verificar se já existe caixa aberto hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashFlow = await this.prisma.cashFlow.findFirst({
      where: {
        tenantId,
        date: {
          gte: today,
        },
        closedAt: null,
      },
    });

    if (existingCashFlow) {
      throw new BadRequestException('Já existe um caixa aberto para hoje');
    }

    const cashFlow = await this.prisma.cashFlow.create({
      data: {
        tenantId,
        openedBy: userId,
        openingBalance: openCashFlowDto.openingBalance,
        date: new Date(),
      },
    });

    return cashFlow;
  }

  async getCurrent(tenantId: string) {
    const cashFlow = await this.prisma.cashFlow.findFirst({
      where: {
        tenantId,
        closedAt: null,
      },
      orderBy: { openedAt: 'desc' },
    });

    if (!cashFlow) {
      throw new NotFoundException('Não há caixa aberto no momento');
    }

    // Buscar transações do dia
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: cashFlow.openedAt,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...cashFlow,
      transactions,
    };
  }

  async addMovement(cashFlowId: string, movementDto: AddCashMovementDto, tenantId: string) {
    const cashFlow = await this.prisma.cashFlow.findFirst({
      where: { id: cashFlowId, tenantId, closedAt: null },
    });

    if (!cashFlow) {
      throw new NotFoundException('Caixa não encontrado ou já fechado');
    }

    // Criar transação
    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        type: movementDto.type,
        category: movementDto.category,
        amount: movementDto.amount,
        description: movementDto.description,
        createdBy: cashFlow.openedBy,
        cashFlowId,
      },
    });

    // Atualizar totais do caixa
    const updateData: any = {};
    if (movementDto.type === 'INCOME') {
      updateData.totalIncome = { increment: movementDto.amount };
    } else {
      updateData.totalExpense = { increment: movementDto.amount };
    }

    await this.prisma.cashFlow.update({
      where: { id: cashFlowId },
      data: updateData,
    });

    return transaction;
  }

  async close(cashFlowId: string, closeCashFlowDto: CloseCashFlowDto, tenantId: string, userId: string) {
    const cashFlow = await this.prisma.cashFlow.findFirst({
      where: { id: cashFlowId, tenantId, closedAt: null },
    });

    if (!cashFlow) {
      throw new NotFoundException('Caixa não encontrado ou já fechado');
    }

    // Calcular totais do dia
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: cashFlow.openedAt,
        },
      },
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const closingBalance = cashFlow.openingBalance + totalIncome - totalExpense;

    // Fechar caixa
    const closedCashFlow = await this.prisma.cashFlow.update({
      where: { id: cashFlowId },
      data: {
        closedAt: new Date(),
        closedBy: userId,
        closingBalance,
        totalIncome,
        totalExpense,
      },
    });

    return closedCashFlow;
  }

  async getHistory(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.cashFlow.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const cashFlow = await this.prisma.cashFlow.findFirst({
      where: { id, tenantId },
    });

    if (!cashFlow) {
      throw new NotFoundException('Caixa não encontrado');
    }

    // Buscar transações do período
    const endDate = cashFlow.closedAt || new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: cashFlow.openedAt,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      ...cashFlow,
      transactions,
    };
  }

  async getDailySummary(tenantId: string, date: string) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const [cashFlow, transactions] = await Promise.all([
      this.prisma.cashFlow.findFirst({
        where: {
          tenantId,
          date: {
            gte: targetDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: targetDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: targetDate.toISOString().split('T')[0],
      cashFlow,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    };
  }
}
