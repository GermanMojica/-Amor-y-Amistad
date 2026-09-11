"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles, KeyRound } from "lucide-react";
import DrawingView from "./DrawingView";

interface FinishedViewProps {
  participantCount: number;
}

export default function FinishedView({ participantCount }: FinishedViewProps) {
  const [showLookup, setShowLookup] = useState(false);

  if (showLookup) {
    return (
      <div>
        <DrawingView onRevealed={() => {}} />
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowLookup(false)}
            className="btn-secondary"
          >
            Volver a la pantalla de finalización
          </button>
        </div>
      </div>
    );
  }

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
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          marginBottom: "1.25rem",
        }}
      >
        <CheckCircle2 size={28} color="#34D399" />
      </div>

      <h1 style={{ fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
        Sorteo Completado
      </h1>

      <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
        Todos los participantes han consultado a su amigo secreto asignado.
      </p>

      <div
        style={{
          background: "rgba(16, 185, 129, 0.06)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#6EE7B7" }}>
          {participantCount} participantes asignados
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>
          El intercambio está listo para celebrarse.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowLookup(true)}
        className="btn-secondary"
      >
        <KeyRound size={16} />
        <span>Consultar nuevamente con PIN</span>
      </button>
    </div>
  );
}
