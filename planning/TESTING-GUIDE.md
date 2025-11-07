# 🧪 Guía de Testing - Sistema de Poderes RucaKiller

## 📋 Resumen del Sistema

### ⚡ Personajes Especiales (Asignados al inicio - ~30% de jugadores)
- **Espía**: Ver la víctima de otro jugador (1 uso)
- **Detective**: Ver el arma de otro jugador (1 uso)  
- **Saboteador**: Ver el lugar de otro jugador (1 uso)

### 🔥 Poderes Avanzados (Al llegar a 2 kills - Solo 3 disponibles en total)
- **Asesino Serial**: Asesinar en cualquier lugar, solo necesitas el arma (Pasivo)
- **Investigador**: Ver objetivo COMPLETO de otro jugador (1 uso)
- **Sicario**: Elegir manualmente tu próxima víctima (1 uso)

---

## 🎮 Setup de Testing

### Pre-requisitos
```bash
# 1. Verificar que la BD está actualizada
cd /root/projects/rucakiller

# 2. Ejecutar migraciones de Supabase
# Asegúrate que existe: supabase/available_powers.sql

# 3. Iniciar servidor
npm run dev

# 4. Abrir múltiples ventanas de navegador:
# - Ventana 1: localhost:3000 (GameMaster)
# - Ventanas 2-6: localhost:3000 (Jugadores)
# - Usa modo incógnito o diferentes perfiles
```

---

## 🧪 Suite de Tests

### ✅ TEST 1: Flujo Básico del Juego

**Objetivo**: Verificar que el juego funciona correctamente sin poderes

1. **GameMaster crea partida**
   - Ir a `/`
   - Click "Crear Partida"
   - Ver código de 6 dígitos
   - ✅ Debe redireccionar a `/game/[id]/lobby`

2. **Jugadores se unen**
   - En otra ventana, ir a `/`
   - Click "Unirse a Partida"
   - Ingresar código de partida
   - Ingresar nombre
   - ✅ Debe aparecer en el lobby del GM

3. **Configurar partida (GM)**
   - Agregar al menos 3 ubicaciones
   - Agregar al menos 3 armas
   - ✅ Botón "Iniciar Juego" debe habilitarse

4. **Iniciar juego (GM)**
   - Click "Iniciar Juego"
   - ✅ GM ve dashboard
   - ✅ Jugadores ven su objetivo/lugar/arma
   - ✅ ~30% de jugadores tienen personaje especial

5. **Realizar asesinato básico**
   - Jugador A presiona "He asesinado a [nombre]"
   - ✅ Jugador B (víctima) recibe modal de confirmación
   - Jugador B confirma
   - ✅ Jugador B muere (is_alive = false)
   - ✅ Jugador A recibe nuevo objetivo (herencia)
   - ✅ Notificación pública: "Se ha producido un asesinato"

---

### ✅ TEST 2: Sistema de Selección de Poderes (2 kills)

**Objetivo**: Verificar que el modal de poderes aparece correctamente

**Pasos**:
1. Jugador A asesina a su objetivo → kill_count = 1
2. Víctima confirma
3. Jugador A asesina a su nuevo objetivo → kill_count = 2
4. Víctima confirma

**Verificaciones**:
- ✅ Modal de selección aparece AUTOMÁTICAMENTE
- ✅ Muestra 3 poderes disponibles:
  - Asesino Serial
  - Investigador  
  - Sicario
- ✅ Cada poder muestra:
  - Nombre
  - Descripción
  - CONTRA (desventaja)
- ✅ Todos los poderes están disponibles (ninguno tomado aún)

**Seleccionar poder**:
- Click en "Asesino Serial"
- ✅ Modal se cierra
- ✅ Badge naranja aparece: "⚡ Poder especial: Asesino Serial"
- ✅ En la BD: `power_2kills = 'asesino_serial'`
- ✅ En la BD: `power_2kills_used = false`

---

### ✅ TEST 3: Poder Asesino Serial (Pasivo)

**Objetivo**: Verificar que puedes asesinar sin estar en el lugar correcto

**Setup**: Un jugador debe tener el poder Asesino Serial

**Test del Poder**:
1. Ver tu objetivo en AssignmentCard
2. ✅ Aparece indicador: "⚡ Poder Asesino Serial: No necesitas estar aquí"
3. ✅ Instrucciones dicen: "Con tu poder Asesino Serial, no necesitas estar en [lugar]"
4. Click en "⚔️ He asesinado a [nombre]"
   - **NO** aparece modal pidiendo ubicación/arma
   - Se envía el POST directamente
5. La víctima recibe solicitud de confirmación
6. Víctima confirma
7. ✅ Asesinato exitoso
8. ✅ Heredas nuevo objetivo

**Test del CONTRA**:
1. Otro jugador con poder Asesino Serial te tiene como objetivo
2. Ese jugador te asesina
3. Tú recibes confirmación
4. ✅ El CONTRA también se aplica al cazador (él tampoco necesita ubicación)

---

### ✅ TEST 4: Poder Investigador (Activo)

**Objetivo**: Espiar el objetivo completo de otro jugador

**Setup**: Un jugador debe tener el poder Investigador

**Test del Poder**:
1. En la sección de poderes, ver badge naranja
2. ✅ Botón azul: "🔍 Usar Investigador"
3. Click en el botón
4. ✅ Modal azul aparece con título "🔍 Poder Investigador"
5. ✅ Lista de jugadores vivos (excepto tú)
6. Seleccionar un jugador (ej: "Carlos")
7. Click "🔍 Investigar"
8. ✅ Modal muestra:
   ```
   Jugador investigado: Carlos
   
   Su objetivo completo:
   🎯 Víctima: María
   📍 Lugar: Biblioteca
   🔪 Arma: Cuchillo
   ```

**Notificaciones**:
- ✅ Tú recibes notificación privada con la info completa
- ✅ Carlos recibe: "⚠️ [Tu nombre] ha investigado tu objetivo"
- ✅ Notificación pública: "🔍 Un jugador ha usado el poder de Investigador"

**Post-uso**:
- ✅ El badge muestra "✓ Ya usado"
- ✅ El botón desaparece
- ✅ `power_2kills_used = true` en la BD

**Validaciones** (deben fallar con error):
- ❌ Intentar investigarte a ti mismo
- ❌ Investigar a un jugador muerto
- ❌ Usar el poder dos veces

---

### ✅ TEST 5: Poder Sicario (Activo)

**Objetivo**: Elegir manualmente tu próxima víctima

**Setup**: Un jugador debe tener el poder Sicario

**Test del Poder**:
1. En la sección de poderes, ver badge naranja
2. ✅ Botón morado: "🎯 Usar Sicario"
3. Ver tu objetivo actual (ej: "Pedro")
4. Click en el botón
5. ✅ Modal morado aparece con título "🎯 Poder Sicario"
6. ✅ Lista de jugadores vivos EXCEPTO:
   - Tú mismo
   - Tu objetivo actual (Pedro)
7. Seleccionar nuevo objetivo (ej: "Laura")
8. Click "🎯 Elegir Objetivo"
9. ✅ Modal muestra:
   ```
   Nuevo objetivo asignado: Laura
   📍 Lugar: [Aleatorio]
   🔪 Arma: [Aleatoria]
   
   💡 Tu nuevo objetivo ha recibido una pista del arma
   ```

**Cambios en el juego**:
- ✅ Tu AssignmentCard muestra a Laura como objetivo
- ✅ Lugar y arma son nuevos (diferentes al anterior)
- ✅ Laura recibe: "💀 Alguien te está cazando con: [arma]"

**Notificaciones**:
- ✅ Tú recibes: "🎯 Nuevo objetivo elegido: Laura"
- ✅ Notificación pública: "🎯 Un jugador ha usado el poder de Sicario"

**Post-uso**:
- ✅ El badge muestra "✓ Ya usado"
- ✅ El botón desaparece
- ✅ `power_2kills_used = true` en la BD
- ✅ Tu arma anterior está disponible nuevamente
- ✅ Tu nueva arma está marcada como no disponible

**Validaciones** (deben fallar con error):
- ❌ Elegirte a ti mismo
- ❌ Elegir a tu objetivo actual
- ❌ Elegir a un jugador muerto
- ❌ Usar el poder dos veces

---

### ✅ TEST 6: Race Conditions (Poderes Limitados)

**Objetivo**: Verificar que solo 3 jugadores pueden obtener poderes

**Setup**: 5 jugadores en la partida

**Pasos**:
1. Jugador A llega a 2 kills → Selecciona "Asesino Serial"
2. Jugador B llega a 2 kills → Selecciona "Investigador"
3. Jugador C llega a 2 kills → Selecciona "Sicario"
4. ✅ En `available_powers`: todos los poderes tienen `is_taken = true`
5. Jugador D llega a 2 kills
6. ✅ Modal NO aparece (o aparece vacío)
7. ✅ Jugador D no recibe poder

**Test de concurrencia**:
1. Jugador E y F llegan a 2 kills simultáneamente
2. Ambos intentan seleccionar "Asesino Serial" al mismo tiempo
3. ✅ Solo UNO lo obtiene (actualización atómica)
4. ✅ El otro ve error o el poder aparece como "Ya tomado"

---

### ✅ TEST 7: Personajes Especiales (Espía, Detective, Saboteador)

**Objetivo**: Verificar que los poderes básicos funcionan

**Espía**:
1. Jugador con personaje Espía
2. Click "⚡ Usar Poder"
3. Modal verde con lista de jugadores
4. Seleccionar un jugador
5. ✅ Ver el nombre de su víctima
6. ✅ `special_character_used = true`

**Detective**:
1. Jugador con personaje Detective
2. Click "⚡ Usar Poder"
3. Modal amarillo con lista de jugadores
4. Seleccionar un jugador
5. ✅ Ver el arma que debe usar
6. ✅ `special_character_used = true`

**Saboteador**:
1. Jugador con personaje Saboteador
2. Click "⚡ Usar Poder"
3. Modal rojo con lista de jugadores
4. Seleccionar un jugador
5. ✅ Ver el lugar donde debe asesinar
6. ✅ `special_character_used = true`

---

### ✅ TEST 8: Finalización del Juego

**Objetivo**: Verificar que el ganador se declara correctamente

**Pasos**:
1. Solo quedan 2 jugadores vivos
2. Jugador A asesina a Jugador B
3. Jugador B confirma
4. ✅ Pantalla de ganador aparece para TODOS
5. ✅ Jugador A ve: "🏆 ¡ERES EL GANADOR!"
6. ✅ Jugadores muertos ven: "👑 ¡[Nombre A] GANÓ!"
7. ✅ Muestra kill_count del ganador
8. ✅ Botón "🏠 Volver al Menú Principal"
9. ✅ En la BD: `games.status = 'finished'`

---

### ✅ TEST 9: GameMaster Controls

**Dashboard del GM**:
- ✅ Ver lista de jugadores con estado (vivo/muerto)
- ✅ Ver kill_count de cada jugador
- ✅ Botón "Terminar Partida"
  - Click → Confirmación
  - ✅ Partida termina
  - ✅ `games.status = 'finished'`
- ✅ Botón "Volver al Menú"
  - Click → Redirecciona a `/`

---

### ✅ TEST 10: Persistencia y Reconexión

**Objetivo**: Verificar que el estado persiste tras recargar

**Pasos**:
1. Jugador tiene un poder asignado
2. Recarga la página (F5)
3. ✅ El poder sigue apareciendo en el badge
4. Si es activo y NO usado:
   - ✅ El botón aparece
5. Si ya fue usado:
   - ✅ Muestra "✓ Ya usado"
6. ✅ kill_count se mantiene
7. ✅ Objetivo actual se mantiene

---

## 🐛 Edge Cases

### Edge 1: Último jugador vivo
- Jugador A usa Sicario
- Solo queda Jugador B vivo (además de A)
- ✅ Jugador B debe ser el único seleccionable

### Edge 2: Sin armas disponibles
- Todas las armas están en uso
- Jugador usa Sicario
- ✅ Debe asignar "Arma desconocida" como fallback

### Edge 3: Jugador muere antes de usar poder
- Jugador A tiene Investigador sin usar
- Jugador A muere
- ✅ No puede usar el poder estando muerto

### Edge 4: GM termina partida durante uso de poder
- Jugador A abre modal de Sicario
- GM presiona "Terminar Partida"
- ✅ Modal se cierra
- ✅ Partida finaliza

---

## 📊 Checklist Final

### Base de Datos
- [ ] Tabla `available_powers` existe
- [ ] 3 poderes se crean al iniciar juego
- [ ] Campo `power_2kills` en `players`
- [ ] Campo `power_2kills_used` en `players`
- [ ] RLS policies configuradas

### APIs
- [ ] `POST /api/power/select` - Seleccionar poder
- [ ] `POST /api/power/investigador` - Usar investigador
- [ ] `POST /api/power/sicario` - Usar sicario
- [ ] `POST /api/kill/attempt` - Validación con Asesino Serial
- [ ] `POST /api/kill/confirm` - CONTRA de Asesino Serial

### UI/UX
- [ ] Modal de selección auto-aparece en 2 kills
- [ ] Poderes tomados se muestran deshabilitados
- [ ] Badges de colores para cada tipo de poder
- [ ] Botones solo para poderes activos
- [ ] "✓ Ya usado" cuando aplica
- [ ] Indicador visual de Asesino Serial en AssignmentCard

### Notificaciones
- [ ] Notificaciones privadas al usar poderes
- [ ] Notificaciones públicas (sin revelar quién)
- [ ] Notificaciones a jugadores afectados
- [ ] Eventos guardados en tabla `events`

---

## 🚀 Test de Stress

Para producción, prueba con:

1. **10+ jugadores simultáneos**
2. **Múltiples navegadores/dispositivos**
3. **Conexión lenta** (throttle en DevTools)
4. **Mobile** (iOS y Android)
5. **Diferentes navegadores** (Chrome, Firefox, Safari)

---

## ✅ Criterios de Éxito

El sistema está listo cuando:

- ✅ Todos los tests pasan sin errores
- ✅ No hay errores en la consola del navegador
- ✅ Notificaciones llegan correctamente
- ✅ Estado persiste tras recargas
- ✅ Race conditions manejadas
- ✅ Validaciones previenen uso indebido
- ✅ UI es clara y responsive

---

## 📝 Reporte de Bugs

Si encuentras bugs, documenta:

1. **Pasos para reproducir**
2. **Resultado esperado**
3. **Resultado actual**
4. **Screenshots/videos**
5. **Logs de consola**
6. **Estado de la BD** (si es relevante)

---

¡Disfruta jugando a RucaKiller! 🎯🔪
