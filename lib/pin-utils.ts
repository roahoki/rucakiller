/**
 * Utilidades para manejo de PIN del GameMaster
 */

/**
 * Hashea un PIN usando el Web Crypto API
 * @param pin - PIN en texto plano (4-6 dígitos)
 * @returns PIN hasheado en formato hexadecimal
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifica si un PIN coincide con el hash almacenado
 * @param pin - PIN en texto plano
 * @param hashedPin - PIN hasheado almacenado en DB
 * @returns true si coinciden
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const inputHash = await hashPin(pin);
  return inputHash === hashedPin;
}

/**
 * Valida formato del PIN
 * @param pin - PIN a validar
 * @returns true si el PIN es válido (4-6 dígitos numéricos)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
