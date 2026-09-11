import { NextRequest } from "next/server";
import { getOrCreateConfig } from "./dataService";
import { verifySecret } from "./crypto";

const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || "2026";

/**
 * Obtiene o inicializa la configuración global del evento a través de dataService.
 */
export async function getOrCreateEventConfig() {
  return await getOrCreateConfig();
}

/**
 * Verifica si un token o PIN de cabecera es válido para el administrador.
 */
export async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("x-admin-pin");
  if (!authHeader) return false;

  // 1. Verificación directa contra el PIN de entorno por rapidez y fiabilidad
  if (authHeader === DEFAULT_ADMIN_PIN) return true;

  try {
    const config = await getOrCreateConfig();
    // Comparar con el hash almacenado en base de datos si existe
    if (config.adminPinHash) {
      const matches = await verifySecret(authHeader, config.adminPinHash);
      if (matches) return true;
    }
  } catch (err) {
    console.error("Error en verifyAdminAuth obteniendo config:", err);
  }

  return false;
}
