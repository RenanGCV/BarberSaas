import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper para limpar dados nos testes
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');

      return Promise.all(
        models.map(modelKey => {
          return this[modelKey].deleteMany();
        }),
      );
    }
  }
}
