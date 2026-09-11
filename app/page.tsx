"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import RegistrationView from "@/components/RegistrationView";
import ReadyView from "@/components/ReadyView";
import DrawingView from "@/components/DrawingView";
import FinishedView from "@/components/FinishedView";
import AdminModal from "@/components/AdminModal";
import { Loader2 } from "lucide-react";

type EventState = "REGISTRATION" | "READY" | "DRAWING" | "FINISHED";

export default function HomePage() {
  const [state, setState] = useState<EventState>("REGISTRATION");
  const [participantCount, setParticipantCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setParticipantCount(data.participantCount);
        setRevealedCount(data.revealedCount);
      }
    } catch (error) {
      console.error("Error al obtener el estado:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    // Sondeo suave cada 10 segundos para mantener sincronizados a los participantes
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [fetchState]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "1rem",
        }}
      >
        <Loader2
          size={36}
          color="#E11D48"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
          Cargando sorteo...
        </p>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <Header
        state={state}
        participantCount={participantCount}
        revealedCount={revealedCount}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {state === "REGISTRATION" && (
        <RegistrationView
          participantCount={participantCount}
          onParticipantRegistered={fetchState}
        />
      )}

      {state === "READY" && (
        <ReadyView participantCount={participantCount} />
      )}

      {state === "DRAWING" && (
        <DrawingView onRevealed={fetchState} />
      )}

      {state === "FINISHED" && (
        <FinishedView participantCount={participantCount} />
      )}

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentState={state}
        onStateChange={fetchState}
      />
    </div>
  );
}
