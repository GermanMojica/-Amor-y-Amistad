"use client";

import React from "react";
import { Lock, UserPlus, Clock, Sparkles, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  state: "REGISTRATION" | "READY" | "DRAWING" | "FINISHED";
  participantCount: number;
  revealedCount?: number;
  onOpenAdmin: () => void;
}

export default function Header({
  state,
  participantCount,
  revealedCount = 0,
  onOpenAdmin,
}: HeaderProps) {
  const getBadgeInfo = () => {
    switch (state) {
      case "REGISTRATION":
        return {
          className: "brand-badge registration",
          icon: <UserPlus size={14} />,
          text: `Registro abierto (${participantCount} registrados)`,
        };
      case "READY":
        return {
          className: "brand-badge ready",
          icon: <Clock size={14} />,
          text: `Listo para sortear (${participantCount} participantes)`,
        };
      case "DRAWING":
        return {
          className: "brand-badge drawing",
          icon: <Sparkles size={14} />,
          text: `Sorteo en curso (${revealedCount} de ${participantCount} consultados)`,
        };
      case "FINISHED":
        return {
          className: "brand-badge finished",
          icon: <CheckCircle2 size={14} />,
          text: `Sorteo completado (${participantCount} participantes)`,
        };
      default:
        return {
          className: "brand-badge",
          icon: null,
          text: "Amigo Secreto",
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <header className="header-bar">
      <div className={badge.className}>
        {badge.icon}
        <span>{badge.text}</span>
      </div>

      <button
        type="button"
        onClick={onOpenAdmin}
        className="btn-icon"
        title="Panel de administración"
        aria-label="Acceso Organizador"
      >
        <Lock size={15} />
      </button>
    </header>
  );
}
