// Tipos para las tablas de Supabase
export interface Game {
  id: string;
  code: string;
  status: 'lobby' | 'assigning' | 'active' | 'paused' | 'finished';
  game_master_id: string;
  game_master_pin: string | null; // PIN hasheado del GameMaster
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  is_alive: boolean;
  is_game_master: boolean;
  special_character: 'espia' | 'detective' | 'saboteador' | null;
  special_character_used: boolean;
  power_2kills: 'asesino_serial' | 'investigador' | 'sicario' | null;
  power_2kills_used: boolean;
  kill_count: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  game_id: string;
  hunter_id: string;
  target_id: string;
  location: string;
  weapon: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  game_id: string;
  name: string;
  created_at: string;
}

export interface Weapon {
  id: string;
  game_id: string;
  name: string;
  is_available: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  game_id: string;
  event_type: 'kill' | 'failed_attempt' | 'power_used' | 'special_used' | 'eliminated_by_gm';
  killer_id: string | null;
  victim_id: string | null;
  location: string | null;
  weapon: string | null;
  confirmed: boolean;
  photo_url: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  game_id: string;
  player_id: string | null;
  type: 'public' | 'private';
  message: string;
  read: boolean;
  created_at: string;
}

export interface AvailablePower {
  id: string;
  game_id: string;
  power_name: 'asesino_serial' | 'investigador' | 'sicario';
  is_taken: boolean;
  taken_by_player_id: string | null;
  created_at: string;
}
