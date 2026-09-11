"use client";

import React, { useState, useEffect } from "react";
import { Gift, Lock, Sparkles, AlertCircle, Eye, EyeOff, Lightbulb, ShieldCheck, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface PublicParticipant {
  id: string;
  name: string;
  drawCompleted: boolean;
}

interface DrawingViewProps {
  onRevealed: () => void;
}

export default function DrawingView({ onRevealed }: DrawingViewProps) {
  const [participants, setParticipants] = useState<PublicParticipant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de revelación
  const [animationStep, setAnimationStep] = useState<"IDLE" | "PREPARING" | "REVEALED">("IDLE");
  const [revealedData, setRevealedData] = useState<{
    receiverName: string;
    receiverGiftNotes?: string | null;
  } | null>(null);

  const loadParticipants = async () => {
    try {
      setFetchingList(true);
      const res = await fetch("/api/participants/list-public");
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error("Error al cargar participantes:", err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedParticipantId) {
      setErrorMessage("Por favor selecciona tu nombre de la lista.");
      return;
    }

    if (!pin || pin.length !== 4) {
      setErrorMessage("Por favor ingresa tu PIN de 4 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/draw/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: selectedParticipantId,
          pin: pin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "No se pudo verificar el PIN.");
        setLoading(false);
        return;
      }

      setAnimationStep("PREPARING");

      setTimeout(() => {
        setRevealedData({
          receiverName: data.receiver.name,
          receiverGiftNotes: data.receiver.giftNotes,
        });
        setAnimationStep("REVEALED");
        setLoading(false);

        // Confeti elegante
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: ["#E11D48", "#6366F1", "#F43F5E", "#FFFFFF"],
        });

        onRevealed();
      }, 1200);
    } catch (err) {
      console.error("Error al revelar:", err);
      setErrorMessage("Error de conexión al obtener tu amigo secreto.");
      setLoading(false);
    }
  };

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  return (
    <div className="glass-card">
      {animationStep === "PREPARING" && (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "rgba(225, 29, 72, 0.15)",
              border: "1px solid rgba(225, 29, 72, 0.3)",
              marginBottom: "1.25rem",
            }}
          >
            <Loader2 size={30} color="#FDA4AF" style={{ animation: "spin 1.2s linear infinite" }} />
          </div>
          <h2 style={{ fontSize: "1.4rem", color: "#FFFFFF" }}>
            Consultando asignación confidencial...
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
            Verificando credenciales de seguridad
          </p>
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {animationStep === "REVEALED" && revealedData && (
        <div className="secret-reveal-card">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(225, 29, 72, 0.15)",
              border: "1px solid rgba(225, 29, 72, 0.3)",
              marginBottom: "1rem",
            }}
          >
            <Gift size={24} color="#FDA4AF" />
          </div>

          <h3 style={{ fontSize: "1.1rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Tu amigo secreto asignado es:
          </h3>

          <div className="friend-name-display">
            {revealedData.receiverName}
          </div>

          {/* Sección de gustos y pistas de regalo */}
          {revealedData.receiverGiftNotes ? (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1.1rem",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#FDA4AF",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                <Lightbulb size={15} />
                <span>Preferencias y sugerencias de regalo:</span>
              </div>
              <p
                style={{
                  color: "#F1F5F9",
                  fontSize: "0.92rem",
                  lineHeight: "1.45",
                  fontStyle: "italic",
                }}
              >
                "{revealedData.receiverGiftNotes}"
              </p>
            </div>
          ) : (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--color-text-subtle)",
                marginTop: "0.5rem",
              }}
            >
              (Este participante no registró notas o sugerencias específicas)
            </p>
          )}

          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1rem",
              background: "rgba(225, 29, 72, 0.08)",
              border: "1px solid rgba(225, 29, 72, 0.2)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.45rem",
              color: "#FDA4AF",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={16} />
            <span>Recuerda mantener el resultado en confidencialidad.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setAnimationStep("IDLE");
              setPin("");
              setSelectedParticipantId("");
              loadParticipants();
            }}
            className="btn-secondary"
            style={{ marginTop: "1.5rem" }}
          >
            Volver a la pantalla principal
          </button>
        </div>
      )}

      {animationStep === "IDLE" && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(99, 102, 241, 0.15))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "1rem",
              }}
            >
              <Gift size={24} color="#FDA4AF" />
            </div>

            <h1 style={{ fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.35rem" }}>
              Descubre a tu Amigo Secreto
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
              Selecciona tu nombre y confirma tu identidad con tu PIN.
            </p>
          </div>

          <form onSubmit={handleReveal}>
            {errorMessage && (
              <div className="alert alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="participantSelect">
                Selecciona tu nombre <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <select
                id="participantSelect"
                className="form-select"
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                disabled={loading || fetchingList}
                required
              >
                <option value="">-- Selecciona quién eres --</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.drawCompleted ? "(Consultado)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedParticipant && (
              <div
                style={{
                  animation: "slideUp 0.2s ease-out",
                  background: "rgba(0,0,0,0.25)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", color: "var(--color-text-main)", fontWeight: 600, fontSize: "0.88rem" }}>
                  <Lock size={15} color="#FDA4AF" />
                  <span>Confirma tu identidad</span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="participantPin">
                    Ingresa tu PIN de 4 dígitos
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="participantPin"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="form-input"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setPin(val);
                      }}
                      maxLength={4}
                      disabled={loading}
                      style={{ paddingRight: "2.75rem", letterSpacing: showPin ? "0" : "0.3em", fontSize: "1.1rem" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-subtle)",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      tabIndex={-1}
                    >
                      {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !selectedParticipantId || pin.length !== 4}
            >
              <Sparkles size={17} />
              <span>Ver Asignación</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
