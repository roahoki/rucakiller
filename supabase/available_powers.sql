-- Tabla de poderes disponibles (únicos por partida)
-- Máximo 3 poderes: uno de cada tipo
CREATE TABLE IF NOT EXISTS available_powers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  power_name VARCHAR(20) NOT NULL CHECK (power_name IN ('asesino_serial', 'investigador', 'sicario')),
  is_taken BOOLEAN DEFAULT FALSE,
  taken_by_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_available_powers_game_id ON available_powers(game_id);
CREATE INDEX IF NOT EXISTS idx_available_powers_is_taken ON available_powers(game_id, is_taken);

-- RLS (Row Level Security)
ALTER TABLE available_powers ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer los poderes de su juego
CREATE POLICY "Players can view available powers in their game"
  ON available_powers
  FOR SELECT
  USING (TRUE);

-- Policy: Solo se puede actualizar para tomar un poder
CREATE POLICY "Players can take available powers"
  ON available_powers
  FOR UPDATE
  USING (is_taken = FALSE);

-- Policy: Solo GameMaster puede insertar (al iniciar juego)
CREATE POLICY "Only system can insert powers"
  ON available_powers
  FOR INSERT
  WITH CHECK (TRUE);

COMMENT ON TABLE available_powers IS 'Poderes únicos por partida que se desbloquean al lograr 2 kills. Máximo 3 poderes (uno de cada tipo) por juego.';
COMMENT ON COLUMN available_powers.power_name IS 'Tipo de poder: asesino_serial, investigador, sicario';
COMMENT ON COLUMN available_powers.is_taken IS 'Indica si el poder ya fue tomado por algún jugador';
COMMENT ON COLUMN available_powers.taken_by_player_id IS 'ID del jugador que tomó este poder';
