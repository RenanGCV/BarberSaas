import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockScheduleDto, GetAvailableSlotsDto, UpdateWorkingHoursDto } from './dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca slots disponíveis para agendamento
   */
  async getAvailableSlots(dto: GetAvailableSlotsDto, tenantId: string) {
    const { barberId, serviceId, date } = dto;

    // Validar barbeiro
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId, isActive: true },
      include: { user: { select: { name: true } } },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    // Validar serviço
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Validar se barbeiro oferece este serviço
    const barberService = await this.prisma.barberService.findFirst({
      where: { barberId, serviceId },
    });

    if (!barberService) {
      throw new BadRequestException(
        'Este barbeiro não oferece o serviço selecionado',
      );
    }

    // Parsear data
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleLowerCase('en-US', {
      weekday: 'long',
    }); // monday, tuesday, etc

    // Verificar se barbeiro trabalha neste dia
    const workingHours = barber.workingHours as any;
    if (!workingHours || !workingHours[dayOfWeek]) {
      return {
        date,
        barber: {
          id: barber.id,
          name: barber.user.name,
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        slots: [],
        message: `${barber.user.name} não trabalha neste dia`,
      };
    }

    // Obter horários de trabalho
    const { start, end } = workingHours[dayOfWeek];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    // Gerar todos os slots possíveis (intervalos de 15 minutos)
    const allSlots: string[] = [];
    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMin, 0, 0);

    let currentSlot = new Date(startTime);
    while (currentSlot < endTime) {
      const slotTime = currentSlot.toTimeString().substring(0, 5); // HH:mm
      allSlots.push(slotTime);
      currentSlot.setMinutes(currentSlot.getMinutes() + 15);
    }

    // Buscar agendamentos existentes do dia
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      include: {
        service: { select: { duration: true } },
      },
    });

    // Buscar horários bloqueados
    const blockedSchedules = await this.prisma.blockedSchedule.findMany({
      where: {
        barberId,
        startTime: {
          gte: startOfDay,
        },
        endTime: {
          lte: endOfDay,
        },
      },
    });

    // Filtrar slots disponíveis
    const availableSlots = allSlots.filter((slot) => {
      const [hour, min] = slot.split(':').map(Number);
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hour, min, 0, 0);

      // Calcular fim do agendamento (considerando duração do serviço)
      const appointmentEnd = new Date(slotDateTime);
      appointmentEnd.setMinutes(
        appointmentEnd.getMinutes() + service.duration,
      );

      // Verificar se conflita com agendamentos existentes
      for (const appointment of existingAppointments) {
        const appointmentStart = new Date(appointment.scheduledAt);
        const existingEnd = new Date(appointmentStart);
        existingEnd.setMinutes(
          existingEnd.getMinutes() + appointment.service.duration,
        );

        // Verificar sobreposição
        if (
          (slotDateTime >= appointmentStart && slotDateTime < existingEnd) ||
          (appointmentEnd > appointmentStart && appointmentEnd <= existingEnd) ||
          (slotDateTime <= appointmentStart && appointmentEnd >= existingEnd)
        ) {
          return false; // Slot ocupado
        }
      }

      // Verificar se conflita com horários bloqueados
      for (const blocked of blockedSchedules) {
        const blockedStart = new Date(blocked.startTime);
        const blockedEnd = new Date(blocked.endTime);

        if (
          (slotDateTime >= blockedStart && slotDateTime < blockedEnd) ||
          (appointmentEnd > blockedStart && appointmentEnd <= blockedEnd) ||
          (slotDateTime <= blockedStart && appointmentEnd >= blockedEnd)
        ) {
          return false; // Slot bloqueado
        }
      }

      // Verificar se não está no passado
      if (slotDateTime < new Date()) {
        return false;
      }

      return true; // Slot disponível
    });

    return {
      date,
      barber: {
        id: barber.id,
        name: barber.user.name,
      },
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
      },
      slots: availableSlots,
    };
  }

  /**
   * Bloquear horário
   */
  async blockSchedule(dto: BlockScheduleDto, tenantId: string) {
    const { barberId, startTime, endTime, reason } = dto;

    // Validar barbeiro
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId, isActive: true },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    // Validar datas
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de fim',
      );
    }

    if (start < new Date()) {
      throw new BadRequestException(
        'Não é possível bloquear horários no passado',
      );
    }

    // Criar bloqueio
    const blocked = await this.prisma.blockedSchedule.create({
      data: {
        barberId,
        tenantId,
        startTime: start,
        endTime: end,
        reason,
      },
      include: {
        barber: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return {
      id: blocked.id,
      barber: {
        id: blocked.barber.id,
        name: blocked.barber.user.name,
      },
      startTime: blocked.startTime,
      endTime: blocked.endTime,
      reason: blocked.reason,
      createdAt: blocked.createdAt,
    };
  }

  /**
   * Remover bloqueio de horário
   */
  async unblockSchedule(blockId: string, tenantId: string) {
    const blocked = await this.prisma.blockedSchedule.findFirst({
      where: { id: blockId, tenantId },
    });

    if (!blocked) {
      throw new NotFoundException('Bloqueio não encontrado');
    }

    await this.prisma.blockedSchedule.delete({
      where: { id: blockId },
    });

    return {
      message: 'Bloqueio removido com sucesso',
      id: blockId,
    };
  }

  /**
   * Listar horários bloqueados de um barbeiro
   */
  async getBlockedSchedules(barberId: string, tenantId: string) {
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    const blocked = await this.prisma.blockedSchedule.findMany({
      where: {
        barberId,
        endTime: {
          gte: new Date(), // Apenas bloqueios futuros
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return blocked;
  }

  /**
   * Obter horários de trabalho de um barbeiro
   */
  async getWorkingHours(barberId: string, tenantId: string) {
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId, isActive: true },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    return {
      id: barber.id,
      name: barber.user.name,
      workingHours: barber.workingHours || {},
    };
  }

  /**
   * Atualizar horários de trabalho de um barbeiro
   */
  async updateWorkingHours(
    barberId: string,
    dto: UpdateWorkingHoursDto,
    tenantId: string,
  ) {
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId, tenantId, isActive: true },
    });

    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    // Validar formato dos horários
    this.validateWorkingHours(dto.workingHours);

    const updated = await this.prisma.barber.update({
      where: { id: barberId },
      data: {
        workingHours: dto.workingHours as any,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.user.name,
      workingHours: updated.workingHours,
      message: 'Horários de trabalho atualizados com sucesso',
    };
  }

  /**
   * Validar formato dos horários de trabalho
   */
  private validateWorkingHours(workingHours: any) {
    const validDays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const day of Object.keys(workingHours)) {
      if (!validDays.includes(day)) {
        throw new BadRequestException(`Dia inválido: ${day}`);
      }

      const { start, end } = workingHours[day];

      if (!start || !end) {
        throw new BadRequestException(
          `Horários de ${day} devem ter 'start' e 'end'`,
        );
      }

      if (!timeRegex.test(start) || !timeRegex.test(end)) {
        throw new BadRequestException(
          `Formato de horário inválido em ${day}. Use HH:mm`,
        );
      }

      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        throw new BadRequestException(
          `Em ${day}, horário de início deve ser anterior ao horário de fim`,
        );
      }
    }
  }
}
