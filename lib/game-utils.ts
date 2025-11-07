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

/**
 * Asigna personajes especiales aleatoriamente a ~30% de los jugadores
 * Los personajes disponibles son: 'espia', 'detective', 'saboteador'
 * 
 * @param playerIds - Array de IDs de jugadores (sin GameMaster)
 * @returns Array de objetos con playerId y personaje asignado
 */
export function assignSpecialCharacters(playerIds: string[]): Array<{ playerId: string; character: 'espia' | 'detective' | 'saboteador' }> {
  if (playerIds.length === 0) return [];
  
  // Calcular cuántos jugadores tendrán personajes (~30% redondeado)
  const numSpecialCharacters = Math.max(1, Math.round(playerIds.length * 0.3));
  
  // Shuffle de jugadores para selección aleatoria (Fisher-Yates)
  const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);
  
  // Seleccionar los primeros N jugadores
  const selectedPlayers = shuffledPlayers.slice(0, numSpecialCharacters);
  
  // Personajes disponibles
  const characters: Array<'espia' | 'detective' | 'saboteador'> = ['espia', 'detective', 'saboteador'];
  
  // Asignar personajes de forma balanceada
  const assignments = selectedPlayers.map((playerId, index) => ({
    playerId,
    character: characters[index % characters.length], // Rotar entre los 3 personajes
  }));
  
  return assignments;
}
