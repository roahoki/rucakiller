# 📋 Backlog de Tareas - RucaKiller

**Última actualización:** 7 de noviembre, 2025
**Estado del Proyecto:** 🟢 En desarrollo activo - MVP Core en progreso

---

## ✅ TAREAS COMPLETADAS

### ✅ TASK-000: Configuración del Entorno
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Next.js 16.0.1 con TypeScript
- Tailwind CSS 4 configurado
- Estructura de carpetas establecida

### ✅ TASK-001: Configuración de Supabase
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- 8 tablas creadas (games, players, assignments, locations, weapons, events, notifications, available_powers)
- RLS configurado
- Realtime habilitado

### ✅ TASK-100: Landing Page y Navegación
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Landing page responsive con 3 botones
- Diseño mobile-first

### ✅ TASK-101: Crear Partida (GameMaster)
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Formulario con nombre + PIN (4-6 dígitos)
- API /api/game/create con hashing SHA-256
- Función SQL create_game_with_master
- Session management en localStorage

### ✅ TASK-101.5: Login de GameMaster (Re-acceso a Partida)
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Página /gamemaster/login
- API /api/gamemaster/login con validación PIN
- Botón "Soy GameMaster" en landing

### ✅ TASK-102: Unirse a Partida (Killer)
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Formulario /join con código y nombre
- API /api/game/join
- Validaciones completas

### ✅ TASK-103: Lobby / Sala de Espera
**Estado:** COMPLETADA (integrada con TASK-102)
**Fecha:** 6 de noviembre, 2025
- Componente /game/[id]/lobby con Realtime
- Lista de jugadores actualizada en tiempo real
- Vista unificada para GM y killers

### ✅ TASK-104: Configurar Lugares y Armas (GameMaster)
**Estado:** COMPLETADA
**Fecha:** 6 de noviembre, 2025
- Componente GameSetup con formularios
- API /api/game/configure
- 5 lugares + 18 armas predeterminados de GAME-CORE.md
- Validación y re-configuración

### ✅ TASK-105: Algoritmo de Asignación Circular
**Estado:** COMPLETADA
**Fecha:** 7 de noviembre, 2025
- Función generateCircularAssignments() con Fisher-Yates shuffle
- Validación de cadena circular perfecta
- API /api/game/start
- Asignación de lugares y armas únicas
- Redirección automática con Realtime

---

## 🎯 FASE 1: MVP Core - Sistema Base del Juego

### TASK-000: Configuración del Entorno
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 horas
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

**Subtareas:**
- [ ] Inicializar proyecto Next.js 14+ con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint y Prettier
- [ ] Crear estructura de carpetas base
- [ ] Configurar variables de entorno (.env.local)
- [ ] Setup Git y primer commit

**Criterios de aceptación:**
- ✅ `npm run dev` funciona sin errores
- ✅ Tailwind aplicado en página de prueba
- ✅ TypeScript sin errores de compilación

---

### TASK-001: Configuración de Supabase
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 horas
**Dependencias:** TASK-000

**Subtareas:**
- [ ] Crear proyecto en Supabase
- [ ] Instalar `@supabase/supabase-js`
- [ ] Configurar cliente de Supabase en `/lib/supabase.ts`
- [ ] Crear todas las tablas en Supabase (SQL migrations)
- [ ] Configurar Row Level Security (RLS) básico
- [ ] Habilitar Realtime en las tablas necesarias
- [ ] Testear conexión desde Next.js

**Criterios de aceptación:**
- ✅ Conexión a Supabase establecida
- ✅ Todas las tablas creadas (games, players, assignments, etc)
- ✅ RLS configurado para seguridad básica
- ✅ Realtime habilitado

**SQL a ejecutar:**
```sql
-- Ver PLANNING.md para el schema completo
```

---

## 🎯 FASE 1: MVP Core - Sistema Base del Juego

### TASK-100: Landing Page y Navegación
**Prioridad:** 🟠 ALTA
**Estimación:** 2 horas
**Dependencias:** TASK-000
**HU relacionadas:** Ninguna (UX)

**Subtareas:**
- [ ] Crear landing page (`app/page.tsx`)
- [ ] Botón "Crear Partida" (para GameMaster)
- [ ] Botón "Unirse a Partida" (para Killers)
- [ ] Diseño mobile-first con Tailwind
- [ ] Navegación básica

**Criterios de aceptación:**
- ✅ Landing page responsive
- ✅ Botones redirigen correctamente
- ✅ Diseño atractivo y simple

---

### TASK-101: Crear Partida (GameMaster)
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 5 horas
**Dependencias:** TASK-001
**HU relacionadas:** HU-GM01

**Subtareas:**
- [ ] Crear página `/create` - Formulario de registro GameMaster
  - Input: Nombre del GameMaster
  - Input: PIN (4-6 dígitos numéricos)
  - Confirmación del PIN
  - Validación de PIN
- [ ] Crear API route `/api/game/create`
  - Generar código único de 6 caracteres
  - Hashear PIN usando bcrypt/crypto
  - Insertar registro en tabla `games` (con `game_master_pin` hasheado)
  - Crear jugador GameMaster en tabla `players` (is_game_master = true)
  - Vincular GameMaster a la partida (game_master_id)
  - Generar session token y guardarlo en localStorage
- [ ] Redirigir a dashboard del GameMaster
- [ ] Manejo de errores (PIN inválido, código duplicado, etc.)

**Criterios de aceptación:**
- ✅ GameMaster ingresa nombre + PIN al crear partida
- ✅ PIN se guarda hasheado en DB (nunca en texto plano)
- ✅ Se crea partida con código único
- ✅ GameMaster queda registrado como jugador
- ✅ Código es visible para compartir
- ✅ No hay colisiones de códigos
- ✅ Session token guardado en localStorage

**Testing manual:**
1. Click en "Crear Partida"
2. Ingresar nombre y PIN (ej: "1234")
3. Confirmar PIN
4. Verificar que se genera código de partida
5. Verificar redirección a dashboard
6. Verificar en Supabase que el PIN está hasheado

---

### TASK-101.5: Login de GameMaster (Re-acceso a Partida)
**Prioridad:** 🟡 ALTA
**Estimación:** 2 horas
**Dependencias:** TASK-101
**HU relacionadas:** HU-GM01

**Subtareas:**
- [ ] Crear página `/gamemaster/login`
- [ ] Input para código de partida
- [ ] Input para PIN
- [ ] API route `/api/gamemaster/login`
- [ ] Validar código + PIN hasheado
- [ ] Guardar session token en localStorage
- [ ] Redirigir a dashboard del GameMaster
- [ ] Agregar botón "Soy GameMaster" en landing page

**Criterios de aceptación:**
- ✅ GameMaster puede re-ingresar con código + PIN
- ✅ PIN se valida contra hash en DB
- ✅ Mensaje de error si código o PIN incorrectos
- ✅ Session se guarda en localStorage
- ✅ Redirección correcta al dashboard

**Testing manual:**
1. Cerrar sesión / Abrir navegador en incógnito
2. Click en "Soy GameMaster" desde landing
3. Ingresar código de partida existente
4. Ingresar PIN correcto
5. Verificar redirección a dashboard
6. Intentar con PIN incorrecto y verificar error

---

### TASK-102: Unirse a Partida (Killer)
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 horas
**Dependencias:** TASK-101
**HU relacionadas:** HU-K01

**Subtareas:**
- [ ] Crear página `/lobby/[code]/page.tsx`
- [ ] Input para nombre del jugador
- [ ] Validar código de partida
- [ ] API route `/api/game/join`
- [ ] Insertar jugador en tabla `players`
- [ ] Guardar session token en localStorage
- [ ] Redirigir a lobby/sala de espera

**Criterios de aceptación:**
- ✅ Jugador puede ingresar nombre y código
- ✅ Validación de código existente
- ✅ Jugador se une correctamente
- ✅ Mensaje de error si código no existe

**Testing manual:**
1. Usar código generado en TASK-101
2. Ingresar nombre
3. Verificar que se une al lobby
4. Verificar en Supabase que se creó el jugador

---

### TASK-103: Lobby / Sala de Espera
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-102
**HU relacionadas:** HU-K04, HU-GM05

**Subtareas:**
- [ ] Crear componente `<PlayerList>`
- [ ] Suscripción realtime a tabla `players`
- [ ] Mostrar lista de jugadores unidos
- [ ] Indicador de "GameMaster" vs "Killer"
- [ ] Contador de jugadores
- [ ] Auto-actualización cuando se une alguien

**Criterios de aceptación:**
- ✅ Lista se actualiza en tiempo real
- ✅ Se distingue visualmente al GameMaster
- ✅ Contador muestra cantidad correcta
- ✅ Funciona para múltiples usuarios simultáneos

**Testing manual:**
1. Abrir en 2 navegadores
2. Unir jugadores desde ambos
3. Verificar que ambos ven la lista actualizada

---

### TASK-104: Configurar Lugares y Armas (GameMaster)
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 horas
**Dependencias:** TASK-103
**HU relacionadas:** HU-GM02, HU-GM03

**Subtareas:**
- [ ] Crear componente `<GameSetup>`
- [ ] Form para agregar lugares (5 lugares)
- [ ] Form para agregar armas (18 armas)
- [ ] API route `/api/game/configure`
- [ ] Insertar en tablas `locations` y `weapons`
- [ ] Validación (mínimo 5 lugares, 18 armas)
- [ ] Precargar valores por defecto

**Criterios de aceptación:**
- ✅ GameMaster puede configurar lugares
- ✅ GameMaster puede configurar armas
- ✅ Se valida cantidad mínima
- ✅ Datos se guardan en Supabase

**Testing manual:**
1. Como GameMaster, configurar lugares
2. Configurar armas
3. Verificar en Supabase
4. Intentar iniciar sin configuración completa

---

### TASK-105: Algoritmo de Asignación Circular
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 6 horas
**Dependencias:** TASK-104
**HU relacionadas:** HU-GM07, HU-GM09

**Subtareas:**
- [ ] Crear función `generateCircularAssignments()`
- [ ] Shuffle aleatorio de jugadores
- [ ] Crear cadena circular (último → primero)
- [ ] Asignar lugar y arma aleatoria a cada par
- [ ] Marcar armas como "en uso"
- [ ] API route `/api/game/assign`
- [ ] Insertar en tabla `assignments`
- [ ] Validar que todos tienen objetivo y cazador

**Criterios de aceptación:**
- ✅ Cadena circular perfecta (todos conectados)
- ✅ Cada jugador tiene 1 objetivo y 1 cazador
- ✅ Armas no se repiten entre jugadores activos
- ✅ Lugares pueden repetirse
- ✅ Algoritmo funciona con 2-18 jugadores

**Testing manual:**
1. Crear partida con 5 jugadores
2. Iniciar asignación
3. Verificar en Supabase tabla `assignments`
4. Validar que forma cadena circular
5. Probar con diferentes cantidades de jugadores

---

### TASK-106: Vista del Jugador - Ver Objetivo
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 4 horas
**Dependencias:** TASK-105
**HU relacionadas:** HU-K06, HU-K07

**Subtareas:**
- [ ] Crear página `/game/[id]/page.tsx`
- [ ] Obtener asignación del jugador actual
- [ ] Componente `<AssignmentCard>`
- [ ] Mostrar nombre del objetivo
- [ ] Mostrar lugar y arma
- [ ] Suscripción realtime para cambios
- [ ] Diseño mobile-first atractivo

**Criterios de aceptación:**
- ✅ Jugador ve su objetivo claramente
- ✅ Ve lugar y arma requeridos
- ✅ UI intuitiva y fácil de leer
- ✅ Se actualiza si cambia el objetivo

**Testing manual:**
1. Como jugador, ver objetivo asignado
2. Verificar que coincide con base de datos
3. Simular cambio de objetivo (manual en BD)
4. Verificar que se actualiza en la UI

---

### TASK-107: Validación de Asesinato - Intento
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 5 horas
**Dependencias:** TASK-106
**HU relacionadas:** HU-K08

**Subtareas:**
- [ ] Botón "He Asesinado" en vista del jugador
- [ ] API route `/api/kill/attempt`
- [ ] Validar que el jugador está vivo
- [ ] Validar que el juego está activo (no pausado)
- [ ] Crear evento en tabla `events` (tipo 'kill', confirmed: false)
- [ ] Notificar a la víctima para confirmación
- [ ] Mostrar estado "Esperando confirmación..."

**Criterios de aceptación:**
- ✅ Jugador puede intentar asesinar
- ✅ No puede asesinar si está muerto
- ✅ No puede asesinar si juego está pausado
- ✅ Víctima recibe notificación

**Testing manual:**
1. Como jugador, click en "He Asesinado"
2. Verificar que se crea evento en BD
3. Verificar que víctima recibe notificación
4. Verificar estado "Esperando confirmación"

---

### TASK-108: Validación de Asesinato - Confirmación
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 6 horas
**Dependencias:** TASK-107
**HU relacionadas:** HU-K09, HU-K10

**Subtareas:**
- [ ] Modal de confirmación para víctima
- [ ] Botones "Confirmar" / "Rechazar"
- [ ] API route `/api/kill/confirm`
- [ ] Si confirma: Marcar jugador como muerto (is_alive = false)
- [ ] Si confirma: Heredar objetivo (actualizar assignment del asesino)
- [ ] Si confirma: Incrementar kill_count del asesino
- [ ] Si rechaza: Cancelar evento
- [ ] Opción de disputar (apelar al GameMaster)
- [ ] Crear notificaciones públicas

**Criterios de aceptación:**
- ✅ Víctima puede confirmar o rechazar
- ✅ Al confirmar, asesino hereda objetivo correcto
- ✅ Víctima queda marcada como muerta
- ✅ Kill count se incrementa
- ✅ Notificación pública: "Se ha producido un asesinato"
- ✅ Al rechazar, asesinato se cancela

**Testing manual:**
1. Asesino intenta matar
2. Víctima recibe notificación
3. Víctima confirma
4. Verificar herencia de objetivo en BD
5. Verificar kill_count
6. Probar también el rechazo

---

### TASK-109: Dashboard del GameMaster - Vista General
**Prioridad:** 🟠 ALTA
**Estimación:** 5 horas
**Dependencias:** TASK-108
**HU relacionadas:** HU-GM10, HU-GM16

**Subtareas:**
- [ ] Crear página `/game/[id]/dashboard`
- [ ] Componente `<GameMasterDashboard>`
- [ ] Ver lista de todos los jugadores (vivos/muertos)
- [ ] Ver estadísticas: jugadores vivos, kills totales
- [ ] Suscripción realtime a eventos
- [ ] Diseño claro y fácil de escanear

**Criterios de aceptación:**
- ✅ GameMaster ve todos los jugadores
- ✅ Diferencia visual entre vivos y muertos
- ✅ Estadísticas correctas en tiempo real
- ✅ Se actualiza automáticamente

**Testing manual:**
1. Como GameMaster, abrir dashboard
2. Ver lista de jugadores
3. Hacer que ocurra un asesinato
4. Verificar que estadísticas se actualizan

---

### TASK-110: Dashboard del GameMaster - Cadena de Objetivos
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-GM11

**Subtareas:**
- [ ] Componente `<AssignmentChain>`
- [ ] Visualización de la cadena circular
- [ ] Mostrar: Jugador → Objetivo (lugar + arma)
- [ ] Indicar jugadores muertos
- [ ] Actualización en tiempo real

**Criterios de aceptación:**
- ✅ GameMaster ve cadena completa
- ✅ Fácil de entender quién persigue a quién
- ✅ Se actualiza al ocurrir asesinatos
- ✅ Muestra condiciones de cada asignación

**Testing manual:**
1. Ver cadena inicial
2. Hacer que ocurra un asesinato
3. Verificar que cadena se actualiza
4. Validar que es fácil de interpretar

---

### TASK-111: Sistema de Notificaciones Básico
**Prioridad:** 🟠 ALTA
**Estimación:** 5 horas
**Dependencias:** TASK-108
**HU relacionadas:** HU-K12, HU-K13

**Subtareas:**
- [ ] Componente `<NotificationCenter>`
- [ ] Suscripción realtime a tabla `notifications`
- [ ] Filtrar notificaciones públicas y privadas
- [ ] Mostrar badge con contador de no leídas
- [ ] Marcar como leídas al abrir
- [ ] Sonido/vibración para notificaciones nuevas (PWA)
- [ ] Diseño tipo dropdown/modal

**Criterios de aceptación:**
- ✅ Jugador ve notificaciones públicas
- ✅ Jugador ve notificaciones privadas (solo suyas)
- ✅ Badge muestra cantidad correcta
- ✅ Notificaciones se marcan como leídas
- ✅ Sonido/vibración funciona

**Testing manual:**
1. Generar notificación pública (asesinato)
2. Verificar que todos la ven
3. Generar notificación privada
4. Verificar que solo el destinatario la ve
5. Testear en mobile para sonido/vibración

---

### TASK-112: Control de Estado del Juego (Pausar/Reanudar)
**Prioridad:** 🟠 ALTA
**Estimación:** 3 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-GM17, HU-K14

**Subtareas:**
- [ ] Botones en dashboard: "Pausar" / "Reanudar"
- [ ] API route `/api/game/status`
- [ ] Actualizar campo `status` en tabla `games`
- [ ] Validar que no se permiten asesinatos si está pausado
- [ ] Mostrar banner en vista de jugadores si está pausado
- [ ] Notificación pública al pausar/reanudar

**Criterios de aceptación:**
- ✅ GameMaster puede pausar el juego
- ✅ Durante pausa, asesinatos son rechazados
- ✅ Jugadores ven indicador visual de pausa
- ✅ GameMaster puede reanudar
- ✅ Notificaciones se envían correctamente

**Testing manual:**
1. Pausar juego desde dashboard
2. Intentar asesinar como jugador
3. Verificar que es rechazado
4. Reanudar juego
5. Verificar que asesinatos funcionan

---

## 🎯 FASE 2: Features Principales

### TASK-200: Asignar Personajes Especiales
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-105
**HU relacionadas:** HU-GM06, HU-K18

**Subtareas:**
- [ ] Función para asignar personajes aleatoriamente
- [ ] Seleccionar N jugadores random (ej: 30% del total)
- [ ] Asignar: 'espia', 'detective', 'saboteador'
- [ ] Actualizar campo `special_character` en `players`
- [ ] Mostrar personaje al jugador cuando inicie el juego
- [ ] Componente `<SpecialCharacterBadge>`

**Criterios de aceptación:**
- ✅ Personajes se asignan aleatoriamente
- ✅ No todos tienen personaje (solo algunos)
- ✅ Jugador ve su personaje especial
- ✅ GameMaster ve quién tiene qué personaje

**Testing manual:**
1. Iniciar juego con 10 jugadores
2. Verificar que solo algunos tienen personaje
3. Verificar distribución aleatoria
4. Ver desde vista de jugador

---

### TASK-201: Poder Espía - Ver Objetivo de Otro
**Prioridad:** 🟡 MEDIA
**Estimación:** 4 horas
**Dependencias:** TASK-200
**HU relacionadas:** HU-K15

**Subtareas:**
- [ ] Botón "Usar Poder de Espía" (solo si tiene el personaje)
- [ ] Modal para seleccionar jugador objetivo
- [ ] API route `/api/power/espia`
- [ ] Mostrar nombre del objetivo del jugador seleccionado
- [ ] Marcar poder como usado (`special_character_used = true`)
- [ ] Deshabilitar botón después de usar

**Criterios de aceptación:**
- ✅ Solo jugadores con personaje Espía ven el botón
- ✅ Puede seleccionar otro jugador
- ✅ Ve el NOMBRE del objetivo (no condiciones)
- ✅ Solo puede usar una vez
- ✅ Botón se deshabilita después de usar

**Testing manual:**
1. Como jugador con Espía, usar poder
2. Seleccionar otro jugador
3. Verificar que ve su objetivo
4. Verificar que no puede volver a usar

---

### TASK-202: Poder Detective - Recibir Pista
**Prioridad:** 🟡 MEDIA
**Estimación:** 3 horas
**Dependencias:** TASK-200
**HU relacionadas:** HU-K16

**Subtareas:**
- [ ] Botón "Usar Poder de Detective"
- [ ] API route `/api/power/detective`
- [ ] Seleccionar asignación aleatoria activa
- [ ] Mostrar lugar + arma de esa asignación (sin jugadores)
- [ ] Marcar poder como usado

**Criterios de aceptación:**
- ✅ Detective puede usar poder una vez
- ✅ Recibe lugar + arma de un asesinato random
- ✅ NO se le dice quién está involucrado
- ✅ Poder se marca como usado

**Testing manual:**
1. Como Detective, usar poder
2. Verificar que recibe pista
3. Intentar deducir de quién es
4. Verificar que no puede reusar

---

### TASK-203: Poder Saboteador - Cambiar Condiciones
**Prioridad:** 🟡 MEDIA
**Estimación:** 5 horas
**Dependencias:** TASK-200
**HU relacionadas:** HU-K17

**Subtareas:**
- [ ] Botón "Usar Poder de Saboteador"
- [ ] Modal: Seleccionar jugador + condición a cambiar (lugar o arma)
- [ ] API route `/api/power/saboteador`
- [ ] Mostrar condiciones actuales del jugador seleccionado
- [ ] Permitir elegir nueva condición
- [ ] Actualizar assignment sin notificar al objetivo
- [ ] Marcar poder como usado

**Criterios de aceptación:**
- ✅ Saboteador ve condiciones del jugador elegido
- ✅ Puede cambiar UNA condición (lugar O arma)
- ✅ Objetivo NO es notificado
- ✅ Cambio se refleja en base de datos
- ✅ Poder usado solo una vez

**Testing manual:**
1. Como Saboteador, elegir jugador
2. Ver sus condiciones actuales
3. Cambiar una condición
4. Verificar en BD que cambió
5. Verificar que jugador no fue notificado

---

### TASK-204: Poderes de 2 Kills - Sistema Base
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-108
**HU relacionadas:** HU-K19, HU-K23

**Subtareas:**
- [ ] Detectar cuando jugador llega a 2 kills
- [ ] Crear registros en tabla `available_powers`
- [ ] Modal de selección de poder
- [ ] Mostrar poderes disponibles vs tomados
- [ ] API route `/api/power/select`
- [ ] Actualizar `power_2kills` en tabla `players`
- [ ] Marcar poder como tomado en `available_powers`

**Criterios de aceptación:**
- ✅ Al llegar a 2 kills, se muestra modal
- ✅ Jugador ve poderes disponibles
- ✅ Puede seleccionar uno
- ✅ Poder queda marcado como tomado
- ✅ Máximo 3 poderes (uno de cada tipo)

**Testing manual:**
1. Lograr 2 kills con un jugador
2. Verificar que aparece modal
3. Seleccionar poder
4. Verificar que queda asignado
5. Con otro jugador, verificar que poder ya no está disponible

---

### TASK-205: Poder Asesino Serial
**Prioridad:** 🟠 ALTA
**Estimación:** 3 horas
**Dependencias:** TASK-204
**HU relacionadas:** HU-K20

**Subtareas:**
- [ ] Modificar validación de asesinato
- [ ] Si asesino tiene "asesino_serial", ignorar validación de lugar
- [ ] Aplicar CONTRA: Su cazador también ignora lugar
- [ ] Actualizar ambas asignaciones
- [ ] Mostrar indicador visual en UI

**Criterios de aceptación:**
- ✅ Asesino Serial puede matar en cualquier lugar
- ✅ Solo necesita el arma correcta
- ✅ Su cazador también tiene esta ventaja
- ✅ UI indica claramente esta condición

**Testing manual:**
1. Obtener poder Asesino Serial
2. Intentar asesinar en lugar incorrecto (pero con arma correcta)
3. Verificar que funciona
4. Verificar que cazador también tiene ventaja

---

### TASK-206: Poder Investigador
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-204
**HU relacionadas:** HU-K21

**Subtareas:**
- [ ] Botón "Usar Poder Investigador"
- [ ] Modal para seleccionar jugador
- [ ] API route `/api/power/investigador`
- [ ] Mostrar objetivo + condiciones del jugador elegido
- [ ] Enviar notificación al jugador investigado
- [ ] Marcar poder como usado

**Criterios de aceptación:**
- ✅ Puede ver objetivo completo de otro jugador
- ✅ Jugador investigado recibe notificación "Alguien te investigó"
- ✅ Poder usado solo una vez
- ✅ Información mostrada es correcta

**Testing manual:**
1. Obtener poder y usarlo
2. Seleccionar jugador
3. Ver su información
4. Verificar que jugador recibió notificación

---

### TASK-207: Poder Sicario
**Prioridad:** 🟠 ALTA
**Estimación:** 5 horas
**Dependencias:** TASK-204
**HU relacionadas:** HU-K22

**Subtareas:**
- [ ] Botón "Usar Poder Sicario"
- [ ] Modal para elegir nueva víctima
- [ ] API route `/api/power/sicario`
- [ ] Actualizar assignment del sicario
- [ ] NO heredar objetivo de víctima actual
- [ ] Enviar pista al nuevo objetivo: "Alguien te caza con [ARMA]"
- [ ] Marcar poder como usado

**Criterios de aceptación:**
- ✅ Sicario puede elegir su próxima víctima
- ✅ No hereda automáticamente
- ✅ Nuevo objetivo recibe pista sobre el arma
- ✅ Poder usado solo una vez

**Testing manual:**
1. Obtener poder Sicario
2. Elegir nueva víctima manualmente
3. Verificar que assignment cambió
4. Verificar que víctima recibió pista

---

### TASK-208: Historial de Asesinatos
**Prioridad:** 🟡 MEDIA
**Estimación:** 3 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-GM12

**Subtareas:**
- [ ] Componente `<KillHistory>`
- [ ] Query a tabla `events` filtrado por tipo 'kill'
- [ ] Mostrar: Asesino → Víctima (lugar + arma) + timestamp
- [ ] Orden cronológico (más reciente primero)
- [ ] Actualización en tiempo real

**Criterios de aceptación:**
- ✅ GameMaster ve todos los asesinatos
- ✅ Información clara y ordenada
- ✅ Se actualiza automáticamente
- ✅ Incluye timestamp

---

### TASK-209: Eliminar Jugador Manualmente (GameMaster)
**Prioridad:** 🟡 MEDIA
**Estimación:** 4 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-GM18

**Subtareas:**
- [ ] Botón "Eliminar" en lista de jugadores (dashboard GM)
- [ ] Modal de confirmación
- [ ] API route `/api/game/eliminate`
- [ ] Marcar jugador como muerto
- [ ] Su cazador hereda su objetivo
- [ ] Incrementar kill_count del cazador
- [ ] Crear evento tipo 'eliminated_by_gm'

**Criterios de aceptación:**
- ✅ GameMaster puede eliminar jugador
- ✅ Requiere confirmación
- ✅ Cazador hereda objetivo correctamente
- ✅ Se registra en historial

**Testing manual:**
1. Como GM, eliminar jugador
2. Verificar que queda marcado como muerto
3. Verificar herencia de objetivo
4. Ver en historial

---

### TASK-210: Ver Tiempo Restante
**Prioridad:** 🟡 MEDIA
**Estimación:** 3 horas
**Dependencias:** TASK-104
**HU relacionadas:** HU-K24

**Subtareas:**
- [ ] Campo `end_time` en configuración del juego
- [ ] Componente `<GameTimer>`
- [ ] Countdown visual en vista de jugador
- [ ] Actualización cada minuto
- [ ] Mostrar "Tiempo agotado" cuando termine

**Criterios de aceptación:**
- ✅ Jugadores ven tiempo restante
- ✅ Countdown es preciso
- ✅ Se actualiza automáticamente
- ✅ Alerta cuando queda poco tiempo

---

## 🎯 FASE 3: Agente de IA con Voz

### TASK-300: Integración ElevenLabs - Setup
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-000
**HU relacionadas:** HU-AI01, HU-AI02

**Subtareas:**
- [ ] Crear cuenta en ElevenLabs
- [ ] Obtener API key
- [ ] Instalar SDK de ElevenLabs
- [ ] Crear API route `/api/ai/voice`
- [ ] Configurar system prompt base
- [ ] Testear conexión

**Criterios de aceptación:**
- ✅ Conexión a ElevenLabs funcionando
- ✅ API key configurada
- ✅ System prompt definido

---

### TASK-301: Componente de Agente de Voz
**Prioridad:** 🟠 ALTA
**Estimación:** 6 horas
**Dependencias:** TASK-300
**HU relacionadas:** HU-K02

**Subtareas:**
- [ ] Componente `<VoiceAgent>`
- [ ] Botón "Hablar con IA"
- [ ] Integración con Web Speech API (micrófono)
- [ ] Capturar audio del usuario
- [ ] Enviar a ElevenLabs
- [ ] Reproducir respuesta en parlante
- [ ] Estados: idle, listening, processing, speaking
- [ ] UI atractiva y clara

**Criterios de aceptación:**
- ✅ Usuario puede presionar y hablar
- ✅ Audio se captura correctamente
- ✅ IA responde con voz
- ✅ Respuesta se reproduce
- ✅ Estados visuales claros

**Testing manual:**
1. Presionar botón
2. Hablar al micrófono
3. Verificar que IA procesa
4. Escuchar respuesta
5. Testear en iOS y Android

---

### TASK-302: System Prompt y Contexto del Agente
**Prioridad:** 🟠 ALTA
**Estimación:** 3 horas
**Dependencias:** TASK-301
**HU relacionadas:** HU-AI03, HU-AI04

**Subtareas:**
- [ ] Definir system prompt completo
- [ ] Incluir reglas del juego
- [ ] Incluir cómo funciona la app
- [ ] Explicación de personajes y poderes
- [ ] PROHIBIR revelar información privilegiada
- [ ] Testear con preguntas comunes
- [ ] Refinar respuestas

**Criterios de aceptación:**
- ✅ IA explica reglas correctamente
- ✅ IA explica cómo usar la app
- ✅ IA NO revela información secreta
- ✅ Respuestas son claras y útiles

**Testing manual:**
1. Preguntar "¿Cómo juego?"
2. Preguntar "¿Qué es un personaje especial?"
3. Preguntar "¿Quién es mi objetivo?" (debe rechazar)
4. Verificar calidad de respuestas

---

## 🎯 FASE 4: PWA y Optimizaciones

### TASK-400: Configuración PWA
**Prioridad:** 🟠 ALTA
**Estimación:** 4 horas
**Dependencias:** TASK-000

**Subtareas:**
- [ ] Crear `manifest.json`
- [ ] Configurar iconos (192x192, 512x512)
- [ ] Configurar colores y tema
- [ ] Configurar `next.config.js` para PWA
- [ ] Instalar `next-pwa`
- [ ] Testear instalación en mobile

**Criterios de aceptación:**
- ✅ App se puede instalar en iOS
- ✅ App se puede instalar en Android
- ✅ Iconos se ven correctamente
- ✅ Splash screen funciona

**Testing manual:**
1. Abrir en Safari (iOS)
2. "Agregar a pantalla de inicio"
3. Verificar que funciona
4. Repetir en Chrome (Android)

---

### TASK-401: Service Worker y Cache
**Prioridad:** 🟡 MEDIA
**Estimación:** 5 horas
**Dependencias:** TASK-400

**Subtareas:**
- [ ] Configurar service worker
- [ ] Cache de assets estáticos
- [ ] Estrategia "Network First" para datos
- [ ] Offline fallback básico
- [ ] Precache de reglas del juego

**Criterios de aceptación:**
- ✅ Assets se cachean correctamente
- ✅ App funciona parcialmente offline
- ✅ Reglas accesibles sin internet
- ✅ Datos se actualizan cuando hay conexión

---

### TASK-402: Notificaciones In-App (PWA)
**Prioridad:** 🟡 MEDIA
**Estimación:** 4 horas
**Dependencias:** TASK-111, TASK-400

**Subtareas:**
- [ ] Configurar vibración para notificaciones
- [ ] Configurar sonido personalizado
- [ ] Badge en ícono de notificaciones
- [ ] Testear en iOS (limitaciones)
- [ ] Testear en Android

**Criterios de aceptación:**
- ✅ Vibración funciona en mobile
- ✅ Sonido se reproduce
- ✅ Badge muestra contador
- ✅ Funciona en iOS (con limitaciones)

---

### TASK-403: Optimización Mobile
**Prioridad:** 🟡 MEDIA
**Estimación:** 4 horas
**Dependencias:** TASK-400

**Subtareas:**
- [ ] Revisar responsive design en todos los componentes
- [ ] Optimizar tamaños de fuente para mobile
- [ ] Optimizar touch targets (botones grandes)
- [ ] Prevenir zoom accidental
- [ ] Optimizar performance (bundle size)
- [ ] Lazy loading de componentes pesados

**Criterios de aceptación:**
- ✅ UI perfecta en pantallas 375px-430px
- ✅ Botones fáciles de presionar
- ✅ No hay zoom accidental
- ✅ Carga rápida (< 3 segundos)

---

## 🎯 FASE 5: Nice to Have (Si hay tiempo)

### TASK-500: Subir Fotos de Asesinatos
**Prioridad:** 🟢 BAJA
**Estimación:** 6 horas
**Dependencias:** TASK-108
**HU relacionadas:** HU-K28

**Subtareas:**
- [ ] Configurar Supabase Storage (buckets)
- [ ] Input de foto después de asesinato
- [ ] Comprimir imagen antes de subir
- [ ] API route `/api/upload/photo`
- [ ] Guardar URL en tabla `events`
- [ ] Mostrar foto en historial

---

### TASK-501: Galería de Fotos
**Prioridad:** 🟢 BAJA
**Estimación:** 3 horas
**Dependencias:** TASK-500
**HU relacionadas:** HU-GM28

**Subtareas:**
- [ ] Componente `<PhotoGallery>`
- [ ] Grid de fotos
- [ ] Lightbox para ver en grande
- [ ] Filtros (por jugador, por tiempo)

---

### TASK-502: Vista de Espectador (Jugadores Eliminados)
**Prioridad:** 🟢 BAJA
**Estimación:** 4 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-K25, HU-K26, HU-K27

**Subtareas:**
- [ ] Detectar cuando jugador está muerto
- [ ] Redirigir a `/game/[id]/spectator`
- [ ] Mostrar ranking
- [ ] Mostrar jugadores vivos
- [ ] Mostrar últimos eventos
- [ ] Deshabilitar acciones

---

### TASK-503: Ranking en Tiempo Real
**Prioridad:** 🟢 BAJA
**Estimación:** 3 horas
**Dependencias:** TASK-109
**HU relacionadas:** HU-GM17, HU-GM18

**Subtareas:**
- [ ] Componente `<Leaderboard>`
- [ ] Ordenar por kill_count
- [ ] Mostrar top 5
- [ ] Actualización en tiempo real
- [ ] Animaciones de cambio de posición

---

### TASK-504: Daga del Asesino (Arma Especial)
**Prioridad:** 🟢 BAJA
**Estimación:** 5 horas
**Dependencias:** TASK-108

**Subtareas:**
- [ ] Campo `has_dagger` en tabla `players`
- [ ] Mecánica de "encontrar" la daga (código/QR)
- [ ] Permitir asesinato sin restricciones con daga
- [ ] Uso único
- [ ] Notificación pública al usarse

---

## 📊 Resumen de Estimación

### Por Fase:
- **FASE 0 (Setup):** ~5 horas
- **FASE 1 (MVP Core):** ~55 horas
- **FASE 2 (Features Principales):** ~45 horas
- **FASE 3 (Agente IA):** ~13 horas
- **FASE 4 (PWA):** ~17 horas
- **FASE 5 (Nice to Have):** ~21 horas

### Total Estimado: ~156 horas

### Con 1 desarrollador a 6 horas/día: ~26 días
### Con 2 desarrolladores: ~13 días

---

## 🚀 Plan de Inicio Recomendado

### Semana 1 (Días 1-5):
- TASK-000: Setup
- TASK-001: Supabase
- TASK-100 a TASK-106: Sistema base hasta ver objetivo

**Milestone 1:** Jugadores pueden unirse y ver sus objetivos ✅

### Semana 2 (Días 6-10):
- TASK-107 a TASK-112: Asesinatos, herencia, dashboard GM

**Milestone 2:** Juego funcional básico (se puede jugar) ✅

### Semana 3 (Días 11-15):
- TASK-200 a TASK-210: Personajes especiales y poderes

**Milestone 3:** Features completas del juego ✅

### Semana 4 (Días 16-20):
- TASK-300 a TASK-302: Agente de IA
- TASK-400 a TASK-403: PWA

**Milestone 4:** Experiencia completa mobile + IA ✅

### Semana 5 (Opcional):
- TASK-500+: Nice to have según tiempo disponible

---

## ✅ Próximo Paso

**Empezar con TASK-000: Configuración del Entorno**

¿Listo para comenzar? 🚀

