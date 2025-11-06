import { supabase } from '@/lib/supabase';

/**
 * Test de conexión a Supabase
 * Intenta obtener las tablas y verificar que la conexión funciona
 */
export async function testSupabaseConnection() {
  try {
    // Intentar hacer una query simple
    const { data, error } = await supabase.from('games').select('count');
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (err) {
    console.error('❌ Error inesperado:', err);
    return false;
  }
}
