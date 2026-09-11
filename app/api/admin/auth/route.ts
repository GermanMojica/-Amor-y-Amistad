import { NextRequest, NextResponse } from "next/server";
import { getOrCreateEventConfig } from "@/lib/auth";
import { verifySecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Debes ingresar el PIN del organizador." },
        { status: 400 }
      );
    }

    const config = await getOrCreateEventConfig();
    const defaultEnvPin = process.env.ADMIN_SECRET_PIN || "2026";

    let isValid = false;
    if (config.adminPinHash) {
      isValid = await verifySecret(pin, config.adminPinHash);
    }
    if (!isValid && pin === defaultEnvPin) {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "PIN de organizador incorrecto." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa.",
    });
  } catch (error) {
    console.error("Error en autenticación de admin:", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor en autenticación." },
      { status: 500 }
    );
  }
}
