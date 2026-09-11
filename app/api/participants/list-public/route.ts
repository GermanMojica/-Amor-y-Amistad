import { NextResponse } from "next/server";
import { getPublicParticipantsList } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const participants = await getPublicParticipantsList();

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
