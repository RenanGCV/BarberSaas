"use client";
import React, { useMemo, useState, useEffect } from "react";

type TimeValue = { hours: number; minutes: number };

type Props = {
  value?: TimeValue;
  onChange?: (value: TimeValue) => void;
  stepMinutes?: number; // e.g., 5, 10, 15
  size?: number; // px diameter
  className?: string;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export const TimeClockPicker: React.FC<Props> = ({
  value,
  onChange,
  stepMinutes = 5,
  size = 280,
  className,
}) => {
  const [time, setTime] = useState<TimeValue>({
    hours: value?.hours ?? 9,
    minutes: value?.minutes ?? 0,
  });

  // Sincronizar com prop value quando mudar
  useEffect(() => {
    if (value) {
      setTime(value);
    }
  }, [value?.hours, value?.minutes]);

  const radius = size / 2;
  const labelRadiusOuter = radius - 28; // Horas 13-24 (anel externo)
  const labelRadiusInner = radius - 58; // Horas 1-12 (anel interno)
  const labelRadiusMinutes = radius - 12;

  // Horas 1-12 no anel interno, 13-24 (0, 13-23) no anel externo
  const hoursInner = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], []);
  const hoursOuter = useMemo(() => [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], []);
  const minutes = useMemo(() => Array.from({ length: Math.floor(60 / stepMinutes) }, (_, i) => i * stepMinutes), [stepMinutes]);

  const setHours = (h: number) => {
    const newValue = { hours: h, minutes: time.minutes };
    setTime(newValue);
    onChange?.(newValue);
  };
  
  const setMinutes = (m: number) => {
    const newValue = { hours: time.hours, minutes: m % 60 };
    setTime(newValue);
    onChange?.(newValue);
  };

  // Ajustar horas com botões
  const incrementHour = () => {
    const newHour = (time.hours + 1) % 24;
    setHours(newHour);
  };
  
  const decrementHour = () => {
    const newHour = (time.hours - 1 + 24) % 24;
    setHours(newHour);
  };

  const hourAngle = ((time.hours % 12) / 12) * 360;
  const minuteAngle = (time.minutes / 60) * 360;

  const isAfternoon = time.hours >= 12;
  const hourHandLength = isAfternoon ? radius - 50 : radius - 75;
  const hourHand = polarToCartesian(radius, radius, hourHandLength, hourAngle);
  const minuteHand = polarToCartesian(radius, radius, radius - 35, minuteAngle);

  return (
    <div className={className} style={{ width: size, userSelect: "none" }}>
      {/* Display de horário com controles */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-surface-hover text-text-primary flex items-center justify-center"
          onClick={decrementHour}
        >
          −
        </button>
        <div className="text-2xl font-bold text-primary min-w-[80px] text-center">
          {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}
        </div>
        <button
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-surface-hover text-text-primary flex items-center justify-center"
          onClick={incrementHour}
        >
          +
        </button>
      </div>
      
      {/* Controles de minutos */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          className="px-3 py-1 rounded-lg bg-secondary hover:bg-surface-hover text-sm text-text-primary"
          onClick={() => setMinutes((time.minutes - stepMinutes + 60) % 60)}
        >
          -{stepMinutes}m
        </button>
        <button
          className="px-3 py-1 rounded-lg bg-secondary hover:bg-surface-hover text-sm text-text-primary"
          onClick={() => setMinutes((time.minutes + stepMinutes) % 60)}
        >
          +{stepMinutes}m
        </button>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx={radius} cy={radius} r={radius - 2} fill="#0F0F0F" stroke="#2D2D2D" strokeWidth="2" filter="url(#shadow)" />

        {/* Anel externo: Horas 13-24 (0, 13-23) */}
        {hoursOuter.map((h, idx) => {
          const angle = (idx / 12) * 360;
          const p = polarToCartesian(radius, radius, labelRadiusOuter, angle);
          const active = time.hours === h;
          return (
            <g key={`ho-${h}`} onClick={() => setHours(h)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={active ? 16 : 12} fill={active ? "#F5A027" : "#1A1A1A"} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={active ? 12 : 10} fontWeight={active ? "bold" : "normal"} fill={active ? "#0F0F0F" : "#888"}>
                {h}
              </text>
            </g>
          );
        })}

        {/* Anel interno: Horas 1-12 */}
        {hoursInner.map((h, idx) => {
          const angle = (idx / 12) * 360;
          const p = polarToCartesian(radius, radius, labelRadiusInner, angle);
          const active = time.hours === h || (h === 12 && time.hours === 12);
          return (
            <g key={`hi-${h}`} onClick={() => setHours(h)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={active ? 16 : 12} fill={active ? "#F5A027" : "#2D2D2D"} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={active ? 12 : 10} fontWeight={active ? "bold" : "normal"} fill={active ? "#0F0F0F" : "#A0A0A0"}>
                {h}
              </text>
            </g>
          );
        })}

        {/* Hands */}
        <line x1={radius} y1={radius} x2={hourHand.x} y2={hourHand.y} stroke="#F5A027" strokeWidth={4} strokeLinecap="round" />
        <line x1={radius} y1={radius} x2={minuteHand.x} y2={minuteHand.y} stroke="#F7B654" strokeWidth={3} strokeLinecap="round" />
        <circle cx={radius} cy={radius} r={6} fill="#F5A027" />
      </svg>

      {/* Seleção rápida de minutos */}
      <div className="mt-3 grid grid-cols-4 gap-1">
        {[0, 15, 30, 45].map((m) => (
          <button
            key={m}
            onClick={() => setMinutes(m)}
            className={`py-1 rounded-lg text-xs font-medium transition-all ${
              time.minutes === m 
                ? 'bg-primary text-background' 
                : 'bg-secondary hover:bg-surface-hover text-text-secondary'
            }`}
          >
            :{String(m).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeClockPicker;
