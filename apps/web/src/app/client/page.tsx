'use client';

import Link from 'next/link';

export default function ClientHome() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Olá! O que deseja fazer hoje?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Quick href="/client/appointments/new" title="Agendar Serviço" desc="Escolha barbeiro, serviço e horário" />
        <Quick href="/client/appointments" title="Meus Agendamentos" desc="Ver, remarcar ou cancelar" />
      </div>
    </div>
  );
}

function Quick({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card hover:bg-surface-hover transition-colors">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{desc}</p>
    </Link>
  );
}
