import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

/**
 * Valida se um horário (string ISO 8601) está em intervalos de 15 minutos
 * 
 * Horários válidos:
 * - 09:00, 09:15, 09:30, 09:45
 * - 14:00, 14:15, 14:30, 14:45
 * 
 * Horários inválidos:
 * - 09:05, 09:23, 14:17
 * 
 * @param validationOptions - Opções de validação customizadas
 * 
 * @example
 * ```typescript
 * export class CreateAppointmentDto {
 *   @IsQuarterHour({ message: 'O horário deve ser em intervalos de 15 minutos (ex: 09:00, 09:15, 09:30, 09:45)' })
 *   scheduledAt: string;
 * }
 * ```
 */
export function IsQuarterHour(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isQuarterHour',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Verifica se é uma string
          if (typeof value !== 'string') {
            return false;
          }

          try {
            // Converte para Date
            const date = new Date(value);

            // Verifica se é uma data válida
            if (isNaN(date.getTime())) {
              return false;
            }

            // Extrai os minutos
            const minutes = date.getMinutes();

            // Valida se os minutos são múltiplos de 15 (0, 15, 30, 45)
            return minutes % 15 === 0;
          } catch (error) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'O horário deve ser em intervalos de 15 minutos (exemplo: 09:00, 09:15, 09:30, 09:45). Horário inválido fornecido.';
        },
      },
    });
  };
}

/**
 * Valida se um horário está dentro do horário comercial (09:00 - 20:00)
 * 
 * @param validationOptions - Opções de validação customizadas
 * 
 * @example
 * ```typescript
 * export class CreateAppointmentDto {
 *   @IsBusinessHours({ message: 'O horário deve estar entre 09:00 e 20:00' })
 *   scheduledAt: string;
 * }
 * ```
 */
export function IsBusinessHours(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBusinessHours',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return false;
            }

            const hours = date.getHours();
            const minutes = date.getMinutes();

            // Horário comercial: 09:00 - 20:00
            // Se for antes das 09:00, inválido
            if (hours < 9) {
              return false;
            }

            // Se for depois das 20:00, inválido
            if (hours >= 20) {
              return false;
            }

            return true;
          } catch (error) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'O horário deve estar entre 09:00 e 20:00 (horário comercial).';
        },
      },
    });
  };
}

/**
 * Valida se a data do agendamento é no futuro
 * 
 * @param validationOptions - Opções de validação customizadas
 * 
 * @example
 * ```typescript
 * export class CreateAppointmentDto {
 *   @IsFutureDate({ message: 'O agendamento deve ser feito para uma data futura' })
 *   scheduledAt: string;
 * }
 * ```
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return false;
            }

            const now = new Date();
            return date > now;
          } catch (error) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'O agendamento deve ser feito para uma data e horário futuros.';
        },
      },
    });
  };
}
