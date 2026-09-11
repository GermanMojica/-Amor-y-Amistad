"use client";

import React from "react";
import { Lock, Sparkles, Heart } from "lucide-react";

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
          className: "brand-badge",
          text: `📝 Registro abierto • ${participantCount} registrados`,
        };
      case "READY":
        return {
          className: "brand-badge ready",
          text: `🎁 ¡Listo! • ${participantCount} participantes`,
        };
      case "DRAWING":
        return {
          className: "brand-badge drawing",
          text: `🎲 Descubriendo (${revealedCount}/${participantCount})`,
        };
      case "FINISHED":
        return {
          className: "brand-badge finished",
          text: `🎉 Sorteo Completado (${participantCount}/${participantCount})`,
        };
      default:
        return {
          className: "brand-badge",
          text: "Amor y Amistad",
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <header className="header-bar">
      <div className={badge.className}>
        <span>{badge.text}</span>
      </div>

      <button
        type="button"
        onClick={onOpenAdmin}
        className="btn-icon"
        title="Panel del Organizador"
        aria-label="Acceso Organizador"
      >
        <Lock size={16} />
      </button>
    </header>
  );
}
