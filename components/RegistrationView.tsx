"use client";

import React, { useState } from "react";
import { Heart, UserCheck, AlertCircle, Sparkles, CheckCircle2, LockKeyhole } from "lucide-react";
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
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    nickname?: string | null;
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
      setErrorMessage(pinCheck.error || "El PIN debe tener 4 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/participants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          pin: pin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "No se pudo completar el registro.");
        setLoading(false);
        return;
      }

      // Celebración con confeti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E11D48", "#FDA4AF", "#F59E0B", "#FFFFFF"],
      });

      setRegisteredUser({
        name: data.participant.name,
        nickname: data.participant.nickname,
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
    setNickname("");
    setPin("");
    setErrorMessage(null);
    setRegisteredUser(null);
  };

  return (
    <div className="glass-card">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(225, 29, 72, 0.2), rgba(245, 158, 11, 0.15))",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            marginBottom: "0.85rem",
          }}
        >
          <Heart size={28} color="#FDA4AF" fill="#E11D48" />
        </div>

        <h1 style={{ fontSize: "1.85rem", color: "#FFFFFF", marginBottom: "0.4rem" }}>
          Sorteo de Amor y Amistad ❤️
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
          Regístrate para participar en el sorteo.
        </p>
      </div>

      {registeredUser ? (
        <div style={{ textAlign: "center", animation: "slideUp 0.3s ease-out" }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <CheckCircle2
              size={48}
              color="#34D399"
              style={{ margin: "0 auto 0.75rem auto", display: "block" }}
            />
            <h2 style={{ fontSize: "1.4rem", color: "#FFFFFF", marginBottom: "0.4rem" }}>
              ❤️ ¡Ya estás dentro del sorteo!
            </h2>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-accent-gold-light)" }}>
              {registeredUser.name} {registeredUser.nickname ? `(${registeredUser.nickname})` : ""}
            </p>
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              🔒 <strong>Recuerda tu PIN de 4 dígitos:</strong> Lo necesitarás cuando el organizador active el sorteo para descubrir a tu amigo secreto.
            </div>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--color-text-subtle)", marginBottom: "1.5rem" }}>
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
            <label className="form-label" htmlFor="nickname">
              Apodo o nombre corto <span style={{ color: "var(--color-text-subtle)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              id="nickname"
              type="text"
              className="form-input"
              placeholder="Ej: Juanca"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pin">
              Crea tu PIN secreto de 4 dígitos <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-input"
              placeholder="•••• (4 números)"
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
              🔐 Solo tú conocerás este PIN. Lo usarás para abrir tu sobre secreto.
            </span>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim() || pin.length !== 4}
            >
              {loading ? (
                <>Registrando...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Registrarme</span>
                </>
              )}
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontSize: "0.88rem",
              color: "var(--color-text-subtle)",
            }}
          >
            ❤️ <strong>{participantCount}</strong> {participantCount === 1 ? "participante registrado" : "participantes registrados"}
          </div>
        </form>
      )}
    </div>
  );
}
