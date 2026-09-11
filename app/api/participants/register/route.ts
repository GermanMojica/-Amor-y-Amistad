import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateEventConfig } from "@/lib/auth";
import { normalizeName, isValidName, isValidPin, formatDisplayName } from "@/lib/normalization";
import { hashSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const config = await getOrCreateEventConfig();

    if (config.state !== "REGISTRATION") {
      return NextResponse.json(
        {
          success: false,
          error: "El registro de participantes está cerrado en este momento.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, nickname, pin } = body;

    // Validación de nombre
    const nameValidation = isValidName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error },
        { status: 400 }
      );
    }

    // Validación de PIN
    const pinValidation = isValidPin(pin);
    if (!pinValidation.valid) {
      return NextResponse.json(
        { success: false, error: pinValidation.error },
        { status: 400 }
      );
    }

    const normalized = normalizeName(name);
    const cleanNickname = nickname && typeof nickname === "string" ? nickname.trim() : null;
    const formattedName = formatDisplayName(name);

    // Verificar si ya existe un participante con el mismo nombre normalizado
    const existing = await prisma.participant.findUnique({
      where: { normalizedName: normalized },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe un participante registrado con el nombre "${existing.name}". Si eres tú, recuerda tu PIN para cuando inicie el sorteo.`,
        },
        { status: 409 }
      );
    }

    // Hashear el PIN del usuario para almacenamiento seguro
    const pinHash = await hashSecret(pin);

    const participant = await prisma.participant.create({
      data: {
        name: formattedName,
        nickname: cleanNickname,
        normalizedName: normalized,
        pinHash,
      },
    });

    const totalCount = await prisma.participant.count();

    return NextResponse.json({
      success: true,
      message: "¡Ya estás dentro del sorteo! ❤️",
      participant: {
        id: participant.id,
        name: participant.name,
        nickname: participant.nickname,
      },
      participantCount: totalCount,
    });
  } catch (error: any) {
    console.error("Error al registrar participante:", error);
    // Control de colisión única a nivel de base de datos
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Este nombre ya se encuentra registrado en el sorteo.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Error de servidor al procesar el registro." },
      { status: 500 }
    );
  }
}
