import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { prisma } from "./db";
import { hashSecret } from "./crypto";
import { AssignmentPair } from "./drawAlgorithm";

export interface EventConfigDTO {
  id: number;
  title: string;
  state: "REGISTRATION" | "READY" | "DRAWING" | "FINISHED";
  adminPinHash: string;
}

export interface ParticipantDTO {
  id: string;
  name: string;
  giftNotes: string | null;
  normalizedName: string;
  pinHash: string;
  drawCompleted: boolean;
  revealedAt: string | Date | null;
  createdAt: string | Date;
}

const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || "2026";

/**
 * 1. Obtener o crear configuración global del evento
 */
export async function getOrCreateConfig(): Promise<EventConfigDTO> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("event_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!data || error) {
      const defaultHash = await hashSecret(DEFAULT_ADMIN_PIN);
      const { data: newConfig } = await supabase
        .from("event_config")
        .upsert({
          id: 1,
          title: "Sorteo de Amigo Secreto",
          state: "REGISTRATION",
          admin_pin_hash: defaultHash,
        })
        .select()
        .single();

      return {
        id: newConfig?.id || 1,
        title: newConfig?.title || "Sorteo de Amigo Secreto",
        state: (newConfig?.state || "REGISTRATION") as any,
        adminPinHash: newConfig?.admin_pin_hash || defaultHash,
      };
    }

    return {
      id: data.id,
      title: data.title,
      state: data.state as any,
      adminPinHash: data.admin_pin_hash,
    };
  }

  // Fallback a Prisma
  let config = await prisma.eventConfig.findFirst();
  if (!config) {
    const defaultHash = await hashSecret(DEFAULT_ADMIN_PIN);
    config = await prisma.eventConfig.create({
      data: {
        id: 1,
        title: "Sorteo de Amigo Secreto",
        state: "REGISTRATION",
        adminPinHash: defaultHash,
      },
    });
  }
  return {
    id: config.id,
    title: config.title,
    state: config.state as any,
    adminPinHash: config.adminPinHash,
  };
}

/**
 * 2. Actualizar estado global del evento
 */
export async function updateEventState(
  newState: "REGISTRATION" | "READY" | "DRAWING" | "FINISHED"
) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("event_config")
      .update({
        state: newState,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const config = await getOrCreateConfig();
  return await prisma.eventConfig.update({
    where: { id: config.id },
    data: { state: newState },
  });
}

/**
 * 3. Conteos de participantes
 */
export async function getParticipantStats() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { count: total } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true });
    const { count: revealed } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("draw_completed", true);

    return {
      total: total || 0,
      revealed: revealed || 0,
    };
  }

  const total = await prisma.participant.count();
  const revealed = await prisma.participant.count({
    where: { drawCompleted: true },
  });
  return { total, revealed };
}

/**
 * 4. Buscar participante por nombre normalizado
 */
export async function findParticipantByNormalized(normalizedName: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase
      .from("participants")
      .select("id, name, normalized_name")
      .eq("normalized_name", normalizedName)
      .maybeSingle();
    return data ? { id: data.id, name: data.name } : null;
  }

  return await prisma.participant.findUnique({
    where: { normalizedName },
    select: { id: true, name: true },
  });
}

/**
 * 5. Crear nuevo participante
 */
export async function createNewParticipant(data: {
  id: string;
  name: string;
  giftNotes: string | null;
  normalizedName: string;
  pinHash: string;
}) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data: created, error } = await supabase
      .from("participants")
      .insert({
        id: data.id,
        name: data.name,
        gift_notes: data.giftNotes,
        normalized_name: data.normalizedName,
        pin_hash: data.pinHash,
        draw_completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: created.id,
      name: created.name,
      giftNotes: created.gift_notes,
    };
  }

  const participant = await prisma.participant.create({
    data: {
      id: data.id,
      name: data.name,
      giftNotes: data.giftNotes,
      normalizedName: data.normalizedName,
      pinHash: data.pinHash,
    },
  });

  return {
    id: participant.id,
    name: participant.name,
    giftNotes: participant.giftNotes,
  };
}

/**
 * 6. Lista pública de participantes (para el selector)
 */
export async function getPublicParticipantsList() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("participants")
      .select("id, name, draw_completed")
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      drawCompleted: p.draw_completed,
    }));
  }

  const list = await prisma.participant.findMany({
    select: { id: true, name: true, drawCompleted: true },
    orderBy: { name: "asc" },
  });
  return list;
}

/**
 * 7. Lista completa para el Panel de Administrador
 */
export async function getAdminParticipantsList() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("participants")
      .select("id, name, gift_notes, normalized_name, draw_completed, revealed_at, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      giftNotes: p.gift_notes,
      normalizedName: p.normalized_name,
      drawCompleted: p.draw_completed,
      revealedAt: p.revealed_at,
      createdAt: p.created_at,
    }));
  }

  return await prisma.participant.findMany({
    select: {
      id: true,
      name: true,
      giftNotes: true,
      normalizedName: true,
      drawCompleted: true,
      revealedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * 8. Eliminar participante (Admin)
 */
export async function deleteParticipantById(participantId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);
    if (error) throw error;
    return true;
  }

  await prisma.participant.delete({
    where: { id: participantId },
  });
  return true;
}

/**
 * 9. Obtener participante y su receptor para revelación confidencial
 */
export async function getParticipantWithAssignmentForReveal(participantId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    
    // Obtener participante
    const { data: participant } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .maybeSingle();

    if (!participant) return null;

    // Obtener asignación
    const { data: assignment } = await supabase
      .from("draw_assignments")
      .select("receiver_id")
      .eq("giver_id", participantId)
      .maybeSingle();

    if (!assignment) {
      return {
        id: participant.id,
        name: participant.name,
        pinHash: participant.pin_hash,
        drawCompleted: participant.draw_completed,
        receiver: null,
      };
    }

    // Obtener receptor
    const { data: receiver } = await supabase
      .from("participants")
      .select("id, name, gift_notes")
      .eq("id", assignment.receiver_id)
      .maybeSingle();

    return {
      id: participant.id,
      name: participant.name,
      pinHash: participant.pin_hash,
      drawCompleted: participant.draw_completed,
      receiver: receiver
        ? {
            id: receiver.id,
            name: receiver.name,
            giftNotes: receiver.gift_notes,
          }
        : null,
    };
  }

  const p = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      giverAssignment: {
        include: {
          receiver: {
            select: { id: true, name: true, giftNotes: true },
          },
        },
      },
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    pinHash: p.pinHash,
    drawCompleted: p.drawCompleted,
    receiver: p.giverAssignment?.receiver
      ? {
          id: p.giverAssignment.receiver.id,
          name: p.giverAssignment.receiver.name,
          giftNotes: p.giverAssignment.receiver.giftNotes,
        }
      : null,
  };
}

/**
 * 10. Marcar participante como revelado
 */
export async function markParticipantAsRevealed(participantId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    await supabase
      .from("participants")
      .update({
        draw_completed: true,
        revealed_at: new Date().toISOString(),
      })
      .eq("id", participantId);
    return;
  }

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      drawCompleted: true,
      revealedAt: new Date(),
    },
  });
}

/**
 * 11. Guardar asignaciones del sorteo en DB
 */
export async function persistDrawAssignments(assignments: AssignmentPair[]) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;

    // 1. Limpiar asignaciones previas
    await supabase.from("draw_assignments").delete().neq("id", "none");

    // 2. Resetear draw_completed
    await supabase
      .from("participants")
      .update({ draw_completed: false, revealed_at: null })
      .neq("id", "none");

    // 3. Insertar nuevas asignaciones
    const rows = assignments.map((pair, idx) => ({
      id: `assign_${Date.now()}_${idx}`,
      giver_id: pair.giverId,
      receiver_id: pair.receiverId,
    }));

    const { error: insertError } = await supabase
      .from("draw_assignments")
      .insert(rows);

    if (insertError) throw insertError;

    // 4. Cambiar estado a DRAWING
    await supabase
      .from("event_config")
      .update({ state: "DRAWING", updated_at: new Date().toISOString() })
      .eq("id", 1);

    return;
  }

  const config = await getOrCreateConfig();
  await prisma.$transaction(async (tx) => {
    await tx.drawAssignment.deleteMany();
    await tx.participant.updateMany({
      data: { drawCompleted: false, revealedAt: null },
    });
    for (const pair of assignments) {
      await tx.drawAssignment.create({
        data: {
          giverId: pair.giverId,
          receiverId: pair.receiverId,
        },
      });
    }
    await tx.eventConfig.update({
      where: { id: config.id },
      data: { state: "DRAWING" },
    });
  });
}

/**
 * 12. Reiniciar sorteo
 */
export async function resetDrawData() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    await supabase.from("draw_assignments").delete().neq("id", "none");
    await supabase
      .from("participants")
      .update({ draw_completed: false, revealed_at: null })
      .neq("id", "none");
    await supabase
      .from("event_config")
      .update({ state: "REGISTRATION", updated_at: new Date().toISOString() })
      .eq("id", 1);
    return;
  }

  const config = await getOrCreateConfig();
  await prisma.$transaction(async (tx) => {
    await tx.drawAssignment.deleteMany();
    await tx.participant.updateMany({
      data: { drawCompleted: false, revealedAt: null },
    });
    await tx.eventConfig.update({
      where: { id: config.id },
      data: { state: "REGISTRATION" },
    });
  });
}
