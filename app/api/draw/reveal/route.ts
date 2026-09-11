import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateConfig,
  getParticipantWithAssignmentByEmailOrId,
  markParticipantAsRevealed,
  getParticipantStats,
  updateEventState,
} from "@/lib/dataService";
import { verifySecret } from "@/lib/crypto";
import { normalizeEmailOrUsername } from "@/lib/normalization";

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
    const { email, identifier, participantId, pin } = body;
    const userLookup = email || identifier || participantId;

    if (!userLookup || !pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes ingresar tu correo o usuario y tu PIN de seguridad.",
        },
        { status: 400 }
      );
    }

    const cleanLookup = normalizeEmailOrUsername(userLookup);

    // Buscar al participante por correo/usuario o id
    const participant = await getParticipantWithAssignmentByEmailOrId(cleanLookup);

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró ningún participante registrado con ese correo o usuario.",
        },
        { status: 404 }
      );
    }

    // Verificar PIN
    const isPinValid = await verifySecret(pin, participant.pinHash);
    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          error: "PIN o clave incorrecta. Ingresa la clave que definiste al registrarte.",
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
