import { NextResponse } from "next/server";
import { getOrCreateConfig, getParticipantStats, updateEventState } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getOrCreateConfig();
    const stats = await getParticipantStats();

    let currentState = config.state;
    if (
      currentState === "DRAWING" &&
      stats.total > 0 &&
      stats.revealed >= stats.total
    ) {
      await updateEventState("FINISHED");
      currentState = "FINISHED";
    }

    return NextResponse.json({
      success: true,
      state: currentState,
      title: config.title,
      participantCount: stats.total,
      revealedCount: stats.revealed,
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
