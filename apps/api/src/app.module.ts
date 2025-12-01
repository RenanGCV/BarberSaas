import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

// Feature Modules
import { AppointmentsModule } from './appointments/appointments.module';
import { BarbersModule } from './barbers/barbers.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportsModule } from './reports/reports.module';
import { ServicesModule } from './services/services.module';
import { TenantsModule } from './tenants/tenants.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL) || 60,
        limit: Number(process.env.THROTTLE_LIMIT) || 100,
      },
    ]),

    // Schedule
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,
    AuthModule,

    // Features
    UsersModule,
    TenantsModule,
    BarbersModule,
    ServicesModule,
    AppointmentsModule,
    PaymentsModule,
    TransactionsModule,
    CashFlowModule,
    PromotionsModule,
    ReportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
