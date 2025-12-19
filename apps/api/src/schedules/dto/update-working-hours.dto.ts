import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

class WorkingHoursDay {
  @ApiProperty({ description: 'Horário de início (HH:mm)', example: '09:00' })
  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  start: string;

  @ApiProperty({ description: 'Horário de fim (HH:mm)', example: '18:00' })
  @IsNotEmpty({ message: 'Horário de fim é obrigatório' })
  end: string;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({
    description: 'Horários de trabalho por dia da semana',
    example: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '14:00' },
    },
  })
  @IsNotEmpty({ message: 'Os horários de trabalho são obrigatórios' })
  @IsObject({ message: 'Horários de trabalho devem ser um objeto' })
  workingHours: {
    monday?: WorkingHoursDay;
    tuesday?: WorkingHoursDay;
    wednesday?: WorkingHoursDay;
    thursday?: WorkingHoursDay;
    friday?: WorkingHoursDay;
    saturday?: WorkingHoursDay;
    sunday?: WorkingHoursDay;
  };
}
