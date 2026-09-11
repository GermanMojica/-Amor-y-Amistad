import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        drawCompleted: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      participants,
    });
  } catch (error) {
    console.error("Error al obtener participantes públicos:", error);
    return NextResponse.json(
      { success: false, error: "Error al cargar la lista de participantes." },
      { status: 500 }
    );
  }
}
