import assert from "node:assert";

const BASE_URL = "http://localhost:3001";
const ADMIN_PIN = "2026";

async function runE2ETests() {
  console.log("[INFO] Iniciando prueba integral End-to-End para Sorteo de Amigo Secreto con Email/Usuario...\n");

  // 1. Resetear cualquier estado previo
  console.log("[PASO 1] Reseteando estado inicial del sorteo...");
  const resetRes = await fetch(`${BASE_URL}/api/admin/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });
  const resetData = await resetRes.json();
  assert.strictEqual(resetData.success, true);
  console.log("  [OK] Servidor listo en estado REGISTRATION");

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

  // 2. Comprobar /api/state
  console.log("[PASO 2] Verificando endpoint /api/state");
  const stateRes = await fetch(`${BASE_URL}/api/state`);
  const stateData = await stateRes.json();
  assert.strictEqual(stateData.success, true);
  assert.strictEqual(stateData.state, "REGISTRATION");
  assert.strictEqual(stateData.participantCount, 0);
  console.log("  [OK] Estado: REGISTRATION, 0 participantes");

  // 3. Registro con email/usuario y notas de regalo
  console.log("[PASO 3] Probando registro con correo/usuario, notas y control de duplicados");
  
  // Registro de Juan Pérez con su email
  const regJuan = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Juan Pérez",
      email: "juan@correo.com",
      giftNotes: "Me gusta el chocolate oscuro y el cafe. No me gustan los dulces acidos.",
      pin: "1234",
    }),
  });
  const juanData = await regJuan.json();
  assert.strictEqual(regJuan.status, 200);
  assert.strictEqual(juanData.success, true);
  console.log("  [OK] Juan Pérez registrado con email 'juan@correo.com'");

  // Intento de duplicado por email
  const dupEmail = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Juan Diferente",
      email: "  JUAN@correo.com ",
      pin: "1234",
    }),
  });
  assert.strictEqual(dupEmail.status, 409);
  console.log("  [OK] Duplicado de email bloqueado correctamente (HTTP 409)");

  // Registrar 3 participantes adicionales
  await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "María Rodríguez",
      email: "maria@correo.com",
      giftNotes: "Me encantan las tazas de ceramica y libros de misterio.",
      pin: "2222",
    }),
  })).json();

  await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Carlos Gómez",
      email: "carlos_g",
      giftNotes: "Gorra deportiva, medias divertidas. Talla L.",
      pin: "3333",
    }),
  })).json();

  await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Laura Sánchez",
      email: "lauras",
      giftNotes: "Velas aromaticas de vainilla y termos de agua.",
      pin: "4444",
    }),
  })).json();

  console.log("  [OK] 4 participantes registrados con sus usuarios y pistas");

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

  // 5. Revelación ingresando Email/Usuario y PIN
  console.log("[PASO 5] Probando revelacion ingresando Correo/Usuario y PIN");
  
  // Juan ingresa con su email
  const revealJuan = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "juan@correo.com", pin: "1234" }),
  })).json();
  assert.strictEqual(revealJuan.success, true);
  assert.notStrictEqual(revealJuan.receiver.name, "Juan Pérez");
  assert.ok(revealJuan.receiver.giftNotes);
  console.log(`  [OK] Juan Pérez consulto por email -> Saco a "${revealJuan.receiver.name}" | Pistas: "${revealJuan.receiver.giftNotes}"`);

  // María consulta por email
  const revealMaria = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "maria@correo.com", pin: "2222" }),
  })).json();
  assert.strictEqual(revealMaria.success, true);
  console.log(`  [OK] María Rodríguez consulto por email -> Saco a "${revealMaria.receiver.name}"`);

  // Carlos consulta por su usuario 'carlos_g'
  const revealCarlos = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "carlos_g", pin: "3333" }),
  })).json();
  assert.strictEqual(revealCarlos.success, true);
  console.log(`  [OK] Carlos Gómez consulto por usuario 'carlos_g' -> Saco a "${revealCarlos.receiver.name}"`);

  // Laura consulta por su usuario 'lauras'
  const revealLaura = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "lauras", pin: "4444" }),
  })).json();
  assert.strictEqual(revealLaura.success, true);
  console.log(`  [OK] Laura Sánchez consulto por usuario 'lauras' -> Saco a "${revealLaura.receiver.name}"`);

  // 6. Verificar finalización
  const finalStateRes = await fetch(`${BASE_URL}/api/state`);
  const finalStateData = await finalStateRes.json();
  assert.strictEqual(finalStateData.state, "FINISHED");
  console.log("  [OK] Estado FINISHED verificado");

  console.log("\n[SUCCESS] Todas las pruebas de Amigo Secreto con Email/Usuario pasaron al 100%.\n");
}

runE2ETests().catch((err) => {
  console.error("[ERROR] Error en prueba E2E:", err);
  process.exit(1);
});
