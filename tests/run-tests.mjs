import assert from "node:assert";
import { normalizeName, isValidName, isValidPin, formatDisplayName } from "../lib/normalization.ts";
import { generateDerangement, validateDrawAssignments } from "../lib/drawAlgorithm.ts";

console.log("🧪 Iniciando pruebas unitarias...\n");

// --- TEST 1: Normalización de Nombres ---
console.log("🔹 Test 1: Normalización de nombres y detección de duplicados");
const testCases = [
  { input: "Juan Pérez", expected: "juan perez" },
  { input: "  juan   perez  ", expected: "juan perez" },
  { input: "JUAN PÉREZ", expected: "juan perez" },
  { input: "María José", expected: "maria jose" },
  { input: "MARÍA JOSÉ", expected: "maria jose" },
  { input: "  Ángel    García  ", expected: "angel garcia" },
  { input: "Érika", expected: "erika" },
  { input: "Óscar", expected: "oscar" },
  { input: "Úrsula", expected: "ursula" },
];

for (const tc of testCases) {
  const norm = normalizeName(tc.input);
  assert.strictEqual(norm, tc.expected, `Falló normalización para "${tc.input}" -> esperado: "${tc.expected}", obtenido: "${norm}"`);
}
console.log("  ✅ Normalización de cadenas aprobada al 100%");

// --- TEST 2: Validación de Nombres y PINs ---
console.log("🔹 Test 2: Validación de nombres y PINs");
assert.strictEqual(isValidName("").valid, false);
assert.strictEqual(isValidName("   ").valid, false);
assert.strictEqual(isValidName("A").valid, false);
assert.strictEqual(isValidName("Ana Gómez").valid, true);

assert.strictEqual(isValidPin("").valid, false);
assert.strictEqual(isValidPin("123").valid, false);
assert.strictEqual(isValidPin("12345").valid, false);
assert.strictEqual(isValidPin("abcd").valid, false);
assert.strictEqual(isValidPin("1234").valid, true);
assert.strictEqual(isValidPin("0000").valid, true);
console.log("  ✅ Validaciones de inputs aprobadas");

// --- TEST 3: Algoritmo de Sorteo (N = 2) ---
console.log("🔹 Test 3: Sorteo con N = 2");
const participants2 = ["user_1", "user_2"];
const res2 = generateDerangement(participants2);
assert.strictEqual(res2.length, 2);
assert.strictEqual(validateDrawAssignments(participants2, res2).valid, true);
assert.strictEqual(res2[0].giverId, "user_1");
assert.strictEqual(res2[0].receiverId, "user_2");
assert.strictEqual(res2[1].giverId, "user_2");
assert.strictEqual(res2[1].receiverId, "user_1");
console.log("  ✅ Caso N=2 probado y verificado");

// --- TEST 4: Algoritmo de Sorteo con diferentes tamaños (N = 3, 5, 10, 20, 50) ---
console.log("🔹 Test 4: Sorteo con N = 3, 5, 10, 20, 50");
const sizes = [3, 5, 10, 20, 50];
for (const size of sizes) {
  const pList = Array.from({ length: size }, (_, i) => `p_${i + 1}`);
  const result = generateDerangement(pList);
  const validation = validateDrawAssignments(pList, result);
  assert.strictEqual(validation.valid, true, `Falló validación para N=${size}: ${validation.error}`);
  
  // Regla 1: Nadie se saca a sí mismo
  for (const pair of result) {
    assert.notStrictEqual(pair.giverId, pair.receiverId, `Autoasignación detectada: ${pair.giverId}`);
  }
  
  // Regla 2: Cada participante aparece exactamente una vez como dador
  const givers = new Set(result.map(r => r.giverId));
  assert.strictEqual(givers.size, size);
  
  // Regla 3: Cada participante aparece exactamente una vez como receptor
  const receivers = new Set(result.map(r => r.receiverId));
  assert.strictEqual(receivers.size, size);
}
console.log("  ✅ Tamaños N=3,5,10,20,50 verificados");

// --- TEST 5: Monte Carlo - 1,000 sorteos consecutivos aleatorios ---
console.log("🔹 Test 5: Monte Carlo 1,000 sorteos continuos verificando todas las propiedades matemáticas");
for (let iter = 0; iter < 1000; iter++) {
  const randomSize = Math.floor(Math.random() * 20) + 2; // de 2 a 21 participantes
  const pList = Array.from({ length: randomSize }, (_, i) => `user_${i}`);
  const result = generateDerangement(pList);
  const val = validateDrawAssignments(pList, result);
  if (!val.valid) {
    throw new Error(`Fallo en iteración ${iter} con N=${randomSize}: ${val.error}`);
  }
}
console.log("  ✅ 1,000 sorteos generados y validados con 0 colisiones y 0 fallos.");

console.log("\n🎉 ¡TODAS LAS PRUEBAS MATEMÁTICAS Y DE NEGOCIO PASARON SATISFACTORIAMENTE!\n");
