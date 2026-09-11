import assert from "node:assert";

const BASE_URL = "http://localhost:3001";
const ADMIN_PIN = "2026";

async function runE2ETests() {
  console.log("[INFO] Iniciando prueba integral End-to-End para Sorteo de Amigo Secreto...\n");

  // 1. Resetear cualquier estado previo
  console.log("[PASO 1] Reseteando estado inicial del sorteo...");
  const resetRes = await fetch(`${BASE_URL}/api/admin/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });
  const resetData = await resetRes.json();
  assert.strictEqual(resetData.success, true);
  console.log("  [OK] Servidor listo en estado REGISTRATION");

  // Limpiar participantes creados previamente si los hay
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

  // 2. Comprobar /api/state
  console.log("[PASO 2] Verificando endpoint /api/state");
  const stateRes = await fetch(`${BASE_URL}/api/state`);
  const stateData = await stateRes.json();
  assert.strictEqual(stateData.success, true);
  assert.strictEqual(stateData.state, "REGISTRATION");
  assert.strictEqual(stateData.participantCount, 0);
  console.log("  [OK] Estado: REGISTRATION, 0 participantes");

  // 3. Registro y notas de regalo (giftNotes)
  console.log("[PASO 3] Probando registro con notas de regalo y prevencion de duplicados");
  
  // Registro de Juan Pérez con sus gustos
  const regJuan = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Juan Pérez",
      giftNotes: "Me gusta el chocolate oscuro y el cafe. No me gustan los dulces acidos.",
      pin: "1234",
    }),
  });
  const juanData = await regJuan.json();
  assert.strictEqual(regJuan.status, 200);
  assert.strictEqual(juanData.success, true);
  const juanId = juanData.participant.id;
  console.log("  [OK] Juan Pérez registrado con sus preferencias de regalo");

  // Intento de duplicado
  const dup1 = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "  juan   perez  ", pin: "1234" }),
  });
  assert.strictEqual(dup1.status, 409);
  console.log("  [OK] Duplicado bloqueado correctamente");

  // Registrar 3 participantes adicionales con sus gustos
  const regMaria = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "María Rodríguez",
      giftNotes: "Me encantan las tazas de ceramica y libros de misterio.",
      pin: "2222",
    }),
  })).json();
  const mariaId = regMaria.participant.id;

  const regCarlos = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Carlos Gómez",
      giftNotes: "Gorra deportiva, medias divertidas. Talla L.",
      pin: "3333",
    }),
  })).json();
  const carlosId = regCarlos.participant.id;

  const regLaura = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Laura Sánchez",
      giftNotes: "Velas aromaticas de vainilla y termos de agua.",
      pin: "4444",
    }),
  })).json();
  const lauraId = regLaura.participant.id;

  console.log("  [OK] 4 participantes registrados con sus pistas de regalo");

  // 4. Cambiar a READY y generar sorteo
  console.log("[PASO 4] Transicion a READY y Generacion de Sorteo");
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
  console.log("  [OK] Sorteo generado y persistido en BD");

  // 5. Revelación con PIN y verificación de que el receptor reciba las notas de regalo
  console.log("[PASO 5] Probando revelacion y entrega de pistas de regalo a cada dador");
  
  const revealJuan = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: juanId, pin: "1234" }),
  })).json();
  assert.strictEqual(revealJuan.success, true);
  assert.notStrictEqual(revealJuan.receiver.name, "Juan Pérez");
  assert.ok(revealJuan.receiver.giftNotes, "El dador debe recibir las pistas de regalo de su amigo secreto");
  console.log(`  [OK] Juan Pérez saco a "${revealJuan.receiver.name}" | Pistas: "${revealJuan.receiver.giftNotes}"`);

  const revealMaria = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: mariaId, pin: "2222" }),
  })).json();
  assert.strictEqual(revealMaria.success, true);
  console.log(`  [OK] María Rodríguez saco a "${revealMaria.receiver.name}" | Pistas: "${revealMaria.receiver.giftNotes}"`);

  const revealCarlos = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: carlosId, pin: "3333" }),
  })).json();
  assert.strictEqual(revealCarlos.success, true);
  console.log(`  [OK] Carlos Gómez saco a "${revealCarlos.receiver.name}" | Pistas: "${revealCarlos.receiver.giftNotes}"`);

  const revealLaura = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: lauraId, pin: "4444" }),
  })).json();
  assert.strictEqual(revealLaura.success, true);
  console.log(`  [OK] Laura Sánchez saco a "${revealLaura.receiver.name}" | Pistas: "${revealLaura.receiver.giftNotes}"`);

  // 6. Verificar finalización
  const finalStateRes = await fetch(`${BASE_URL}/api/state`);
  const finalStateData = await finalStateRes.json();
  assert.strictEqual(finalStateData.state, "FINISHED");
  console.log("  [OK] Estado FINISHED verificado");

  console.log("\n[SUCCESS] Todas las pruebas de Amigo Secreto con notas de regalo pasaron al 100%.\n");
}

runE2ETests().catch((err) => {
  console.error("[ERROR] Error en prueba E2E:", err);
  process.exit(1);
});
