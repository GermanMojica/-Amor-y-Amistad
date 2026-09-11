"use client";

import React from "react";
import { Clock, Users, Gift, ShieldAlert } from "lucide-react";

interface ReadyViewProps {
  participantCount: number;
}

export default function ReadyView({ participantCount }: ReadyViewProps) {
  return (
    <div className="glass-card" style={{ textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(225, 29, 72, 0.15))",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          marginBottom: "1.25rem",
        }}
      >
        <Gift size={26} color="#FCD34D" />
      </div>

      <h1 style={{ fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
        Registro Cerrado
      </h1>
      
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
        Todos los participantes han sido registrados. El sorteo está listo para comenzar.
      </p>

      <div
        style={{
          background: "rgba(245, 158, 11, 0.06)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Users size={18} color="#FCD34D" />
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
            {participantCount} participantes listos
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)", marginTop: "0.4rem" }}>
          El organizador activará las asignaciones en breve. Ten a mano tu PIN de 4 dígitos.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--color-text-subtle)", fontSize: "0.82rem" }}>
        <Clock size={15} />
        <span>En espera de activación por parte del organizador</span>
      </div>
    </div>
  );
}
