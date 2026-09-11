import { NextRequest } from "next/server";
import { prisma } from "./db";
import { hashSecret, verifySecret } from "./crypto";

const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || "2026";

/**
 * Obtiene o inicializa la configuración global del evento.
 */
export async function getOrCreateEventConfig() {
  let config = await prisma.eventConfig.findFirst();

  if (!config) {
    const defaultHash = await hashSecret(DEFAULT_ADMIN_PIN);
    config = await prisma.eventConfig.create({
      data: {
        id: 1,
        title: "Sorteo de Amor y Amistad ❤️",
        state: "REGISTRATION",
        adminPinHash: defaultHash,
      },
    });
  }

  return config;
}

/**
 * Verifica si un token o PIN de cabecera es válido para el administrador.
 */
export async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("x-admin-pin");
  if (!authHeader) return false;

  const config = await getOrCreateEventConfig();

  // Comparar con el hash almacenado en base de datos
  if (config.adminPinHash) {
    const matches = await verifySecret(authHeader, config.adminPinHash);
    if (matches) return true;
  }

  // Fallback con la variable de entorno
  return authHeader === DEFAULT_ADMIN_PIN;
}
