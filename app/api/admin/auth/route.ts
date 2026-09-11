import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConfig } from "@/lib/dataService";
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

    const defaultEnvPin = process.env.ADMIN_SECRET_PIN || "2026";

    // 1. Verificación directa con PIN de entorno
    if (pin === defaultEnvPin) {
      return NextResponse.json({
        success: true,
        message: "Autenticación exitosa.",
      });
    }

    // 2. Verificación contra hash de base de datos
    try {
      const config = await getOrCreateConfig();
      if (config.adminPinHash) {
        const isValid = await verifySecret(pin, config.adminPinHash);
        if (isValid) {
          return NextResponse.json({
            success: true,
            message: "Autenticación exitosa.",
          });
        }
      }
    } catch (dbError) {
      console.error("Error consultando config para auth admin:", dbError);
    }

    return NextResponse.json(
      { success: false, error: "PIN de organizador incorrecto." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error en autenticación de admin:", error);
    return NextResponse.json(
      { success: false, error: "Error de servidor en autenticación." },
      { status: 500 }
    );
  }
}
