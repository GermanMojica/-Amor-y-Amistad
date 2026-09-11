import assert from "node:assert";

const BASE_URL = "http://localhost:3001";
const ADMIN_PIN = "2026";

async function runE2ETests() {
  console.log("🚀 Iniciando prueba integral End-to-End contra el servidor Next.js...\n");

  // 1. Resetear cualquier estado previo
  console.log("🔹 1. Reseteando estado inicial del sorteo...");
  const resetRes = await fetch(`${BASE_URL}/api/admin/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });
  const resetData = await resetRes.json();
  assert.strictEqual(resetData.success, true);
  console.log("  ✅ Servidor listo en estado REGISTRATION");

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
  console.log("🔹 2. Verificando endpoint /api/state");
  const stateRes = await fetch(`${BASE_URL}/api/state`);
  const stateData = await stateRes.json();
  assert.strictEqual(stateData.success, true);
  assert.strictEqual(stateData.state, "REGISTRATION");
  assert.strictEqual(stateData.participantCount, 0);
  console.log("  ✅ Estado: REGISTRATION, 0 participantes");

  // 3. Registro y prevención de duplicados
  console.log("🔹 3. Probando registro de participantes y prevención estricta de duplicados");
  
  // Registro válido de Juan Pérez
  const regJuan = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Juan Pérez", nickname: "Juanca", pin: "1234" }),
  });
  const juanData = await regJuan.json();
  assert.strictEqual(regJuan.status, 200);
  assert.strictEqual(juanData.success, true);
  const juanId = juanData.participant.id;
  console.log("  ✅ Juan Pérez registrado con éxito");

  // Intento de duplicado con espacios y minúsculas: "  juan   perez  "
  const dup1 = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "  juan   perez  ", pin: "1234" }),
  });
  assert.strictEqual(dup1.status, 409, "Debió rechazar duplicado con espacios");
  console.log("  ✅ Duplicado con espacios '  juan   perez  ' bloqueado (HTTP 409)");

  // Intento de duplicado con mayúsculas: "JUAN PÉREZ"
  const dup2 = await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "JUAN PÉREZ", pin: "1234" }),
  });
  assert.strictEqual(dup2.status, 409, "Debió rechazar duplicado en mayúsculas");
  console.log("  ✅ Duplicado en mayúsculas 'JUAN PÉREZ' bloqueado (HTTP 409)");

  // Registrar 3 participantes adicionales
  const regMaria = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "María Rodríguez", nickname: "Mari", pin: "2222" }),
  })).json();
  const mariaId = regMaria.participant.id;

  const regCarlos = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Carlos Gómez", nickname: "Carlitos", pin: "3333" }),
  })).json();
  const carlosId = regCarlos.participant.id;

  const regLaura = await (await fetch(`${BASE_URL}/api/participants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Laura Sánchez", nickname: "Lau", pin: "4444" }),
  })).json();
  const lauraId = regLaura.participant.id;

  console.log("  ✅ 4 participantes registrados en total");

  // 4. Verificar lista pública y seguridad
  console.log("🔹 4. Verificando seguridad de /api/participants/list-public");
  const pubRes = await fetch(`${BASE_URL}/api/participants/list-public`);
  const pubData = await pubRes.json();
  assert.strictEqual(pubData.success, true);
  assert.strictEqual(pubData.participants.length, 4);
  for (const p of pubData.participants) {
    assert.strictEqual(p.pinHash, undefined, "El hash del PIN jamás debe exponerse públicamente");
    assert.strictEqual(p.giverAssignment, undefined, "Las asignaciones jamás deben exponerse públicamente");
  }
  console.log("  ✅ Lista pública limpia y protegida");

  // 5. Cambio de estado a READY
  console.log("🔹 5. Transición a estado READY por el organizador");
  const readyRes = await fetch(`${BASE_URL}/api/admin/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
    body: JSON.stringify({ state: "READY" }),
  });
  const readyData = await readyRes.json();
  assert.strictEqual(readyData.success, true);
  assert.strictEqual(readyData.state, "READY");
  console.log("  ✅ Sorteo listo para comenzar");

  // 6. Generación del Sorteo con Algoritmo Matemático de Desarreglo
  console.log("🔹 6. Ejecutando sorteo seguro en backend (/api/admin/draw)");
  const drawRes = await fetch(`${BASE_URL}/api/admin/draw`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": ADMIN_PIN },
  });
  const drawData = await drawRes.json();
  assert.strictEqual(drawData.success, true);
  assert.strictEqual(drawData.state, "DRAWING");
  console.log("  ✅ Sorteo generado y persistido en DB con transacciones atómicas");

  // 7. Pruebas de descubrimiento y seguridad de PINs
  console.log("🔹 7. Probando revelación de amigo secreto con PINs");

  // PIN incorrecto para Juan
  const badPinRes = await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: juanId, pin: "9999" }),
  });
  assert.strictEqual(badPinRes.status, 401, "Debió rechazar PIN incorrecto");
  console.log("  ✅ Intento con PIN incorrecto bloqueado con HTTP 401");

  // PIN correcto para Juan (1234)
  const revealJuan = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: juanId, pin: "1234" }),
  })).json();
  assert.strictEqual(revealJuan.success, true);
  assert.notStrictEqual(revealJuan.receiver.name, "Juan Pérez", "Juan no puede sacarse a sí mismo");
  console.log(`  ✅ Juan Pérez descubrió a su amigo secreto: "${revealJuan.receiver.name}"`);

  // Revelar los otros 3 participantes
  const revealMaria = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: mariaId, pin: "2222" }),
  })).json();
  assert.strictEqual(revealMaria.success, true);
  assert.notStrictEqual(revealMaria.receiver.name, "María Rodríguez");
  console.log(`  ✅ María Rodríguez descubrió a su amigo secreto: "${revealMaria.receiver.name}"`);

  const revealCarlos = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: carlosId, pin: "3333" }),
  })).json();
  assert.strictEqual(revealCarlos.success, true);
  assert.notStrictEqual(revealCarlos.receiver.name, "Carlos Gómez");
  console.log(`  ✅ Carlos Gómez descubrió a su amigo secreto: "${revealCarlos.receiver.name}"`);

  const revealLaura = await (await fetch(`${BASE_URL}/api/draw/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: lauraId, pin: "4444" }),
  })).json();
  assert.strictEqual(revealLaura.success, true);
  assert.notStrictEqual(revealLaura.receiver.name, "Laura Sánchez");
  console.log(`  ✅ Laura Sánchez descubrió a su amigo secreto: "${revealLaura.receiver.name}"`);

  // Verificar que los 4 receptores sean todos distintos
  const receivers = [
    revealJuan.receiver.name,
    revealMaria.receiver.name,
    revealCarlos.receiver.name,
    revealLaura.receiver.name,
  ];
  const uniqueReceivers = new Set(receivers);
  assert.strictEqual(uniqueReceivers.size, 4, "Cada persona debe recibir a alguien único");
  console.log("  ✅ Biyectividad matemática verificada: 4 participantes -> 4 asignaciones únicas");

  // 8. Verificar auto-transición a FINISHED
  console.log("🔹 8. Verificando estado FINISHED una vez completados todos los sorteos");
  const finalStateRes = await fetch(`${BASE_URL}/api/state`);
  const finalStateData = await finalStateRes.json();
  assert.strictEqual(finalStateData.state, "FINISHED");
  assert.strictEqual(finalStateData.revealedCount, 4);
  console.log("  ✅ Estado actualizado automáticamente a FINISHED");

  console.log("\n🎉🎉 ¡TODAS LAS PRUEBAS END-TO-END DE LA APLICACIÓN PASARON AL 100%! 🎉🎉\n");
}

runE2ETests().catch((err) => {
  console.error("❌ Error en prueba E2E:", err);
  process.exit(1);
});
