"use client";

import React, { useState } from "react";
import { Gift, Sparkles, CheckCircle2, AlertCircle, Info, KeyRound } from "lucide-react";
import { isValidName, isValidPin } from "@/lib/normalization";
import confetti from "canvas-confetti";

interface RegistrationViewProps {
  participantCount: number;
  onParticipantRegistered: () => void;
}

export default function RegistrationView({
  participantCount,
  onParticipantRegistered,
}: RegistrationViewProps) {
  const [name, setName] = useState("");
  const [giftNotes, setGiftNotes] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    giftNotes?: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validación Frontend
    const nameCheck = isValidName(name);
    if (!nameCheck.valid) {
      setErrorMessage(nameCheck.error || "Por favor ingresa un nombre válido.");
      return;
    }

    const pinCheck = isValidPin(pin);
    if (!pinCheck.valid) {
      setErrorMessage(pinCheck.error || "El PIN debe tener 4 dígitos numéricos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/participants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          giftNotes: giftNotes.trim() || undefined,
          pin: pin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "No se pudo completar el registro.");
        setLoading(false);
        return;
      }

      // Celebración con confeti sutil
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#E11D48", "#6366F1", "#FDA4AF", "#FFFFFF"],
      });

      setRegisteredUser({
        name: data.participant.name,
        giftNotes: data.participant.giftNotes,
      });

      onParticipantRegistered();
    } catch (err) {
      console.error("Error en registro:", err);
      setErrorMessage("Ocurrió un problema de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setName("");
    setGiftNotes("");
    setPin("");
    setErrorMessage(null);
    setRegisteredUser(null);
  };

  return (
    <div className="glass-card">
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
          Sorteo de Amigo Secreto
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
          Regístrate para participar en el sorteo.
        </p>
      </div>

      {registeredUser ? (
        <div style={{ textAlign: "center", animation: "slideUp 0.3s ease-out" }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <CheckCircle2
              size={44}
              color="#34D399"
              style={{ margin: "0 auto 0.75rem auto", display: "block" }}
            />
            <h2 style={{ fontSize: "1.3rem", color: "#FFFFFF", marginBottom: "0.4rem" }}>
              Registro completado con éxito
            </h2>
            <p style={{ fontSize: "1.15rem", fontWeight: "700", color: "#F8FAFC" }}>
              {registeredUser.name}
            </p>

            {registeredUser.giftNotes && (
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  color: "#FDA4AF",
                  textAlign: "left",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                  Tus preferencias guardadas:
                </span>
                <p style={{ marginTop: "0.25rem", color: "#F1F5F9", fontStyle: "italic" }}>
                  "{registeredUser.giftNotes}"
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                textAlign: "left",
              }}
            >
              <KeyRound size={16} style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-accent-light)" }} />
              <span>
                <strong>Importante:</strong> Guarda tu PIN de 4 dígitos. Lo necesitarás para consultar a tu amigo secreto una vez que inicie el sorteo.
              </span>
            </div>
          </div>

          <p style={{ fontSize: "0.88rem", color: "var(--color-text-subtle)", marginBottom: "1.5rem" }}>
            El organizador habilitará el sorteo cuando todos los participantes estén registrados.
          </p>

          <button
            type="button"
            onClick={handleRegisterAnother}
            className="btn-secondary"
          >
            Registrar a otro participante
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Nombre completo <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="giftNotes">
              Preferencias y sugerencias de regalo <span style={{ color: "var(--color-text-subtle)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="giftNotes"
              className="form-input"
              placeholder="Indica qué te gusta, qué no te gusta, tallas, libros, chocolates o preferencias..."
              value={giftNotes}
              onChange={(e) => setGiftNotes(e.target.value)}
              disabled={loading}
              maxLength={300}
              rows={3}
              style={{ resize: "vertical", fontSize: "0.9rem", lineHeight: "1.45" }}
            />
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.78rem",
                color: "var(--color-text-subtle)",
                marginTop: "0.35rem",
              }}
            >
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Solo la persona que te saque en el sorteo podrá leer esta sugerencia.</span>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pin">
              Crea tu PIN personal de 4 dígitos <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-input"
              placeholder="4 dígitos numéricos"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
              }}
              disabled={loading}
              maxLength={4}
              required
            />
            <span
              style={{
                display: "block",
                fontSize: "0.78rem",
                color: "var(--color-text-subtle)",
                marginTop: "0.35rem",
              }}
            >
              Tu PIN personal para descubrir el resultado confidencialmente.
            </span>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim() || pin.length !== 4}
            >
              {loading ? (
                <>Procesando registro...</>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Completar Registro</span>
                </>
              )}
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontSize: "0.85rem",
              color: "var(--color-text-subtle)",
            }}
          >
            {participantCount} {participantCount === 1 ? "participante registrado" : "participantes registrados"}
          </div>
        </form>
      )}
    </div>
  );
}
