"use client";

import React from "react";
import { Gift, Clock, Sparkles } from "lucide-react";

interface ReadyViewProps {
  participantCount: number;
}

export default function ReadyView({ participantCount }: ReadyViewProps) {
  return (
    <div className="glass-card" style={{ textAlign: "center" }}>
      <div className="gift-box-wrapper">
        <div className="gift-box shaking">
          <div className="gift-box-ribbon-v" />
          <div className="gift-box-ribbon-h" />
          <div className="gift-bow" />
        </div>
      </div>

      <h1 style={{ fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
        🎁 ¡Todos están registrados!
      </h1>
      
      <p style={{ color: "var(--color-accent-gold-light)", fontSize: "1.05rem", fontWeight: 600, marginBottom: "1rem" }}>
        El sorteo está listo para comenzar.
      </p>

      <div
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          margin: "1.25rem 0",
        }}
      >
        <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
          🎁 {participantCount} participantes
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          El organizador está por habilitar el sorteo. ¡Ten a mano tu PIN de 4 dígitos!
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
        <Clock size={16} />
        <span>Esperando activación por el organizador...</span>
      </div>
    </div>
  );
}
