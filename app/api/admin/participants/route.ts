import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import {
  getOrCreateConfig,
  getAdminParticipantsList,
  deleteParticipantById,
  getParticipantStats,
} from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const participants = await getAdminParticipantsList();

    return NextResponse.json({
      success: true,
      participants,
    });
  } catch (error) {
    console.error("Error al obtener participantes (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al obtener participantes." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const config = await getOrCreateConfig();
    if (config.state === "DRAWING" || config.state === "FINISHED") {
      return NextResponse.json(
        {
          success: false,
          error: "No se pueden eliminar participantes una vez generado el sorteo. Reinicia el sorteo primero.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: "ID de participante requerido." },
        { status: 400 }
      );
    }

    await deleteParticipantById(participantId);
    const stats = await getParticipantStats();

    return NextResponse.json({
      success: true,
      message: "Participante eliminado correctamente.",
      participantCount: stats.total,
    });
  } catch (error) {
    console.error("Error al eliminar participante (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al eliminar participante." },
      { status: 500 }
    );
  }
}
