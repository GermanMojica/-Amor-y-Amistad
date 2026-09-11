import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth, getOrCreateEventConfig } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const config = await getOrCreateEventConfig();

    // Resetear todo de forma atómica
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar asignaciones
      await tx.drawAssignment.deleteMany();

      // 2. Resetear estados de sorteo de participantes
      await tx.participant.updateMany({
        data: {
          drawCompleted: false,
          revealedAt: null,
        },
      });

      // 3. Devolver el evento a estado REGISTRATION
      await tx.eventConfig.update({
        where: { id: config.id },
        data: { state: "REGISTRATION" },
      });
    });

    const participantCount = await prisma.participant.count();

    return NextResponse.json({
      success: true,
      message: "Sorteo reiniciado correctamente. Las asignaciones fueron eliminadas.",
      state: "REGISTRATION",
      participantCount,
    });
  } catch (error) {
    console.error("Error al reiniciar sorteo (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al reiniciar el sorteo." },
      { status: 500 }
    );
  }
}
