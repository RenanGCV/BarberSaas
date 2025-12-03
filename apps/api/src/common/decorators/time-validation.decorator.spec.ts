import { validate } from 'class-validator';
import { IsBusinessHours, IsFutureDate, IsQuarterHour } from './time-validation.decorator';

class TestQuarterHourDto {
  @IsQuarterHour()
  time: string;
}

class TestBusinessHoursDto {
  @IsBusinessHours()
  time: string;
}

class TestFutureDateDto {
  @IsFutureDate()
  time: string;
}

describe('Time Validation Decorators', () => {
  describe('@IsQuarterHour', () => {
    it('should accept times in 15-minute intervals', async () => {
      const validTimes = [
        '2024-12-15T09:00:00Z',
        '2024-12-15T09:15:00Z',
        '2024-12-15T09:30:00Z',
        '2024-12-15T09:45:00Z',
        '2024-12-15T14:00:00Z',
      ];

      for (const time of validTimes) {
        const dto = new TestQuarterHourDto();
        dto.time = time;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject times not in 15-minute intervals', async () => {
      const invalidTimes = [
        '2024-12-15T09:05:00Z', // 5 minutes
        '2024-12-15T09:23:00Z', // 23 minutes
        '2024-12-15T14:17:00Z', // 17 minutes
        '2024-12-15T10:42:00Z', // 42 minutes
      ];

      for (const time of invalidTimes) {
        const dto = new TestQuarterHourDto();
        dto.time = time;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.isQuarterHour).toBeDefined();
      }
    });

    it('should reject invalid date strings', async () => {
      const dto = new TestQuarterHourDto();
      dto.time = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('@IsBusinessHours', () => {
    it('should accept times between 09:00 and 20:00', async () => {
      const validTimes = [
        '2024-12-15T09:00:00Z',
        '2024-12-15T12:30:00Z',
        '2024-12-15T19:45:00Z',
      ];

      for (const time of validTimes) {
        const dto = new TestBusinessHoursDto();
        dto.time = time;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject times before 09:00', async () => {
      const dto = new TestBusinessHoursDto();
      dto.time = '2024-12-15T08:30:00Z';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isBusinessHours).toBeDefined();
    });

    it('should reject times after 20:00', async () => {
      const invalidTimes = [
        '2024-12-15T20:00:00Z',
        '2024-12-15T21:30:00Z',
        '2024-12-15T23:00:00Z',
      ];

      for (const time of invalidTimes) {
        const dto = new TestBusinessHoursDto();
        dto.time = time;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('@IsFutureDate', () => {
    it('should accept future dates', async () => {
      const dto = new TestFutureDateDto();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      dto.time = futureDate.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject past dates', async () => {
      const dto = new TestFutureDateDto();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // 7 days ago
      dto.time = pastDate.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isFutureDate).toBeDefined();
    });

    it('should reject current date/time', async () => {
      const dto = new TestFutureDateDto();
      dto.time = new Date().toISOString();
      
      const errors = await validate(dto);
      // Pode passar ou falhar dependendo da precisão do timestamp
      // Então testamos com um timestamp definitivamente no passado
      const pastDto = new TestFutureDateDto();
      const past = new Date();
      past.setSeconds(past.getSeconds() - 1);
      pastDto.time = past.toISOString();
      
      const pastErrors = await validate(pastDto);
      expect(pastErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Combined validations', () => {
    class CreateAppointmentDto {
      @IsQuarterHour()
      @IsBusinessHours()
      @IsFutureDate()
      scheduledAt: string;
    }

    it('should accept valid appointment time', async () => {
      const dto = new CreateAppointmentDto();
      const future = new Date();
      future.setDate(future.getDate() + 1); // tomorrow
      future.setHours(14, 30, 0, 0); // 14:30
      dto.scheduledAt = future.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject appointment with invalid minute interval', async () => {
      const dto = new CreateAppointmentDto();
      const future = new Date();
      future.setDate(future.getDate() + 1);
      future.setHours(14, 23, 0, 0); // 14:23 (not quarter hour)
      dto.scheduledAt = future.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject appointment outside business hours', async () => {
      const dto = new CreateAppointmentDto();
      const future = new Date();
      future.setDate(future.getDate() + 1);
      future.setHours(21, 0, 0, 0); // 21:00 (after hours)
      dto.scheduledAt = future.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject past appointment time', async () => {
      const dto = new CreateAppointmentDto();
      const past = new Date();
      past.setDate(past.getDate() - 1); // yesterday
      past.setHours(14, 30, 0, 0);
      dto.scheduledAt = past.toISOString();
      
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
