import {
    HttpException,
    HttpStatus,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly maxRequests = 100; // 100 requisições
  private readonly windowMs = 60 * 1000; // por minuto

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();

    // Limpar registros expirados
    if (this.store[key] && now > this.store[key].resetTime) {
      delete this.store[key];
    }

    // Inicializar ou incrementar contador
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
    } else {
      this.store[key].count++;
    }

    // Verificar limite
    if (this.store[key].count > this.maxRequests) {
      const retryAfter = Math.ceil((this.store[key].resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', this.store[key].resetTime);

      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Headers informativos
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', this.maxRequests - this.store[key].count);
    res.setHeader('X-RateLimit-Reset', this.store[key].resetTime);

    next();
  }

  private getKey(req: Request): string {
    // Usar IP + tenantId (se autenticado)
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const tenantId = (req as any).user?.tenantId || 'public';
    return `${ip}:${tenantId}`;
  }
}
