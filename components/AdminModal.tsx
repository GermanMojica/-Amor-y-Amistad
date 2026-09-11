"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Users,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
} from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: "REGISTRATION" | "READY" | "DRAWING" | "FINISHED";
  onStateChange: () => void;
}

interface AdminParticipant {
  id: string;
  name: string;
  nickname: string | null;
  normalizedName: string;
  drawCompleted: boolean;
  revealedAt: string | null;
  createdAt: string;
}

export default function AdminModal({
  isOpen,
  onClose,
  currentState,
  onStateChange,
}: AdminModalProps) {
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Intentar cargar la sesión si ya tenemos el PIN guardado en memoria durante la sesión
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "PIN de organizador incorrecto.");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      loadParticipants(adminPin.trim());
    } catch (err) {
      console.error("Error al autenticar admin:", err);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (pinToUse = adminPin) => {
    try {
      const res = await fetch("/api/admin/participants", {
        headers: { "x-admin-pin": pinToUse },
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error("Error al cargar participantes:", err);
    }
  };

  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al participante "${name}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/participants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({ participantId: id }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Participante "${name}" eliminado.`);
        loadParticipants();
        onStateChange();
      } else {
        setErrorMessage(data.error || "No se pudo eliminar al participante.");
      }
    } catch (err) {
      setErrorMessage("Error al eliminar participante.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateState = async (newState: "REGISTRATION" | "READY") => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/admin/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({ state: newState }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Estado cambiado a ${newState}.`);
        onStateChange();
      } else {
        setErrorMessage(data.error || "No se pudo cambiar el estado.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión al actualizar estado.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDraw = async () => {
    if (participants.length < 2) {
      setErrorMessage("Se requieren mínimo 2 participantes.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/admin/draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        loadParticipants();
        onStateChange();
      } else {
        setErrorMessage(data.error || "No se pudo generar el sorteo.");
      }
    } catch (err) {
      setErrorMessage("Error al generar el sorteo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDraw = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setShowResetConfirm(false);
        loadParticipants();
        onStateChange();
      } else {
        setErrorMessage(data.error || "No se pudo reiniciar el sorteo.");
      }
    } catch (err) {
      setErrorMessage("Error al reiniciar el sorteo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={22} color="#F59E0B" />
            <h2 style={{ fontSize: "1.35rem", color: "#FFFFFF" }}>Panel del Organizador</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ width: "32px", height: "32px" }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pantalla de autenticación inicial */}
        {!isAuthenticated ? (
          <form onSubmit={handleAuth}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Ingresa el PIN de organizador para administrar el sorteo.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="adminPinInput">
                PIN de Organizador
              </label>
              <input
                id="adminPinInput"
                type="password"
                className="form-input"
                placeholder="Ingresa el PIN secreto"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !adminPin.trim()}>
              {loading ? "Verificando..." : "Acceder al Panel"}
            </button>
          </form>
        ) : (
          /* Panel de Control una vez autenticado */
          <div>
            {/* Estado actual & Compartir Link */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>Estado actual:</span>
                <span style={{ fontWeight: 700, color: "var(--color-accent-gold-light)", fontSize: "0.9rem" }}>
                  {currentState}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-secondary"
                style={{ fontSize: "0.85rem", padding: "0.5rem" }}
              >
                {copiedLink ? <Check size={16} color="#34D399" /> : <Share2 size={16} />}
                <span>{copiedLink ? "¡Link copiado al portapapeles!" : "Copiar link público para compartir"}</span>
              </button>
            </div>

            {/* Acciones por Estado */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>
                ACCIONES DE FASE:
              </p>

              {currentState === "REGISTRATION" && (
                <button
                  type="button"
                  onClick={() => handleUpdateState("READY")}
                  className="btn-primary"
                  disabled={loading || participants.length < 2}
                  style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#000" }}
                >
                  <Sparkles size={18} />
                  <span>Cerrar Registro y Pasar a «LISTO» ({participants.length} personas)</span>
                </button>
              )}

              {currentState === "READY" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <button
                    type="button"
                    onClick={handleTriggerDraw}
                    className="btn-primary"
                    disabled={loading || participants.length < 2}
                  >
                    <Play size={18} />
                    <span>🎲 Realizar Sorteo y Habilitar Descubrimiento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateState("REGISTRATION")}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Reabrir Registro de Participantes
                  </button>
                </div>
              )}

              {(currentState === "DRAWING" || currentState === "FINISHED") && (
                <div>
                  {!showResetConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="btn-primary btn-danger"
                      disabled={loading}
                    >
                      <RotateCcw size={18} />
                      <span>Reiniciar Sorteo</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        background: "rgba(159, 18, 57, 0.3)",
                        border: "1px solid rgba(225, 29, 72, 0.5)",
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                        ⚠️ ¿Estás seguro de reiniciar el sorteo?
                      </p>
                      <p style={{ color: "#FDA4AF", fontSize: "0.82rem", marginBottom: "0.85rem" }}>
                        Esta acción eliminará todas las asignaciones secretas actuales y volverá a la fase de registro.
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleResetDraw}
                          className="btn-primary"
                          style={{ flex: 1, background: "#BE123C" }}
                          disabled={loading}
                        >
                          {loading ? "Reiniciando..." : "Sí, Reiniciar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de Participantes */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF" }}>
                  👥 Participantes ({participants.length})
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--color-text-subtle)" }}>
                  {participants.filter((p) => p.drawCompleted).length} ya descubrieron su amigo
                </span>
              </div>

              {participants.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)", textAlign: "center", padding: "1.5rem" }}>
                  No hay participantes registrados todavía.
                </p>
              ) : (
                <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.85rem",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "0.9rem" }}>
                          {p.name} {p.nickname ? `(${p.nickname})` : ""}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: p.drawCompleted ? "#34D399" : "var(--color-text-subtle)" }}>
                          {p.drawCompleted ? "✓ Descubrió su resultado" : "⏳ Pendiente"}
                        </p>
                      </div>

                      {currentState === "REGISTRATION" || currentState === "READY" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteParticipant(p.id, p.name)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FDA4AF",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                          title="Eliminar participante"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
