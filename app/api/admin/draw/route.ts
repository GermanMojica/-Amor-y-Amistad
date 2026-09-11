import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth, getOrCreateEventConfig } from "@/lib/auth";
import { generateDerangement, validateDrawAssignments } from "@/lib/drawAlgorithm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const config = await getOrCreateEventConfig();

    // Obtener todos los participantes
    const participants = await prisma.participant.findMany({
      select: { id: true, name: true },
    });

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

    // Generar el desarreglo matemático garantizado
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

    // Guardar atómicamente en la base de datos dentro de una transacción
    await prisma.$transaction(async (tx) => {
      // 1. Limpiar asignaciones previas si existieran
      await tx.drawAssignment.deleteMany();

      // 2. Resetear drawCompleted en participantes
      await tx.participant.updateMany({
        data: {
          drawCompleted: false,
          revealedAt: null,
        },
      });

      // 3. Crear nuevas asignaciones
      for (const pair of assignments) {
        await tx.drawAssignment.create({
          data: {
            giverId: pair.giverId,
            receiverId: pair.receiverId,
          },
        });
      }

      // 4. Actualizar estado a DRAWING
      await tx.eventConfig.update({
        where: { id: config.id },
        data: { state: "DRAWING" },
      });
    });

    return NextResponse.json({
      success: true,
      message: `¡Sorteo generado con éxito para ${participants.length} participantes! 🎁`,
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
