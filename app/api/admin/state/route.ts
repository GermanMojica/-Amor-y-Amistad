import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { getParticipantStats, updateEventState } from "@/lib/dataService";

export const dynamic = "force-dynamic";

const VALID_STATES = ["REGISTRATION", "READY", "DRAWING", "FINISHED"] as const;

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { state } = body;

    if (!state || !VALID_STATES.includes(state)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido proporcionado." },
        { status: 400 }
      );
    }

    if (state === "READY") {
      const stats = await getParticipantStats();
      if (stats.total < 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Se requieren al menos 2 participantes para preparar el sorteo.",
          },
          { status: 400 }
        );
      }
    }

    await updateEventState(state);

    return NextResponse.json({
      success: true,
      state: state,
      message: `Estado actualizado a ${state}.`,
    });
  } catch (error) {
    console.error("Error al actualizar estado (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al actualizar estado." },
      { status: 500 }
    );
  }
}
