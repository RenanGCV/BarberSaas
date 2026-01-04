import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionFiltersDto, UpdateTransactionDto } from './dto';

// Tipo para dados completos de transação (após preenchimento no controller)
interface TransactionCreateData extends Omit<CreateTransactionDto, 'createdBy' | 'description'> {
  createdBy: string;
  description: string;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: TransactionCreateData, tenantId: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        type: createTransactionDto.type,
        category: createTransactionDto.category,
        amount: createTransactionDto.amount,
        description: createTransactionDto.description,
        createdBy: createTransactionDto.createdBy,
        paymentMethod: createTransactionDto.paymentMethod,
        appointmentId: createTransactionDto.appointmentId,
        tenantId,
      },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return transaction;
  }

  async findAll(tenantId: string, filters?: TransactionFiltersDto) {
    const where: any = { tenantId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totais
    const totals = await this.calculateTotals(tenantId, filters);

    return {
      data: transactions,
      totals,
    };
  }

  async findOne(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true,
            barber: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        appointment: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transação removida com sucesso' };
  }

  async getByPeriod(tenantId: string, startDate: string, endDate: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totals = await this.calculateTotals(tenantId, { startDate, endDate });

    // Agrupar por dia
    const byDay = transactions.reduce((acc: any, transaction) => {
      const day = transaction.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { income: 0, expense: 0, transactions: [] };
      }
      if (transaction.type === 'INCOME') {
        acc[day].income += transaction.amount;
      } else {
        acc[day].expense += transaction.amount;
      }
      acc[day].transactions.push(transaction);
      return acc;
    }, {});

    return {
      transactions,
      totals,
      byDay,
    };
  }

  async getCategorySummary(tenantId: string, type: 'INCOME' | 'EXPENSE', startDate?: string, endDate?: string) {
    const where: any = {
      tenantId,
      type,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        category: true,
        amount: true,
      },
    });

    // Agrupar por categoria
    const summary = transactions.reduce((acc: any, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {});

    // Converter para array ordenado
    const result = Object.entries(summary)
      .map(([category, total]) => ({ category, total }))
      .sort((a: any, b: any) => b.total - a.total);

    return result;
  }

  private async calculateTotals(tenantId: string, filters?: TransactionFiltersDto) {
    const where: any = { tenantId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [incomeResult, expenseResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const income = incomeResult._sum.amount || 0;
    const expense = expenseResult._sum.amount || 0;

    return {
      income,
      expense,
      balance: income - expense,
    };
  }
}
