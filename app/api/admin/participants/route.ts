import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth, getOrCreateEventConfig } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        normalizedName: true,
        drawCompleted: true,
        revealedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

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

    const config = await getOrCreateEventConfig();
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

    await prisma.participant.delete({
      where: { id: participantId },
    });

    const remainingCount = await prisma.participant.count();

    return NextResponse.json({
      success: true,
      message: "Participante eliminado correctamente.",
      participantCount: remainingCount,
    });
  } catch (error) {
    console.error("Error al eliminar participante (admin):", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al eliminar participante." },
      { status: 500 }
    );
  }
}
