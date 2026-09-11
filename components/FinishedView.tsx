"use client";

import React, { useState } from "react";
import { Trophy, Sparkles, RefreshCw } from "lucide-react";
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
            ← Volver a la pantalla de finalización
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
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2))",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          marginBottom: "1rem",
        }}
      >
        <Trophy size={32} color="#34D399" />
      </div>

      <h1 style={{ fontSize: "1.85rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
        🎉 ¡Sorteo completado!
      </h1>

      <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", marginBottom: "1.5rem" }}>
        Todos los participantes ya descubrieron a quién les corresponde.
      </p>

      <div
        style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#6EE7B7" }}>
          ✨ {participantCount} personas asignadas exitosamente
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.4rem" }}>
          ¡Que empiece la celebración de Amor y Amistad! ❤️
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowLookup(true)}
        className="btn-secondary"
      >
        <Sparkles size={16} />
        <span>¿Olvidaste quién te tocó? Consultar con tu PIN</span>
      </button>
    </div>
  );
}
