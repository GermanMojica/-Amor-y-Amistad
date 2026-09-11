import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth, getOrCreateEventConfig } from "@/lib/auth";

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

    const config = await getOrCreateEventConfig();

    // Validar transiciones de estado
    if (state === "READY") {
      const count = await prisma.participant.count();
      if (count < 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Se requieren al menos 2 participantes para preparar el sorteo.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.eventConfig.update({
      where: { id: config.id },
      data: { state },
    });

    return NextResponse.json({
      success: true,
      state: updated.state,
      message: `Estado actualizado a ${updated.state}.`,
    });
  } catch (error) {
    console.error("Error al actualizar estado (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al actualizar estado." },
      { status: 500 }
    );
  }
}
