import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { resetDrawData, getParticipantStats } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    await resetDrawData();
    const stats = await getParticipantStats();

    return NextResponse.json({
      success: true,
      message: "Sorteo reiniciado correctamente. Las asignaciones fueron eliminadas.",
      state: "REGISTRATION",
      participantCount: stats.total,
    });
  } catch (error) {
    console.error("Error al reiniciar sorteo (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al reiniciar el sorteo." },
      { status: 500 }
    );
  }
}
