import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

/**
 * Hashea un PIN de 4 dígitos o contraseña de organizador.
 */
export async function hashSecret(secret: string): Promise<string> {
  return await bcrypt.hash(secret.trim(), SALT_ROUNDS);
}

/**
 * Compara un PIN en texto plano contra su hash en base de datos.
 */
export async function verifySecret(plainSecret: string, hashedSecret: string): Promise<boolean> {
  if (!plainSecret || !hashedSecret) return false;
  return await bcrypt.compare(plainSecret.trim(), hashedSecret);
}

/**
 * Genera un número entero criptográficamente aleatorio en el rango [min, max].
 */
export function secureRandomInt(min: number, max: number): number {
  return crypto.randomInt(min, max + 1);
}
