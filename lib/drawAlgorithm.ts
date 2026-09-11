import crypto from "crypto";

export interface AssignmentPair {
  giverId: string;
  receiverId: string;
}

export interface DrawValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida matemáticamente que las asignaciones cumplan con todas las reglas de Amor y Amistad:
 * 1. N participantes -> N asignaciones.
 * 2. Cada dador es único.
 * 3. Cada receptor es único.
 * 4. Nadie se da a sí mismo (giverId !== receiverId).
 * 5. Todos los participantes están cubiertos.
 */
export function validateDrawAssignments(
  participantIds: string[],
  assignments: AssignmentPair[]
): DrawValidationResult {
  const n = participantIds.length;

  if (n < 2) {
    return {
      valid: false,
      error: "Se requieren al menos 2 participantes para realizar el sorteo.",
    };
  }

  if (assignments.length !== n) {
    return {
      valid: false,
      error: `La cantidad de asignaciones (${assignments.length}) no coincide con los participantes (${n}).`,
    };
  }

  const givers = new Set<string>();
  const receivers = new Set<string>();
  const validParticipantSet = new Set(participantIds);

  for (const { giverId, receiverId } of assignments) {
    if (!validParticipantSet.has(giverId) || !validParticipantSet.has(receiverId)) {
      return {
        valid: false,
        error: "Una asignación contiene un participante no reconocido.",
      };
    }

    if (giverId === receiverId) {
      return {
        valid: false,
        error: `Regla violada: El participante ${giverId} se asignó a sí mismo.`,
      };
    }

    if (givers.has(giverId)) {
      return {
        valid: false,
        error: `Regla violada: El participante ${giverId} da a más de una persona.`,
      };
    }

    if (receivers.has(receiverId)) {
      return {
        valid: false,
        error: `Regla violada: El participante ${receiverId} recibe de más de una persona.`,
      };
    }

    givers.add(giverId);
    receivers.add(receiverId);
  }

  if (givers.size !== n || receivers.size !== n) {
    return {
      valid: false,
      error: "No todos los participantes tienen una asignación única.",
    };
  }

  return { valid: true };
}

/**
 * Algoritmo de Sattolo modificado / Barajado Criptográfico para generar un desarreglo (derangement)
 * perfecto y uniforme. Garantiza ciclo válido donde nadie se obtiene a sí mismo.
 */
export function generateDerangement(participantIds: string[]): AssignmentPair[] {
  const n = participantIds.length;
  if (n < 2) {
    throw new Error("Se requieren mínimo 2 participantes para generar el sorteo.");
  }

  // Si son 2 participantes, necesariamente A -> B y B -> A
  if (n === 2) {
    return [
      { giverId: participantIds[0], receiverId: participantIds[1] },
      { giverId: participantIds[1], receiverId: participantIds[0] },
    ];
  }

  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    // 1. Crear una copia de los IDs y mezclar aleatoriamente con Fisher-Yates criptográfico
    const shuffled = [...participantIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 2. Generar asignación cíclica: shuffled[i] -> shuffled[(i + 1) % n]
    // Al ser un ciclo completo, está matemáticamente garantizado que para n >= 2:
    // shuffled[i] !== shuffled[(i + 1) % n]
    const assignments: AssignmentPair[] = [];
    for (let i = 0; i < n; i++) {
      assignments.push({
        giverId: shuffled[i],
        receiverId: shuffled[(i + 1) % n],
      });
    }

    // 3. Validación formal
    const validation = validateDrawAssignments(participantIds, assignments);
    if (validation.valid) {
      return assignments;
    }
  }

  throw new Error("No se pudo generar una distribución válida tras múltiples intentos.");
}
