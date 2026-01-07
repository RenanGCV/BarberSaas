import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que permite acesso público (sem autenticação)
 * ou com autenticação opcional
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Permite acesso mesmo sem token
    return true;
  }

  handleRequest(err: any, user: any) {
    // Retorna o usuário se existir, ou null se não houver autenticação
    // Não lança erro se não houver usuário
    if (err || !user) {
      return null;
    }
    return user;
  }
}
