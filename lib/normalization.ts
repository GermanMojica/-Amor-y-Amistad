/**
 * Utilidades de normalización y validación.
 */

export function normalizeName(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Normaliza un correo electrónico o nombre de usuario (sin espacios, en minúsculas).
 */
export function normalizeEmailOrUsername(input: string): string {
  if (!input) return "";
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Formatea un nombre para presentación con mayúscula inicial.
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
  if (trimmed.length > 60) {
    return { valid: false, error: "El nombre no puede exceder los 60 caracteres." };
  }
  return { valid: true };
}

/**
 * Valida un correo electrónico o nombre de usuario.
 */
export function isValidEmailOrUsername(input: string): { valid: boolean; error?: string } {
  const clean = input ? input.trim().toLowerCase() : "";
  if (!clean) {
    return { valid: false, error: "Debes ingresar tu correo electrónico o un nombre de usuario." };
  }
  if (clean.length < 3) {
    return { valid: false, error: "El correo o usuario debe tener al menos 3 caracteres." };
  }
  if (clean.length > 80) {
    return { valid: false, error: "El correo o usuario no puede exceder los 80 caracteres." };
  }
  return { valid: true };
}

/**
 * Valida un PIN o contraseña de acceso (mínimo 4 caracteres).
 */
export function isValidPin(pin: string): { valid: boolean; error?: string } {
  if (!pin) {
    return { valid: false, error: "Debes ingresar un PIN o clave de acceso." };
  }
  const cleanPin = pin.trim();
  if (cleanPin.length < 4) {
    return { valid: false, error: "El PIN o clave debe tener al menos 4 caracteres." };
  }
  return { valid: true };
}
