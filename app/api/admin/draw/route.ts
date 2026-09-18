import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import {
  getPublicParticipantsList,
  persistDrawAssignments,
  getAllDrawAssignments,
} from "@/lib/dataService";
import { generateDerangement, validateDrawAssignments } from "@/lib/drawAlgorithm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const assignments = await getAllDrawAssignments();

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error("Error al obtener asignaciones (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al obtener las asignaciones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const participants = await getPublicParticipantsList();

    if (participants.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requieren al menos 2 participantes para realizar el sorteo.",
        },
        { status: 400 }
      );
    }

    const participantIds = participants.map((p) => p.id);

    // Generar desarreglo matemático
    const assignments = generateDerangement(participantIds);

    // Validación formal
    const validation = validateDrawAssignments(participantIds, assignments);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Error al validar el sorteo: ${validation.error}`,
        },
        { status: 500 }
      );
    }

    // Persistir asignaciones
    await persistDrawAssignments(assignments);

    return NextResponse.json({
      success: true,
      message: `Sorteo generado con éxito para ${participants.length} participantes.`,
      state: "DRAWING",
      participantCount: participants.length,
    });
  } catch (error) {
    console.error("Error al generar sorteo (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al generar el sorteo." },
      { status: 500 }
    );
  }
}
