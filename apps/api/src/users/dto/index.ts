import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto válido' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto válido' })
  @Matches(/^\(?(\d{2})\)?\s?9?\d{4}-?\d{4}$/, {
    message: 'Telefone inválido. Use o formato: (11) 98765-4321'
  })
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({}, { message: 'A URL do avatar deve ser válida' })
  avatar?: string;
}
