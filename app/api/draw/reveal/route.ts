import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateConfig,
  getParticipantWithAssignmentForReveal,
  markParticipantAsRevealed,
  getParticipantStats,
  updateEventState,
} from "@/lib/dataService";
import { verifySecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const config = await getOrCreateConfig();

    if (config.state !== "DRAWING" && config.state !== "FINISHED") {
      return NextResponse.json(
        {
          success: false,
          error: "El sorteo aún no está habilitado para descubrir resultados.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { participantId, pin } = body;

    if (!participantId || !pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes seleccionar tu nombre e ingresar tu PIN de seguridad.",
        },
        { status: 400 }
      );
    }

    // Buscar al participante y su asignación
    const participant = await getParticipantWithAssignmentForReveal(participantId);

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participante no encontrado." },
        { status: 404 }
      );
    }

    // Verificar PIN
    const isPinValid = await verifySecret(pin, participant.pinHash);
    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          error: "PIN incorrecto. Ingresa el PIN de 4 dígitos que elegiste al registrarte.",
        },
        { status: 401 }
      );
    }

    if (!participant.receiver) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró una asignación para este participante. Contacta al organizador.",
        },
        { status: 500 }
      );
    }

    // Actualizar estado si es su primera vez
    if (!participant.drawCompleted) {
      await markParticipantAsRevealed(participant.id);

      const stats = await getParticipantStats();
      if (stats.total > 0 && stats.revealed >= stats.total) {
        await updateEventState("FINISHED");
      }
    }

    return NextResponse.json({
      success: true,
      receiver: {
        name: participant.receiver.name,
        giftNotes: participant.receiver.giftNotes,
      },
      message: "Recuerda mantener el resultado en confidencialidad.",
    });
  } catch (error) {
    console.error("Error al revelar asignación:", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al revelar tu amigo secreto." },
      { status: 500 }
    );
  }
}
