import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    const userId = user?.id || 'anonymous';
    const tenantId = user?.tenantId || 'none';

    this.logger.log(
      `→ ${method} ${url} | User: ${userId} | Tenant: ${tenantId}`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;

          this.logger.log(
            `← ${method} ${url} ${statusCode} | ${delay}ms | User: ${userId}`
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `✗ ${method} ${url} ${error.status || 500} | ${delay}ms | ${error.message}`,
            error.stack
          );
        },
      })
    );
  }
}
