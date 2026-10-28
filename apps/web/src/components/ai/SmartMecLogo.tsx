"use client";

import Image from "next/image";

interface SmartMecLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  alt?: string;
}

export function SmartMecLogo({
  size = 40,
  className = "",
  glow = false,
  alt = "SmartMec - Asistente IA Automotriz",
}: SmartMecLogoProps) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0F172A] p-0.5 border border-cyan-500/30 ${
        glow ? "shadow-[0_0_15px_rgba(6,182,212,0.35)]" : "shadow-md"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/smartmec-logo.png"
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover rounded-lg"
        priority
      />
    </div>
  );
}

export function SmartMecBadge({
  size = 32,
  showLabel = true,
}: {
  size?: number;
  showLabel?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <SmartMecLogo size={size} glow />
      {showLabel && (
        <div className="flex flex-col text-left">
          <span className="font-display text-[13.5px] font-bold leading-none tracking-tight text-fg">
            Smart<span className="text-cyan-500">Mec</span>
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-fg-3">
            Copiloto IA
          </span>
        </div>
      )}
    </div>
  );
}
