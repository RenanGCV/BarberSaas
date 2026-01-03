import { IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TimeSlot {
  @ApiProperty({
    description: 'Horário de início (formato HH:mm)',
    example: '09:00',
  })
  start: string;

  @ApiProperty({
    description: 'Horário de término (formato HH:mm)',
    example: '18:00',
  })
  end: string;
}

class WorkingHoursConfig {
  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  monday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  tuesday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  wednesday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  thursday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  friday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  saturday?: TimeSlot;

  @ApiProperty({ type: TimeSlot, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlot)
  sunday?: TimeSlot;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({
    description: 'Configuração de horários de trabalho por dia da semana',
    example: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '14:00' },
    },
  })
  @IsObject({ message: 'Os horários de trabalho devem ser um objeto válido' })
  @ValidateNested()
  @Type(() => WorkingHoursConfig)
  workingHours: WorkingHoursConfig;
}
