-- Función para incrementar el kill_count de un jugador
CREATE OR REPLACE FUNCTION increment_kill_count(player_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE players
  SET kill_count = kill_count + 1
  WHERE id = player_id;
END;
$$;

-- Comentarios
COMMENT ON FUNCTION increment_kill_count(UUID) IS 'Incrementa el contador de asesinatos de un jugador';
