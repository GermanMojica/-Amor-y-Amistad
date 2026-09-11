import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateEventConfig } from "@/lib/auth";
import { verifySecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const config = await getOrCreateEventConfig();

    if (config.state !== "DRAWING" && config.state !== "FINISHED") {
      return NextResponse.json(
        {
          success: false,
          error: "El sorteo aún no está habilitado para descubrir resultados.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { participantId, pin } = body;

    if (!participantId || !pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes seleccionar tu nombre e ingresar tu PIN de seguridad.",
        },
        { status: 400 }
      );
    }

    // Buscar al participante
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        giverAssignment: {
          include: {
            receiver: {
              select: {
                id: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participante no encontrado." },
        { status: 404 }
      );
    }

    // Verificar el PIN del participante
    const isPinValid = await verifySecret(pin, participant.pinHash);
    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          error: "PIN incorrecto. Ingresa el PIN de 4 dígitos que elegiste al registrarte.",
        },
        { status: 401 }
      );
    }

    // Verificar que exista una asignación
    if (!participant.giverAssignment || !participant.giverAssignment.receiver) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró una asignación para este participante. Contacta al organizador.",
        },
        { status: 500 }
      );
    }

    const assignedReceiver = participant.giverAssignment.receiver;

    // Actualizar estado individual si es su primera vez
    if (!participant.drawCompleted) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          drawCompleted: true,
          revealedAt: new Date(),
        },
      });

      // Verificar si todos los participantes ya finalizaron su sorteo
      const unrevealedCount = await prisma.participant.count({
        where: { drawCompleted: false },
      });

      if (unrevealedCount === 0) {
        await prisma.eventConfig.update({
          where: { id: config.id },
          data: { state: "FINISHED" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      receiver: {
        name: assignedReceiver.name,
        nickname: assignedReceiver.nickname,
      },
      message: "❤️ Recuerda mantenerlo en secreto.",
    });
  } catch (error) {
    console.error("Error al revelar asignación:", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor al revelar tu amigo secreto." },
      { status: 500 }
    );
  }
}
