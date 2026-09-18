"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
  Info,
  Mail,
  KeyRound,
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
  email: string;
  giftNotes: string | null;
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

  const handleResetPin = async (id: string, name: string) => {
    const newPin = prompt(`Nuevo PIN para "${name}" (4 dígitos):`);
    if (!newPin) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({ participantId: id, newPin }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`PIN de "${name}" restablecido. Comunícaselo de forma segura.`);
      } else {
        setErrorMessage(data.error || "No se pudo restablecer el PIN.");
      }
    } catch (err) {
      setErrorMessage("Error al restablecer el PIN.");
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
        setSuccessMessage(`Estado actualizado a ${newState}.`);
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
            <ShieldCheck size={20} color="#F43F5E" />
            <h2 style={{ fontSize: "1.25rem", color: "#FFFFFF" }}>Panel de Administración</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ width: "32px", height: "32px" }}
          >
            <X size={16} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <form onSubmit={handleAuth}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
              Ingresa el PIN de organizador para gestionar el sorteo.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="adminPinInput">
                PIN de Organizador
              </label>
              <input
                id="adminPinInput"
                type="password"
                className="form-input"
                placeholder="Ingresa el PIN maestro"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !adminPin.trim()}>
              {loading ? "Validando..." : "Ingresar"}
            </button>
          </form>
        ) : (
          <div>
            {/* Estado actual & Compartir */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-subtle)" }}>Estado actual:</span>
                <span style={{ fontWeight: 600, color: "#F8FAFC", fontSize: "0.85rem" }}>
                  {currentState}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-secondary"
                style={{ fontSize: "0.85rem", padding: "0.55rem" }}
              >
                {copiedLink ? <Check size={15} color="#34D399" /> : <Share2 size={15} />}
                <span>{copiedLink ? "Enlace copiado" : "Copiar enlace de acceso público"}</span>
              </button>
            </div>

            {/* Acciones */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Acciones de Fase
              </p>

              {currentState === "REGISTRATION" && (
                <button
                  type="button"
                  onClick={() => handleUpdateState("READY")}
                  className="btn-primary"
                  disabled={loading || participants.length < 2}
                  style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0F172A" }}
                >
                  <Sparkles size={16} />
                  <span>Cerrar Registro y Pasar a «LISTO» ({participants.length})</span>
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
                    <Play size={16} />
                    <span>Realizar Sorteo y Habilitar Consultas</span>
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
                      <RotateCcw size={16} />
                      <span>Reiniciar Sorteo</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        background: "rgba(159, 18, 57, 0.15)",
                        border: "1px solid rgba(225, 29, 72, 0.35)",
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                        Confirmar reinicio de sorteo
                      </p>
                      <p style={{ color: "#FDA4AF", fontSize: "0.8rem", marginBottom: "0.85rem" }}>
                        Esta acción eliminará las asignaciones generadas y devolverá el sorteo a la fase de registro.
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
                          {loading ? "Reiniciando..." : "Confirmar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Participantes */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" }}>
                  Participantes ({participants.length})
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>
                  {participants.filter((p) => p.drawCompleted).length} consultaron su asignación
                </span>
              </div>

              {participants.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-subtle)", textAlign: "center", padding: "1.5rem" }}>
                  No hay participantes registrados todavía.
                </p>
              ) : (
                <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "0.65rem 0.8rem",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "#FFFFFF", fontSize: "0.88rem" }}>
                            {p.name}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-accent-light)" }}>
                            {p.email}
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.72rem", color: p.drawCompleted ? "#34D399" : "var(--color-text-subtle)" }}>
                            {p.drawCompleted ? "Consultado" : "Pendiente"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleResetPin(p.id, p.name)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#FBBF24",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                            title="Restablecer PIN"
                          >
                            <KeyRound size={15} />
                          </button>

                          {currentState === "REGISTRATION" || currentState === "READY" ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(p.id, p.name)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#FDA4AF",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                              title="Eliminar participante"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {p.giftNotes && (
                        <div
                          style={{
                            marginTop: "0.35rem",
                            fontSize: "0.76rem",
                            color: "var(--color-text-muted)",
                            background: "rgba(255,255,255,0.02)",
                            padding: "0.3rem 0.5rem",
                            borderRadius: "4px",
                          }}
                        >
                          <Info size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                          <em>"{p.giftNotes}"</em>
                        </div>
                      )}
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
