import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConfig, findParticipantByNormalized, createNewParticipant, getParticipantStats } from "@/lib/dataService";
import { normalizeName, isValidName, isValidPin, formatDisplayName } from "@/lib/normalization";
import { hashSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const config = await getOrCreateConfig();

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
    const { name, giftNotes, pin } = body;

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
    const cleanGiftNotes =
      giftNotes && typeof giftNotes === "string" ? giftNotes.trim().slice(0, 300) : null;
    const formattedName = formatDisplayName(name);

    // Verificar duplicados
    const existing = await findParticipantByNormalized(normalized);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe un participante registrado con el nombre "${existing.name}". Si eres tú, recuerda tu PIN para cuando inicie el sorteo.`,
        },
        { status: 409 }
      );
    }

    // Hashear el PIN
    const pinHash = await hashSecret(pin);
    const participantId = `part_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const participant = await createNewParticipant({
      id: participantId,
      name: formattedName,
      giftNotes: cleanGiftNotes,
      normalizedName: normalized,
      pinHash,
    });

    const stats = await getParticipantStats();

    return NextResponse.json({
      success: true,
      message: "Participante registrado exitosamente.",
      participant: {
        id: participant.id,
        name: participant.name,
        giftNotes: participant.giftNotes,
      },
      participantCount: stats.total,
    });
  } catch (error: any) {
    console.error("Error al registrar participante:", error);
    if (error?.code === "P2002" || error?.message?.includes("duplicate key")) {
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
