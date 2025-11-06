/**
 * Genera un código único de 6 caracteres alfanuméricos
 * Formato: ABC123 (mayúsculas y números)
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Verifica si un código ya existe en la base de datos
 */
export async function isCodeUnique(code: string, checkFunction: (code: string) => Promise<boolean>): Promise<boolean> {
  return await checkFunction(code);
}
