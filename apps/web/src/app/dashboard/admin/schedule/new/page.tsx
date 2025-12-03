"use client";
import TimeClockPicker from "@/components/TimeClockPicker";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSchedulePage() {
  const router = useRouter();
  const [time, setTime] = useState<{ hours: number; minutes: number }>({ hours: 9, minutes: 0 });
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [barberId, setBarberId] = useState<string>("");

  const handleSave = async () => {
    const scheduledAt = new Date(date);
    scheduledAt.setHours(time.hours, time.minutes, 0, 0);

    // TODO: Integrar com endpoint real de agenda, se existir.
    // Exemplo: await api.post("/barbers/schedule", { barberId, scheduledAt })
    console.log({ barberId, scheduledAt });
    router.push("/dashboard/admin");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <button className="px-3 py-2 rounded-md bg-secondary hover:bg-surface-hover text-text-primary" onClick={() => router.back()}>
          Voltar
        </button>
      </div>
      <h1 className="text-2xl font-semibold mb-2 text-text-primary">Novo Horário do Colaborador</h1>
      <p className="text-text-secondary mb-6">Selecione data e horário no relógio para criar um slot disponível.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-text-secondary">Data</label>
          <input
            type="date"
            className="mt-1 w-full px-3 py-2 rounded-md bg-surface border border-secondary text-text-primary"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="mt-4">
            <label className="text-sm text-text-secondary">Colaborador (Barbeiro)</label>
            <input
              type="text"
              placeholder="ID do barbeiro"
              className="mt-1 w-full px-3 py-2 rounded-md bg-surface border border-secondary text-text-primary"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <TimeClockPicker stepMinutes={5} value={time} onChange={setTime} />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button className="px-4 py-2 rounded-md bg-secondary hover:bg-surface-hover text-text-primary" onClick={() => router.back()}>
          Cancelar
        </button>
        <button className="px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-black font-semibold" onClick={handleSave}>
          Salvar horário
        </button>
      </div>
    </div>
  );
}
