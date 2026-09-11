import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateEventConfig } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getOrCreateEventConfig();
    const participantCount = await prisma.participant.count();
    const revealedCount = await prisma.participant.count({
      where: { drawCompleted: true },
    });

    // Auto-transicionar a FINISHED si estamos en DRAWING y todos han abierto su resultado
    let currentState = config.state;
    if (
      currentState === "DRAWING" &&
      participantCount > 0 &&
      revealedCount >= participantCount
    ) {
      await prisma.eventConfig.update({
        where: { id: config.id },
        data: { state: "FINISHED" },
      });
      currentState = "FINISHED";
    }

    return NextResponse.json({
      success: true,
      state: currentState,
      title: config.title,
      participantCount,
      revealedCount,
      minParticipantsRequired: 2,
    });
  } catch (error) {
    console.error("Error al obtener estado:", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al obtener el estado." },
      { status: 500 }
    );
  }
}
