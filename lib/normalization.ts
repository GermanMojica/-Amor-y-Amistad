/**
 * Utilidades de normalización de nombres para prevención estricta de duplicados.
 * 
 * Ejemplos:
 * "Juan Pérez" -> "juan perez"
 * "  juan   perez  " -> "juan perez"
 * "JUAN PÉREZ" -> "juan perez"
 * "María José" -> "maria jose"
 */

export function normalizeName(input: string): string {
  if (!input) return "";

  return input
    .trim()
    // Normalizar a forma NFD para separar letras de acentos/diacríticos
    .normalize("NFD")
    // Remover caracteres diacríticos (marcas de acento)
    .replace(/[\u0300-\u036f]/g, "")
    // Convertir a minúsculas
    .toLowerCase()
    // Reemplazar múltiples espacios o tabulaciones por un solo espacio
    .replace(/\s+/g, " ");
}

/**
 * Formatea un nombre para presentación con mayúscula inicial en cada palabra.
 */
export function formatDisplayName(input: string): string {
  if (!input) return "";
  
  const cleaned = input.trim().replace(/\s+/g, " ");
  return cleaned
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Valida si un nombre es apto para el registro (mínimo 2 letras).
 */
export function isValidName(input: string): { valid: boolean; error?: string } {
  const trimmed = input ? input.trim() : "";
  if (!trimmed) {
    return { valid: false, error: "El nombre no puede estar vacío." };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "El nombre no puede exceder los 50 caracteres." };
  }
  // Verificar que tenga al menos un caracter alfanumérico
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed)) {
    return { valid: false, error: "El nombre debe contener letras válidas." };
  }
  return { valid: true };
}

/**
 * Valida un PIN de 4 dígitos.
 */
export function isValidPin(pin: string): { valid: boolean; error?: string } {
  if (!pin) {
    return { valid: false, error: "Debes ingresar un PIN de 4 dígitos." };
  }
  const cleanPin = pin.trim();
  if (!/^\d{4}$/.test(cleanPin)) {
    return { valid: false, error: "El PIN debe constar exactamente de 4 dígitos numéricos." };
  }
  return { valid: true };
}
