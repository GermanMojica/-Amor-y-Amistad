import assert from "node:assert";

const BASE_URL = "http://localhost:3001";
const ADMIN_PIN = "2026";

async function testConcurrency() {
  console.log("[INFO] Iniciando prueba de Concurrencia y Sorteos Simultaneos...\n");

  // Reset
  await fetch(`${BASE_URL}/api/admin/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });

  // Limpiar participantes
  const adminPartRes = await fetch(`${BASE_URL}/api/admin/participants`, {
    headers: { "x-admin-pin": ADMIN_PIN },
  });
  const adminPartData = await adminPartRes.json();
  if (adminPartData.success && adminPartData.participants) {
    for (const p of adminPartData.participants) {
      await fetch(`${BASE_URL}/api/admin/participants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
        body: JSON.stringify({ participantId: p.id }),
      });
    }
  }

  // Registrar 10 participantes con email
  const participants = [];
  for (let i = 1; i <= 10; i++) {
    const res = await fetch(`${BASE_URL}/api/participants/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Participante ${i}`,
        email: `usuario${i}@correo.com`,
        giftNotes: `Preferencia ${i}`,
        pin: `100${i % 10}`,
      }),
    });
    const data = await res.json();
    participants.push({
      id: data.participant.id,
      email: `usuario${i}@correo.com`,
      pin: `100${i % 10}`,
      name: `Participante ${i}`,
    });
  }

  console.log(`  [OK] 10 participantes registrados`);

  // Cambiar a READY y generar sorteo
  await fetch(`${BASE_URL}/api/admin/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
    body: JSON.stringify({ state: "READY" }),
  });

  const drawRes = await fetch(`${BASE_URL}/api/admin/draw`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });
  const drawData = await drawRes.json();
  assert.strictEqual(drawData.success, true);
  console.log(`  [OK] Sorteo generado para los 10 participantes`);

  // Simular 10 descubrimientos EXACTAMENTE al mismo tiempo (Promise.all)
  console.log("  [INFO] Disparando 10 peticiones de consulta simultaneas por email...");
  const revealPromises = participants.map((p) =>
    fetch(`${BASE_URL}/api/draw/reveal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: p.email, pin: p.pin }),
    }).then((res) => res.json())
  );

  const results = await Promise.all(revealPromises);

  // Verificar que todos hayan sido exitosos
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(results[i].success, true, `Fallo consulta concurrente para ${participants[i].name}`);
    assert.ok(results[i].receiver.name, "Debe tener un receptor asignado");
    assert.notStrictEqual(results[i].receiver.name, participants[i].name, "No puede ser autoasignado");
  }

  const receiverNames = results.map((r) => r.receiver.name);
  const uniqueReceivers = new Set(receiverNames);
  assert.strictEqual(uniqueReceivers.size, 10, "Los 10 receptores deben ser distintos bajo alta concurrencia");

  console.log("  [OK] 10 peticiones simultaneas respondieron con exito y asignaciones unicas 100% integras.");
  console.log("\n[SUCCESS] Prueba de concurrencia aprobada exitosamente.\n");
}

testConcurrency().catch((err) => {
  console.error("[ERROR] Error en prueba de concurrencia:", err);
  process.exit(1);
});
