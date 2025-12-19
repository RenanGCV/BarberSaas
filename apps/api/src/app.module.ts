import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

// Config
import { validate } from './config/env.validation';

// Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Interceptors
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Middleware
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

// Feature Modules
import { AppointmentsModule } from './appointments/appointments.module';
import { BarbersModule } from './barbers/barbers.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ServicesModule } from './services/services.module';
import { TasksModule } from './tasks/tasks.module';
import { TenantsModule } from './tenants/tenants.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
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
    SchedulesModule,
    AppointmentsModule,
    PaymentsModule,
    TransactionsModule,
    CashFlowModule,
    PromotionsModule,
    ReportsModule,
    NotificationsModule,
    HealthModule,
    EventsModule,
    TasksModule,
  ],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
