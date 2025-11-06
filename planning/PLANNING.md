# 🏗️ Plan de Desarrollo - RucaKiller

## 🎯 Objetivo del Proyecto

Desarrollar una **PWA (Progressive Web App)** con Next.js para gestionar un juego de rol secreto tipo "Assassin" durante un fin de semana en una parcela con amigos.

---

## 🛠️ Stack Tecnológico

### Frontend:
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** (estilización)
- **React Hooks** (estado y efectos)
- **PWA** (Progressive Web App con service workers)

### Backend:
- **Supabase** (Backend as a Service)
  - PostgreSQL (base de datos)
  - Realtime (suscripciones en tiempo real)
  - Authentication (auth sin contraseñas, solo códigos)
  - Storage (buckets para fotos - v2.0)

### IA y Voz:
- **ElevenLabs API** (agente de voz conversacional)
- **Web Speech API** (reconocimiento de voz del navegador)

### Deployment:
- **Vercel** (hosting de Next.js con PWA)

---

## 🗄️ Arquitectura de Base de Datos (Supabase)

### Tablas Principales:

```sql
-- Tabla de partidas/juegos
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL, -- Código de 6 caracteres
  status VARCHAR(20) NOT NULL, -- 'lobby', 'assigning', 'active', 'paused', 'finished'
  game_master_id UUID NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de jugadores
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_alive BOOLEAN DEFAULT TRUE,
  is_game_master BOOLEAN DEFAULT FALSE,
  special_character VARCHAR(20), -- 'espia', 'detective', 'saboteador', null
  special_character_used BOOLEAN DEFAULT FALSE,
  power_2kills VARCHAR(20), -- 'asesino_serial', 'investigador', 'sicario', null
  power_2kills_used BOOLEAN DEFAULT FALSE,
  kill_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de asignaciones (quien persigue a quien)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  hunter_id UUID REFERENCES players(id) ON DELETE CASCADE,
  target_id UUID REFERENCES players(id) ON DELETE CASCADE,
  location VARCHAR(50) NOT NULL,
  weapon VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de lugares disponibles en el juego
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de armas disponibles en el juego
CREATE TABLE weapons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE, -- false si está en uso
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de eventos/asesinatos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL, -- 'kill', 'failed_attempt', 'power_used', 'special_used'
  killer_id UUID REFERENCES players(id),
  victim_id UUID REFERENCES players(id),
  location VARCHAR(50),
  weapon VARCHAR(50),
  confirmed BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR(255), -- v2.0
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id), -- null si es pública
  type VARCHAR(20) NOT NULL, -- 'public', 'private'
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de poderes disponibles (únicos por partida)
CREATE TABLE available_powers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  power_name VARCHAR(20) NOT NULL, -- 'asesino_serial', 'investigador', 'sicario'
  is_taken BOOLEAN DEFAULT FALSE,
  taken_by_player_id UUID REFERENCES players(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Flujo de Datos en Tiempo Real (Supabase Realtime)

### Suscripciones importantes:

**Para Jugadores (Killers):**
- Suscripción a `assignments` donde `hunter_id = player_id` → Recibir objetivo
- Suscripción a `notifications` donde `player_id = player_id` o `type = 'public'` → Notificaciones
- Suscripción a `games` donde `id = game_id` → Estado del juego (pausado, activo, etc)

**Para GameMaster:**
- Suscripción a `players` donde `game_id = game_id` → Ver todos los jugadores
- Suscripción a `events` donde `game_id = game_id` → Ver todos los eventos
- Suscripción a `assignments` donde `game_id = game_id` → Ver cadena completa

---

## 🎨 Estructura de Componentes (Next.js)

```
app/
├── layout.tsx (PWA manifest, providers globales)
├── page.tsx (Landing page)
├── lobby/
│   └── [code]/
│       └── page.tsx (Unirse a partida)
├── game/
│   └── [id]/
│       ├── page.tsx (Vista principal del jugador)
│       ├── dashboard/ (Vista GameMaster)
│       └── spectator/ (Vista para eliminados)
├── api/
│   ├── game/
│   │   ├── create/route.ts (Crear partida)
│   │   ├── join/route.ts (Unirse a partida)
│   │   └── assign/route.ts (Algoritmo de asignación circular)
│   ├── kill/
│   │   ├── attempt/route.ts (Intento de asesinato)
│   │   └── confirm/route.ts (Confirmar asesinato)
│   └── ai/
│       └── voice/route.ts (Proxy para ElevenLabs)
└── components/
    ├── KillerView.tsx
    ├── GameMasterDashboard.tsx
    ├── NotificationCenter.tsx
    ├── VoiceAgent.tsx
    ├── AssignmentCard.tsx
    ├── PlayerList.tsx
    ├── PowerSelector.tsx
    └── SpecialCharacterModal.tsx
```

---

## 🔐 Autenticación Simplificada

### **GameMaster (con PIN de seguridad):**
- Al crear una partida, el GameMaster ingresa su **nombre** y un **PIN** (4-6 dígitos)
- El PIN se hashea y se guarda en la tabla `games` (campo `game_master_pin`)
- Se genera un **session token** en localStorage
- Para volver a acceder a su partida, necesita: código de partida + PIN

### **Jugadores (sin autenticación):**
- Al unirse a un juego, el jugador solo ingresa su **nombre**
- Se genera un **session token** en localStorage
- El jugador se asocia a la partida mediante el **código de juego**

**Ventajas:**
- ✅ GameMaster protegido con PIN (evita que otros accedan a su cuenta)
- ✅ Jugadores sin fricción (no crear cuentas)
- ✅ Ideal para una fiesta (acceso rápido)
- ✅ Simple: PIN solo para GameMaster

**Desventajas:**
- ⚠️ Si cierran la app, pierden la sesión → Solución: guardar en localStorage
- ⚠️ GameMaster debe recordar su PIN (4-6 dígitos numéricos)

---

## 🧮 Algoritmo de Asignación Circular

```typescript
function generateCircularAssignments(players: Player[], locations: string[], weapons: Weapon[]) {
  // 1. Shuffle aleatorio de jugadores
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // 2. Crear cadena circular
  const assignments = [];
  for (let i = 0; i < shuffled.length; i++) {
    const hunter = shuffled[i];
    const target = shuffled[(i + 1) % shuffled.length]; // El último apunta al primero
    
    // 3. Asignar lugar y arma aleatorios
    const location = locations[Math.floor(Math.random() * locations.length)];
    const availableWeapon = weapons.find(w => w.is_available);
    
    assignments.push({
      hunter_id: hunter.id,
      target_id: target.id,
      location,
      weapon: availableWeapon.name
    });
    
    // Marcar arma como no disponible
    availableWeapon.is_available = false;
  }
  
  return assignments;
}
```

---

## 🎙️ Integración ElevenLabs (Agente de Voz)

### Flujo de Conversación:

1. Jugador presiona botón de "Hablar con IA"
2. Web Speech API captura audio del micrófono
3. Envía audio a ElevenLabs API
4. ElevenLabs procesa y responde con audio
5. Se reproduce la respuesta en el parlante del celular

### Contexto del Agente:

```typescript
const systemPrompt = `
Eres un asistente de RucaKiller, un juego de asesinatos secretos.
Tu objetivo es explicar las reglas y ayudar a los jugadores a entender cómo funciona la app.

NUNCA reveles información privilegiada como:
- Quién es el objetivo de otro jugador
- Qué personajes especiales tienen otros
- Estrategias específicas

Solo responde sobre:
- Reglas generales del juego
- Cómo usar la aplicación
- Explicación de poderes y personajes
- Casos de ejemplo
`;
```

---

## 📱 PWA Configuration

### manifest.json:
```json
{
  "name": "RucaKiller",
  "short_name": "RucaKiller",
  "description": "Juego de asesinatos secretos",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#ef4444",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker:
- Cache de assets estáticos
- Estrategia "Network First" para datos en tiempo real
- Offline fallback para reglas básicas

---

## 🎯 Fases de Desarrollo

### FASE 1 - MVP Core (Semana 1-2):
- ✅ Setup Next.js + Tailwind + Supabase
- ✅ Crear/unirse a partida (lobby)
- ✅ Algoritmo de asignación circular
- ✅ Vista del jugador (ver objetivo + condiciones)
- ✅ Validación de asesinato (honor system)
- ✅ Herencia de objetivo
- ✅ Dashboard básico del GameMaster

### FASE 2 - Features Principales (Semana 3):
- ✅ Notificaciones en tiempo real
- ✅ Personajes especiales (Espía, Detective, Saboteador)
- ✅ Poderes por 2 kills (Asesino Serial, Investigador, Sicario)
- ✅ Sistema de pausas
- ✅ Ranking y estadísticas

### FASE 3 - Agente de IA (Semana 4):
- ✅ Integración ElevenLabs
- ✅ Web Speech API para micrófono
- ✅ UI del agente conversacional
- ✅ Sistema de prompts y contexto

### FASE 4 - PWA y Optimizaciones (Semana 5):
- ✅ Configuración PWA completa
- ✅ Service Worker y cache
- ✅ Optimización mobile
- ✅ Testing en iOS y Android
- ✅ Manejo de offline

### FASE 5 - Nice to Have (Si hay tiempo):
- Daga del Asesino
- Subir fotos (Supabase Storage)
- Intentos fallidos + penitencias
- Eventos especiales del GM
- Galería de fotos

---

## 🧪 Estrategia de Testing

### Testing Manual (Primera Versión):
- ✅ Crear partida con 4-5 testers
- ✅ Validar cadena circular
- ✅ Probar asesinatos y herencias
- ✅ Verificar notificaciones
- ✅ Testear en iOS y Android

### Testing Automatizado (v2.0):
- Unit tests para algoritmo de asignación
- Integration tests para flujo de asesinato
- E2E tests con Playwright

---

## 🚀 Deployment

### Vercel:
- Deploy automático en cada push a `main`
- Preview deployments para PRs
- Variables de entorno para Supabase y ElevenLabs

### Supabase:
- Proyecto en plan gratuito (suficiente para 18 jugadores)
- Realtime habilitado
- Row Level Security (RLS) configurado

---

## 📊 Métricas de Éxito

**Funcionalidad mínima viable:**
- ✅ 18 jugadores pueden unirse sin problemas
- ✅ Asignación circular sin errores
- ✅ Asesinatos se validan correctamente
- ✅ Herencia de objetivos funciona
- ✅ GameMaster puede ver todo en tiempo real
- ✅ Agente de IA responde dudas correctamente

**Experiencia de usuario:**
- ✅ Carga inicial < 3 segundos
- ✅ Notificaciones llegan en < 1 segundo
- ✅ UI intuitiva (cualquiera entiende sin explicación)
- ✅ Funciona sin internet después de carga inicial (básico)

---

## 🔧 Consideraciones Técnicas

### Performance:
- Usar React.memo para evitar re-renders innecesarios
- Lazy loading de componentes pesados
- Optimizar queries de Supabase con índices

### Seguridad:
- RLS en Supabase para que jugadores solo vean su info
- GameMaster tiene rol especial con permisos ampliados
- Validar todos los inputs en el servidor

### Escalabilidad:
- Diseñado para 18 jugadores (límite hard)
- Realtime de Supabase soporta miles de conexiones
- Next.js scale horizontalmente en Vercel

---

## 🎨 Principios de Diseño

1. **Mobile First:** Todo debe verse perfecto en celulares
2. **The Simpler the Better:** No complicar la UI innecesariamente
3. **Logros Atómicos:** Cada feature debe ser testeable independientemente
4. **Progresivo:** Lanzar versión básica funcional, iterar después
5. **Confianza:** El juego se basa en honor system, la app solo facilita