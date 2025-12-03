import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3333;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsUrl({ require_tld: false })
  @IsOptional()
  WEB_URL?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  MOBILE_URL?: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number = 60;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 100;

  @IsNumber()
  @IsOptional()
  BCRYPT_ROUNDS: number = 10;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Erro na validação de variáveis de ambiente:\n${errors.toString()}`);
  }

  return validatedConfig;
}
