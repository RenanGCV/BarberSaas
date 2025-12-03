"use client";
import React, { useMemo, useState } from "react";

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

  const radius = size / 2;
  const labelRadiusHours = radius - 36;
  const labelRadiusMinutes = radius - 16;

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1) % 12 || 12), []);
  const minutes = useMemo(() => Array.from({ length: Math.floor(60 / stepMinutes) }, (_, i) => i * stepMinutes), [stepMinutes]);

  const setHours = (h: number) => {
    const newValue = { hours: h % 24, minutes: time.minutes };
    setTime(newValue);
    onChange?.(newValue);
  };
  const setMinutes = (m: number) => {
    const newValue = { hours: time.hours, minutes: m % 60 };
    setTime(newValue);
    onChange?.(newValue);
  };

  const hourAngle = ((time.hours % 12) / 12) * 360;
  const minuteAngle = (time.minutes / 60) * 360;

  const hourHand = polarToCartesian(radius, radius, radius - 70, hourAngle);
  const minuteHand = polarToCartesian(radius, radius, radius - 40, minuteAngle);

  return (
    <div className={className} style={{ width: size, userSelect: "none" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-semibold text-primary">
          {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded-md bg-secondary hover:bg-surface-hover text-sm text-text-primary"
            onClick={() => setMinutes((time.minutes + stepMinutes) % 60)}
          >
            +{stepMinutes}m
          </button>
          <button
            className="px-2 py-1 rounded-md bg-secondary hover:bg-surface-hover text-sm text-text-primary"
            onClick={() => setMinutes((time.minutes - stepMinutes + 60) % 60)}
          >
            -{stepMinutes}m
          </button>
        </div>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx={radius} cy={radius} r={radius - 2} fill="#0F0F0F" stroke="#2D2D2D" strokeWidth="2" filter="url(#shadow)" />

        {/* Hour labels */}
        {hours.map((h, idx) => {
          const angle = (idx / 12) * 360;
          const p = polarToCartesian(radius, radius, labelRadiusHours, angle);
          const active = (time.hours % 12 || 12) === h;
          return (
            <g key={`h-${h}`} onClick={() => setHours(h)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={active ? 18 : 14} fill={active ? "#F5A027" : "#1A1A1A"} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={active ? 14 : 12} fill={active ? "#0F0F0F" : "#A0A0A0"}>
                {h}
              </text>
            </g>
          );
        })}

        {/* Minute labels */}
        {minutes.map((m, idx) => {
          const angle = (m / 60) * 360;
          const p = polarToCartesian(radius, radius, labelRadiusMinutes, angle);
          const active = time.minutes === m;
          return (
            <g key={`m-${m}`} onClick={() => setMinutes(m)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={active ? 12 : 9} fill={active ? "#F5A027" : "#2D2D2D"} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fill={active ? "#0F0F0F" : "#A0A0A0"}>
                {String(m).padStart(2, "0")}
              </text>
            </g>
          );
        })}

        {/* Hands */}
        <line x1={radius} y1={radius} x2={hourHand.x} y2={hourHand.y} stroke="#F5A027" strokeWidth={4} strokeLinecap="round" />
        <line x1={radius} y1={radius} x2={minuteHand.x} y2={minuteHand.y} stroke="#F7B654" strokeWidth={3} strokeLinecap="round" />
        <circle cx={radius} cy={radius} r={6} fill="#F5A027" />
      </svg>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-text-secondary">Toque nos números para ajustar.</div>
        <div className="text-xs text-text-secondary">Passo: {stepMinutes}m</div>
      </div>
    </div>
  );
};

export default TimeClockPicker;
