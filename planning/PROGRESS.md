# 📈 Estado del Proyecto RucaKiller

**Última actualización:** 7 de noviembre, 2025  
**Versión:** FASE 2 en progreso (v0.3)  
**Progreso General:** 🎉 MVP CORE 100% + TASK-111, 200, 201-203 COMPLETADAS

---

## 🎯 Commits Realizados

### Commit 1: Setup inicial
```
feat(task-000,task-001): setup inicial Next.js + Supabase
```

### Commit 2: Landing page
```
feat(task-100): landing page con navegación
```

### Commit 3: Crear partida con PIN
```
feat(task-101): implementar creación de partida con PIN para GameMaster
```

### Commit 4: Join + Lobby + Login GM
```
feat(task-102,task-101.5): implementar join, lobby y login GameMaster
```

### Commit 5: Configuración lugares y armas
```
feat(task-104): implementar configuración de lugares y armas
```

### Commit 6: Algoritmo circular
```
feat(task-105): implementar algoritmo de asignación circular
```

### Commit 7: Vista del jugador - Ver objetivo
```
feat(task-106): implementar vista del jugador con AssignmentCard y Realtime
```

### Commit 8: Validación de intento de asesinato
```
feat(task-107): implementar validación de intento de asesinato
```

### Commit 9: Confirmación y herencia de objetivo
```
feat(task-108): implementar confirmación de asesinato y herencia de objetivo
```

### Commit 10: Dashboard del GameMaster
```
feat(task-109): implementar Dashboard completo del GameMaster
```

### Commit 11: Fix ganador
```
fix: resolver bug de auto-asignación al ganar + mostrar pantalla de ganador
```

### Commit 12: Documentación MVP Core
```
docs: actualizar documentación - MVP CORE 100% COMPLETADO (TASK-000 a TASK-109)
```

### Commit 13: Fixes críticos ⭐ NUEVO
```
fix(task-106,task-108): arreglar kill_count, auto-refresh víctima, pantalla ganador para todos y botón volver
```
**Cambios:**
- Función RPC `increment_kill_count()` para incremento atómico ✅
- Suscripción Realtime a `players` para auto-refresh ✅
- Pantalla de ganador visible para TODOS los jugadores ✅
- Botón "Volver al Menú Principal" con limpieza de localStorage ✅

### Commit 14: Sistema de Notificaciones Completo ⭐ NUEVO
```
feat(task-111): implementar NotificationCenter con Realtime, sonido y vibración
```
**Cambios:**
- Componente NotificationCenter con badge y dropdown ✅
- Suscripción Realtime a tabla notifications ✅
- Sonido de notificación (Web Audio API) ✅
- Vibración en dispositivos móviles ✅
- Marcar como leídas automáticamente ✅
- Integrado en vista jugador y dashboard GM ✅

### Commit 15: Asignación de Personajes Especiales ⭐
```
feat(task-200): implementar asignación aleatoria de personajes especiales
```
**Cambios:**
- Función assignSpecialCharacters() en /lib/game-utils.ts ✅
- Asignación automática al iniciar juego (~30% jugadores) ✅
- Personajes: Espía, Detective, Saboteador ✅
- Badge en vista del jugador ✅
- Badge en dashboard GameMaster ✅

### Commit 16: Poderes de Personajes Especiales ⭐ NUEVO
```
feat(task-201-203): implementar poderes Espía, Detective y Saboteador
```
**Cambios:**
- API /api/power/espia (ver objetivo de otro) ✅
- API /api/power/detective (recibir pista aleatoria) ✅
- API /api/power/saboteador (cambiar condiciones de otro) ✅
- Componente SpecialPowerModal reutilizable ✅
- Botón "Usar Poder" en vista del jugador ✅
- Validaciones completas (uso único, juego activo, jugador vivo) ✅
- Registro de eventos en tabla events ✅

---

## ✅ Funcionalidades Implementadas

### 1. Sistema de Partidas
- ✅ Crear partida con código único (6 caracteres)
- ✅ GameMaster protegido con PIN (4-6 dígitos, SHA-256)
- ✅ Re-acceso GameMaster (código + PIN)
- ✅ Jugadores se unen con código + nombre
- ✅ Validación de nombres duplicados
- ✅ GameMaster protegido con PIN (4-6 dígitos, SHA-256)
- ✅ Re-acceso GameMaster (código + PIN)
- ✅ Jugadores se unen con código + nombre
- ✅ Validación de nombres duplicados

### 2. Lobby en Tiempo Real
- ✅ Vista compartida GameMaster + Jugadores
- ✅ Lista de jugadores actualizada con Supabase Realtime
- ✅ Indicador visual de GameMaster (👑)
- ✅ Contador de jugadores

### 3. Configuración del Juego
- ✅ Formulario para 5 lugares (precargados)
- ✅ Formulario para 18 armas (precargados)
- ✅ Validación de configuración completa
- ✅ Re-configuración permitida

### 4. Algoritmo de Asignación
- ✅ Shuffle Fisher-Yates para aleatoriedad
- ✅ Cadena circular perfecta (cada jugador tiene 1 objetivo y 1 cazador)
- ✅ Lugares pueden repetirse
- ✅ Armas únicas (no se repiten)
- ✅ Validación de cadena circular

### 5. Inicio del Juego
- ✅ Botón "Iniciar Juego" (solo GameMaster)
- ✅ Cambio de estado de 'lobby' a 'active'
- ✅ Generación de asignaciones en DB
- ✅ Redirección automática con Realtime

### 6. Vista del Jugador
- ✅ Componente AssignmentCard con diseño atractivo
- ✅ Mostrar nombre del objetivo
- ✅ Mostrar lugar y arma requeridos
- ✅ Actualización en tiempo real con Supabase Realtime
- ✅ Estado del jugador (vivo/muerto, kills)
- ✅ Indicador de juego pausado
- ✅ Badges para personajes especiales y poderes

### 7. Sistema de Asesinatos
- ✅ Botón "He asesinado" en vista del jugador
- ✅ API /api/kill/attempt con validaciones completas
- ✅ Validar estado del juego y jugadores
- ✅ Modal KillConfirmationModal para víctimas
- ✅ Confirmar o rechazar asesinatos
- ✅ API /api/kill/confirm con lógica de herencia
- ✅ Marcar víctima como muerta
- ✅ Incrementar kill_count del asesino
- ✅ Herencia automática del objetivo
- ✅ Reasignación de armas (liberar y asignar)
- ✅ Generar nuevas condiciones (lugar y arma)
- ✅ Detección de ganador (1 jugador vivo)
- ✅ Notificaciones públicas y privadas
- ✅ Actualización en tiempo real con Realtime

### 8. Dashboard del GameMaster
- ✅ Vista general con estadísticas en tiempo real
- ✅ Grid de stats (vivos, muertos, kills, estado)
- ✅ Botón pausar/reanudar juego
- ✅ Lista de jugadores con estado y kill count
- ✅ Mostrar personajes especiales
- ✅ Ver asignaciones activas (cadena hunter → target)
- ✅ Mostrar condiciones de cada asignación
- ✅ Historial de asesinatos confirmados
- ✅ Suscripciones Realtime para actualización automática
- ✅ Verificación de autenticación GameMaster

### 9. Sistema de Victoria
- ✅ Detección correcta de ganador (1 jugador vivo)
- ✅ NO crear asignación cuando queda 1 jugador
- ✅ Desactivar todas las asignaciones al finalizar
- ✅ Marcar juego como 'finished'
- ✅ **Pantalla de ganador visible para TODOS los jugadores**
- ✅ **Ganador ve trofeo dorado 🏆**
- ✅ **Otros jugadores ven corona morada 👑 + nombre del ganador**
- ✅ **Mostrar kill_count del ganador a todos**
- ✅ **Botón "Volver al Menú Principal" para limpiar y reiniciar**
- ✅ Notificaciones de victoria (privada + pública)

### 11. Sistema de Kill Count
- ✅ Campo `kill_count` en tabla players (INTEGER, default: 0)
- ✅ **Función SQL `increment_kill_count()` para incremento atómico**
- ✅ **Actualización en tiempo real con Realtime**
- ✅ **Mostrado en Player Status Card**
- ✅ **Sincronización automática al confirmar asesinatos**

### 12. Sistema de Notificaciones Completo ⭐
- ✅ **Componente NotificationCenter con badge contador**
- ✅ **Dropdown con notificaciones públicas y privadas**
- ✅ **Filtrado correcto (tabla notifications)**
- ✅ **Marcar como leídas automáticamente**
- ✅ **Suscripción Realtime para nuevas notificaciones**
- ✅ **Sonido de notificación (Web Audio API)**
- ✅ **Vibración en dispositivos móviles**
- ✅ **Formato de tiempo relativo (Hace Xm, Hace Xh)**
- ✅ **Límite de 20 notificaciones más recientes**
- ✅ **Integrado en vista jugador y dashboard GM**

### 13. Personajes Especiales (Espía, Detective, Saboteador) ⭐
- ✅ **Función assignSpecialCharacters() en /lib/game-utils.ts**
- ✅ **Selección aleatoria de ~30% de jugadores**
- ✅ **Asignación balanceada entre 3 personajes**
- ✅ **Integración en API /api/game/start**
- ✅ **Badge visible en vista del jugador**
- ✅ **Badge visible en dashboard GameMaster**
- ✅ **Indicador de poder usado/no usado**
- ✅ **Campo special_character en tabla players**

### 14. Poderes de Personajes Especiales ⭐ NUEVO
- ✅ **Poder Espía: Ver nombre del objetivo de otro jugador**
  - API /api/power/espia con validaciones completas
  - Modal de selección de jugador objetivo
  - Muestra SOLO el nombre (no condiciones)
  - Uso único por partida
- ✅ **Poder Detective: Recibir pista aleatoria**
  - API /api/power/detective
  - Selección aleatoria de asignación activa
  - Muestra lugar + arma (sin nombres de jugadores)
  - Uso único por partida
- ✅ **Poder Saboteador: Cambiar condiciones de otro**
  - API /api/power/saboteador
  - Modal para seleccionar jugador y condición
  - Muestra condiciones actuales antes de cambiar
  - Permite cambiar UNA condición (lugar O arma)
  - Objetivo NO es notificado
  - Gestión de armas disponibles
  - Uso único por partida
- ✅ **Componente SpecialPowerModal reutilizable**
- ✅ **Botón "Usar Poder" en vista del jugador**
- ✅ **Validaciones: juego activo, jugador vivo, personaje correcto**
- ✅ **Registro de eventos en tabla events**

---

### 11. Auto-Refresh y Realtime
- ✅ **Suscripción a tabla `players` para detectar cambios**
- ✅ **Auto-refresh cuando `is_alive` cambia a false**
- ✅ **Auto-refresh cuando `kill_count` aumenta**
- ✅ **No requiere F5 manual para ver cambios**
- ✅ Suscripción a tabla `games` para cambios de estado
- ✅ Suscripción a tabla `assignments` para herencias

---

## 🐛 Bugs Corregidos (Sesión 7 Nov)

### Bug #1: Kill Count no funcionaba
- **Problema:** El contador no se incrementaba al confirmar asesinatos
- **Causa:** Faltaba la función RPC en Supabase
- **Solución:** Creada función `increment_kill_count(player_id UUID)` en Supabase
- **Estado:** ✅ RESUELTO

### Bug #2: Víctima no veía que fue eliminada
- **Problema:** Después de confirmar asesinato, pantalla no se actualizaba
- **Causa:** Falta de suscripción Realtime a cambios en el jugador
- **Solución:** Agregada suscripción a `players` table en `/game/[id]/page.tsx`
- **Estado:** ✅ RESUELTO

### Bug #3: Solo ganador veía pantalla de victoria
- **Problema:** Jugadores eliminados no sabían quién ganó
- **Causa:** Lógica solo mostraba victoria al `is_alive = true`
- **Solución:** Nueva lógica con estado `isFinished` que muestra a TODOS
- **Estado:** ✅ RESUELTO

### Bug #4: No había forma de salir después del juego
- **Problema:** Pantalla final sin opciones para volver
- **Causa:** Falta de navegación post-juego
- **Solución:** Botón "Volver al Menú Principal" que limpia localStorage
- **Estado:** ✅ RESUELTO

---

## 🚧 Próximas Tareas Prioritarias

### FASE 2 - Features Principales (En Progreso):

**Próximas tareas:**
1. ✅ **TASK-200:** Asignar Personajes Especiales (COMPLETADA)
2. **TASK-201-203:** Implementar poderes de personajes especiales (EN PROGRESO)
3. **TASK-204-207:** Sistema de poderes por 2 kills (Asesino Serial, Investigador, Sicario)
4. **TASK-208:** Historial de asesinatos mejorado
5. **TASK-209:** Eliminar jugador manualmente (GameMaster)

---

## 📦 Estructura del Proyecto

```
/root/projects/rucakiller/
├── app/
│   ├── page.tsx                    # Landing page ✅
│   ├── create/page.tsx             # Crear partida ✅
│   ├── join/page.tsx               # Unirse ✅
│   ├── gamemaster/
│   │   └── login/page.tsx          # Login GM ✅
│   ├── game/[id]/
│   │   ├── lobby/
│   │   │   ├── page.tsx            # Lobby ✅
│   │   │   └── GameSetup.tsx       # Configuración ✅
│   │   └── page.tsx                # Juego activo 🚧
│   └── api/
│       ├── game/
│       │   ├── create/route.ts     # API crear ✅
│       │   ├── join/route.ts       # API join ✅
│       │   ├── configure/route.ts  # API config ✅
│       │   └── start/route.ts      # API iniciar ✅
│       └── gamemaster/
│           └── login/route.ts      # API login GM ✅
├── lib/
│   ├── supabase.ts                 # Cliente Supabase ✅
│   ├── types.ts                    # TypeScript types ✅
│   ├── game-utils.ts               # Utilidades juego ✅
│   ├── pin-utils.ts                # Hashing PIN ✅
│   └── assignment-algorithm.ts     # Algoritmo circular ✅
└── planning/
    ├── GAME-CORE.md               # Reglas del juego
    ├── PLANNING.md                # Plan de desarrollo
    ├── TASK.md                    # Backlog detallado
    ├── RULES.md                   # Reglas de desarrollo
    └── PROGRESS.md                # Este archivo
```

---

## 🗄️ Base de Datos (Supabase)

### Tablas Creadas:
1. **games** - Partidas (code, status, game_master_id, game_master_pin)
2. **players** - Jugadores (name, is_game_master, is_alive, game_id)
3. **assignments** - Asignaciones hunter→target (location, weapon, is_active)
4. **locations** - Lugares configurados por partida
5. **weapons** - Armas configuradas por partida (is_available)
6. **events** - Historial de eventos (asesinatos, poderes usados)
7. **notifications** - Sistema de notificaciones
8. **available_powers** - Poderes especiales disponibles

### Políticas RLS:
- ✅ Configuradas en todas las tablas
- ✅ Realtime habilitado

---

## 🧪 Testing Manual Realizado

### Flujo Completo Probado:
1. ✅ Crear partida con PIN
2. ✅ 6 jugadores se unen en diferentes pestañas
3. ✅ GameMaster configura lugares y armas
4. ✅ Iniciar juego → 6 asignaciones generadas
5. ✅ Cadena circular validada en DB
6. ✅ Redirección automática funcional

### Casos Edge Probados:
- ✅ PIN incorrecto → Error mostrado
- ✅ Código inválido → Error mostrado
- ✅ Nombres duplicados → Error mostrado
- ✅ Juego ya iniciado → Bloqueo correcto

---

## 📝 Notas de Desarrollo

### Decisiones Técnicas:
- **Hashing:** SHA-256 para PINs (Web Crypto API)
- **Shuffle:** Fisher-Yates para aleatoriedad uniforme
- **Realtime:** Supabase channels para sincronización
- **Estado:** localStorage para session management
- **Mobile-first:** Tailwind CSS con diseño responsive

### Mejoras Futuras (v2.0):
- 🚧 Fotos de asesinatos (Supabase Storage)
- 🚧 Agente de voz IA (ElevenLabs)
- 🚧 PWA offline capabilities
- 🚧 Personajes especiales (Espía, Detective, Saboteador)
- 🚧 Poderes por 2 kills (Asesino Serial, Investigador, Sicario)
- 🚧 Daga del Asesino (arma especial)

---

## 🎯 Meta del MVP

**Objetivo:** Tener un juego completamente jugable para el fin de semana en la parcela.

**Fecha límite estimada:** Diciembre 2025

**Tareas críticas restantes:**
1. Vista del jugador (ver objetivo)
2. Validar asesinatos + herencia
3. Dashboard GameMaster
4. Sistema de notificaciones básico
5. PWA configuration

**Progreso actual:** 36% → Falta 64% para MVP completo
