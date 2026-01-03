import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 * 
 * Padroniza todas as respostas de erro da API em um formato consistente.
 * 
 * Formato de resposta:
 * {
 *   statusCode: number,
 *   timestamp: string (ISO 8601),
 *   path: string,
 *   method: string,
 *   message: string | string[],
 *   error?: string,
 *   requestId?: string
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determina o status code e a mensagem baseado no tipo de exceção
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno do servidor';
    let error = 'Internal Server Error';

    // 1. Tratamento de HttpException (NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || exception.name;
      }
    }
    // 2. Tratamento de erros do Prisma
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = 'Database Error';
    }
    // 3. Tratamento de erros de validação do Prisma
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos fornecidos para o banco de dados';
      error = 'Validation Error';
    }
    // 4. Erros genéricos
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log do erro
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Resposta padronizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Converte erros do Prisma em mensagens amigáveis
   */
  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      // Unique constraint violation
      case 'P2002': {
        const target = (exception.meta?.target as string[]) || [];
        const field = target[0] || 'campo';
        return {
          status: HttpStatus.CONFLICT,
          message: `Já existe um registro com este ${field}. Por favor, use outro valor.`,
        };
      }

      // Foreign key constraint violation
      case 'P2003': {
        const field = (exception.meta?.field_name as string) || 'relacionamento';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `O ${field} informado não existe. Verifique se o ID está correto.`,
        };
      }

      // Record not found
      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registro não encontrado. Verifique se o ID está correto.',
        };
      }

      // Required field missing
      case 'P2001': {
        const field = (exception.meta?.field_name as string) || 'campo obrigatório';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `O campo ${field} é obrigatório e não foi fornecido.`,
        };
      }

      // Invalid value
      case 'P2006': {
        const field = (exception.meta?.field_name as string) || 'campo';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `O valor fornecido para ${field} é inválido.`,
        };
      }

      // Too many connections
      case 'P1001': {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Não foi possível conectar ao banco de dados. Tente novamente em instantes.',
        };
      }

      // Connection timeout
      case 'P1008': {
        return {
          status: HttpStatus.REQUEST_TIMEOUT,
          message: 'A operação demorou muito tempo. Tente novamente.',
        };
      }

      // Default para erros não mapeados
      default: {
        this.logger.warn(`Código de erro Prisma não mapeado: ${exception.code}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao processar a operação no banco de dados.',
        };
      }
    }
  }
}
