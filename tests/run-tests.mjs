import assert from "node:assert";
import { normalizeName, normalizeEmailOrUsername, isValidName, isValidEmailOrUsername, isValidPin, formatDisplayName } from "../lib/normalization.ts";
import { generateDerangement, validateDrawAssignments } from "../lib/drawAlgorithm.ts";

console.log("[INFO] Iniciando pruebas unitarias...\n");

// --- TEST 1: Normalización de Nombres y Emails ---
console.log("[TEST 1] Normalizacion de nombres y emails/usuarios");
assert.strictEqual(normalizeName("Juan Pérez"), "juan perez");
assert.strictEqual(normalizeName("  JUAN   PÉREZ  "), "juan perez");
assert.strictEqual(normalizeEmailOrUsername("  Juan.Perez@Gmail.COM "), "juan.perez@gmail.com");
assert.strictEqual(normalizeEmailOrUsername("  JuanPerez123 "), "juanperez123");
console.log("  [OK] Normalizacion aprobada al 100%");

// --- TEST 2: Validación de Nombres, Emails y PINs ---
console.log("[TEST 2] Validacion de nombres, emails y PINs");
assert.strictEqual(isValidName("").valid, false);
assert.strictEqual(isValidName("A").valid, false);
assert.strictEqual(isValidName("Ana Gómez").valid, true);

assert.strictEqual(isValidEmailOrUsername("").valid, false);
assert.strictEqual(isValidEmailOrUsername("ab").valid, false);
assert.strictEqual(isValidEmailOrUsername("juan@correo.com").valid, true);
assert.strictEqual(isValidEmailOrUsername("juanperez").valid, true);

assert.strictEqual(isValidPin("").valid, false);
assert.strictEqual(isValidPin("123").valid, false);
assert.strictEqual(isValidPin("1234").valid, true);
console.log("  [OK] Validaciones de inputs aprobadas");

// --- TEST 3: Algoritmo de Sorteo (N = 2) ---
console.log("[TEST 3] Sorteo con N = 2");
const participants2 = ["user_1", "user_2"];
const res2 = generateDerangement(participants2);
assert.strictEqual(res2.length, 2);
assert.strictEqual(validateDrawAssignments(participants2, res2).valid, true);
console.log("  [OK] Caso N=2 probado y verificado");

// --- TEST 4: Algoritmo de Sorteo con diferentes tamaños (N = 3, 5, 10, 20, 50) ---
console.log("[TEST 4] Sorteo con N = 3, 5, 10, 20, 50");
const sizes = [3, 5, 10, 20, 50];
for (const size of sizes) {
  const pList = Array.from({ length: size }, (_, i) => `p_${i + 1}`);
  const result = generateDerangement(pList);
  const validation = validateDrawAssignments(pList, result);
  assert.strictEqual(validation.valid, true, `Fallo validacion para N=${size}: ${validation.error}`);
}
console.log("  [OK] Tamaños N=3,5,10,20,50 verificados");

// --- TEST 5: Monte Carlo - 1,000 sorteos continuos ---
console.log("[TEST 5] Monte Carlo: 1,000 sorteos continuos");
for (let iter = 0; iter < 1000; iter++) {
  const randomSize = Math.floor(Math.random() * 20) + 2;
  const pList = Array.from({ length: randomSize }, (_, i) => `user_${i}`);
  const result = generateDerangement(pList);
  const val = validateDrawAssignments(pList, result);
  if (!val.valid) {
    throw new Error(`Fallo en iteracion ${iter} con N=${randomSize}: ${val.error}`);
  }
}
console.log("  [OK] 1,000 sorteos generados y validados con 0 colisiones y 0 fallos.");

console.log("\n[SUCCESS] Todas las pruebas matematicas y de validacion pasaron satisfactoriamente.\n");
