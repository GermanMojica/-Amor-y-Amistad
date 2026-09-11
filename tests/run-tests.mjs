import assert from "node:assert";
import { normalizeName, isValidName, isValidPin, formatDisplayName } from "../lib/normalization.ts";
import { generateDerangement, validateDrawAssignments } from "../lib/drawAlgorithm.ts";

console.log("[INFO] Iniciando pruebas unitarias...\n");

// --- TEST 1: Normalización de Nombres ---
console.log("[TEST 1] Normalizacion de nombres y deteccion de duplicados");
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
  assert.strictEqual(norm, tc.expected, `Fallo normalizacion para "${tc.input}" -> esperado: "${tc.expected}", obtenido: "${norm}"`);
}
console.log("  [OK] Normalizacion de cadenas aprobada al 100%");

// --- TEST 2: Validación de Nombres y PINs ---
console.log("[TEST 2] Validacion de nombres y PINs");
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
console.log("  [OK] Validaciones de inputs aprobadas");

// --- TEST 3: Algoritmo de Sorteo (N = 2) ---
console.log("[TEST 3] Sorteo con N = 2");
const participants2 = ["user_1", "user_2"];
const res2 = generateDerangement(participants2);
assert.strictEqual(res2.length, 2);
assert.strictEqual(validateDrawAssignments(participants2, res2).valid, true);
assert.strictEqual(res2[0].giverId, "user_1");
assert.strictEqual(res2[0].receiverId, "user_2");
assert.strictEqual(res2[1].giverId, "user_2");
assert.strictEqual(res2[1].receiverId, "user_1");
console.log("  [OK] Caso N=2 probado y verificado");

// --- TEST 4: Algoritmo de Sorteo con diferentes tamaños (N = 3, 5, 10, 20, 50) ---
console.log("[TEST 4] Sorteo con N = 3, 5, 10, 20, 50");
const sizes = [3, 5, 10, 20, 50];
for (const size of sizes) {
  const pList = Array.from({ length: size }, (_, i) => `p_${i + 1}`);
  const result = generateDerangement(pList);
  const validation = validateDrawAssignments(pList, result);
  assert.strictEqual(validation.valid, true, `Fallo validacion para N=${size}: ${validation.error}`);
  
  // Regla 1: Nadie se saca a sí mismo
  for (const pair of result) {
    assert.notStrictEqual(pair.giverId, pair.receiverId, `Autoasignacion detectada: ${pair.giverId}`);
  }
  
  // Regla 2: Cada participante aparece exactamente una vez como dador
  const givers = new Set(result.map(r => r.giverId));
  assert.strictEqual(givers.size, size);
  
  // Regla 3: Cada participante aparece exactamente una vez como receptor
  const receivers = new Set(result.map(r => r.receiverId));
  assert.strictEqual(receivers.size, size);
}
console.log("  [OK] Tamaños N=3,5,10,20,50 verificados");

// --- TEST 5: Monte Carlo - 1,000 sorteos consecutivos aleatorios ---
console.log("[TEST 5] Monte Carlo: 1,000 sorteos continuos verificando todas las propiedades matematicas");
for (let iter = 0; iter < 1000; iter++) {
  const randomSize = Math.floor(Math.random() * 20) + 2; // de 2 a 21 participantes
  const pList = Array.from({ length: randomSize }, (_, i) => `user_${i}`);
  const result = generateDerangement(pList);
  const val = validateDrawAssignments(pList, result);
  if (!val.valid) {
    throw new Error(`Fallo en iteracion ${iter} con N=${randomSize}: ${val.error}`);
  }
}
console.log("  [OK] 1,000 sorteos generados y validados con 0 colisiones y 0 fallos.");

console.log("\n[SUCCESS] Todas las pruebas matematicas y de negocio pasaron satisfactoriamente.\n");
