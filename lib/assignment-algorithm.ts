/**
 * Algoritmo de Asignación Circular para RucaKiller
 * Crea una cadena perfecta donde cada jugador tiene un objetivo y un cazador
 */

import type { Player, Location, Weapon } from '@/lib/types';

interface Assignment {
  hunter_id: string;
  target_id: string;
  location: string;
  weapon: string;
  is_active: boolean;
}

/**
 * Genera asignaciones circulares para todos los jugadores
 * @param players - Lista de jugadores (excluyendo GameMaster)
 * @param locations - Lista de lugares disponibles
 * @param weapons - Lista de armas disponibles
 * @returns Array de asignaciones
 */
export function generateCircularAssignments(
  players: Player[],
  locations: Location[],
  weapons: Weapon[]
): Assignment[] {
  // Validaciones
  if (players.length < 2) {
    throw new Error('Se necesitan al menos 2 jugadores');
  }

  if (locations.length < 1) {
    throw new Error('Se necesita al menos 1 lugar');
  }

  if (weapons.length < players.length) {
    throw new Error('No hay suficientes armas para todos los jugadores');
  }

  // 1. Filtrar solo jugadores que NO son GameMaster
  const killers = players.filter(p => !p.is_game_master);

  // 2. Shuffle aleatorio de jugadores (Fisher-Yates)
  const shuffled = [...killers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 3. Shuffle de armas para asignación aleatoria
  const shuffledWeapons = [...weapons];
  for (let i = shuffledWeapons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWeapons[i], shuffledWeapons[j]] = [shuffledWeapons[j], shuffledWeapons[i]];
  }

  // 4. Crear cadena circular
  const assignments: Assignment[] = [];
  
  for (let i = 0; i < shuffled.length; i++) {
    const hunter = shuffled[i];
    const target = shuffled[(i + 1) % shuffled.length]; // El último apunta al primero
    
    // Asignar lugar aleatorio (pueden repetirse)
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Asignar arma única (no pueden repetirse)
    const weapon = shuffledWeapons[i];
    
    assignments.push({
      hunter_id: hunter.id,
      target_id: target.id,
      location: location.name,
      weapon: weapon.name,
      is_active: true,
    });
  }

  return assignments;
}

/**
 * Valida que las asignaciones formen una cadena circular perfecta
 * @param assignments - Array de asignaciones
 * @returns true si es válida
 */
export function validateCircularChain(assignments: Assignment[]): boolean {
  if (assignments.length < 2) return false;

  // Crear mapa de cazador -> víctima
  const chain = new Map<string, string>();
  assignments.forEach(a => chain.set(a.hunter_id, a.target_id));

  // Seguir la cadena desde el primer jugador
  let current = assignments[0].hunter_id;
  const visited = new Set<string>();

  for (let i = 0; i < assignments.length; i++) {
    if (visited.has(current)) {
      // Ya visitamos este jugador, hay un ciclo prematuro
      return false;
    }
    visited.add(current);
    current = chain.get(current)!;
  }

  // Verificar que volvimos al inicio (cadena circular perfecta)
  return current === assignments[0].hunter_id && visited.size === assignments.length;
}
