"use client";

import React, { useState, useEffect } from "react";
import { Gift, Lock, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle, HeartHandshake, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

interface PublicParticipant {
  id: string;
  name: string;
  nickname: string | null;
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

  // Estados de animación del descubrimiento
  const [animationStep, setAnimationStep] = useState<"IDLE" | "PREPARING" | "REVEALED">("IDLE");
  const [revealedData, setRevealedData] = useState<{
    receiverName: string;
    receiverNickname?: string | null;
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

      // Iniciar secuencia de animación mágica
      setAnimationStep("PREPARING");

      setTimeout(() => {
        setRevealedData({
          receiverName: data.receiver.name,
          receiverNickname: data.receiver.nickname,
        });
        setAnimationStep("REVEALED");
        setLoading(false);

        // Explosión de confeti festivo
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#E11D48", "#FDA4AF", "#F59E0B", "#FDE68A", "#FFFFFF"],
        });

        // Segundo estallido lateral
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#E11D48", "#F59E0B", "#FDA4AF"],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#E11D48", "#F59E0B", "#FDA4AF"],
          });
        }, 300);

        onRevealed();
      }, 1600);
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
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div className="gift-box-wrapper">
            <div className="gift-box shaking">
              <div className="gift-box-ribbon-v" />
              <div className="gift-box-ribbon-h" />
              <div className="gift-bow" />
            </div>
          </div>
          <h2 style={{ fontSize: "1.5rem", color: "#FFFFFF", marginTop: "1rem" }}>
            🎁 Preparando tu sorpresa...
          </h2>
          <p style={{ color: "var(--color-accent-pink)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Abriendo el sobre secreto...
          </p>
        </div>
      )}

      {animationStep === "REVEALED" && revealedData && (
        <div className="secret-reveal-card">
          <div style={{ display: "inline-block", marginBottom: "0.5rem" }}>
            <PartyPopper size={42} color="#F59E0B" />
          </div>

          <h3 style={{ fontSize: "1.2rem", color: "var(--color-accent-pink)", fontWeight: 600 }}>
            ❤️ Tu amigo secreto es:
          </h3>

          <div className="friend-name-display">
            {revealedData.receiverName}
          </div>

          {revealedData.receiverNickname && (
            <p style={{ fontSize: "1.1rem", color: "var(--color-accent-gold-light)", fontWeight: 600, marginBottom: "1rem" }}>
              « {revealedData.receiverNickname} »
            </p>
          )}

          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.85rem 1rem",
              background: "rgba(225, 29, 72, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              color: "#FDA4AF",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            <span>🤫 Recuerda mantenerlo en secreto.</span>
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
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(225, 29, 72, 0.2))",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                marginBottom: "0.85rem",
              }}
            >
              <Gift size={28} color="#FDE68A" />
            </div>

            <h1 style={{ fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.4rem" }}>
              ¿Listo para descubrir tu persona? 🎁
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
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
                <option value="">-- Elige quién eres --</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.nickname ? `(${p.nickname})` : ""} {p.drawCompleted ? "✓ (Ya consultado)" : ""}
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
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", color: "var(--color-accent-gold-light)", fontWeight: 600, fontSize: "0.9rem" }}>
                  <Lock size={16} />
                  <span>🔐 Confirma que eres tú</span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="participantPin">
                    Ingresa tu PIN de 4 dígitos creado al registrarte
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
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
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
              <Sparkles size={18} />
              <span>Descubrir mi persona</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
