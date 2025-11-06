# 📋 Historias de Usuario - RucaKiller

Formato: **Yo como** `[tipo de usuario]` **quiero** `[funcionalidad]` **para** `[razón/beneficio]`

---

## 🎮 ROL: KILLER (Jugador Base)

### 📱 Onboarding y Pre-Juego

**HU-K01:** Yo como **Killer** quiero **unirme a una partida mediante un código** para poder participar en el juego sin necesidad de crear cuenta.

**HU-K02:** Yo como **Killer** quiero **hablar con un agente de IA por voz** para entender las reglas del juego antes de que comience.

**HU-K03:** Yo como **Killer** quiero **ver la lista de lugares y armas disponibles** para familiarizarme con los elementos del juego.

**HU-K04:** Yo como **Killer** quiero **ver cuántos jugadores están en el lobby** para saber cuándo estamos listos para empezar.

**HU-K05:** Yo como **Killer** quiero **recibir una notificación cuando el juego esté por comenzar** para estar preparado.

---

### 🎯 Durante el Juego

**HU-K06:** Yo como **Killer** quiero **ver el nombre de mi objetivo actual** para saber a quién debo asesinar.

**HU-K07:** Yo como **Killer** quiero **ver las condiciones de asesinato (lugar + arma)** para planificar mi estrategia.

**HU-K08:** Yo como **Killer** quiero **validar un asesinato mediante un botón "He asesinado"** para registrar mi kill cuando cumpla las condiciones.

**HU-K09:** Yo como **Killer** quiero **confirmar o rechazar cuando alguien me intenta asesinar** para validar si cumplió las condiciones correctamente.

**HU-K10:** Yo como **Killer** quiero **heredar automáticamente el objetivo de mi víctima** para continuar en el juego después de un asesinato exitoso.

**HU-K11:** Yo como **Killer** quiero **ver cuántos asesinatos llevo acumulados** para saber mi progreso y si puedo obtener poderes.

**HU-K12:** Yo como **Killer** quiero **recibir notificaciones cuando mi objetivo cambie** para estar siempre actualizado.

**HU-K13:** Yo como **Killer** quiero **ver notificaciones públicas del juego** para estar al tanto de eventos importantes (asesinatos, jugadores restantes, etc).

**HU-K14:** Yo como **Killer** quiero **saber si el juego está pausado o activo** para no intentar asesinatos fuera de las ventanas de tiempo.

---

### 🦸 Personajes Especiales

**HU-K15:** Yo como **Killer con personaje Espía** quiero **ver el nombre del objetivo de otro jugador (una vez)** para obtener información estratégica.

**HU-K16:** Yo como **Killer con personaje Detective** quiero **recibir una pista (lugar + arma) de un asesinato al azar** para poder deducir quién está involucrado.

**HU-K17:** Yo como **Killer con personaje Saboteador** quiero **cambiar una condición (lugar o arma) del objetivo de otro jugador** para dificultar o facilitar su misión sin que lo sepa.

**HU-K18:** Yo como **Killer** quiero **saber qué personaje especial tengo al inicio del juego** para planificar cuándo usar mi poder único.

---

### 🔪 Poderes por 2 Kills

**HU-K19:** Yo como **Killer con 2 kills** quiero **elegir un poder de los disponibles (Asesino Serial, Investigador, Sicario)** para obtener ventajas adicionales.

**HU-K20:** Yo como **Killer con poder Asesino Serial** quiero **asesinar sin restricción de lugar (solo con arma)** para tener más flexibilidad, aceptando que mi cazador también tiene esa ventaja.

**HU-K21:** Yo como **Killer con poder Investigador** quiero **ver el objetivo + condiciones de un jugador a elección** para conocer sus planes, sabiendo que esa persona será notificada.

**HU-K22:** Yo como **Killer con poder Sicario** quiero **elegir a mi próxima víctima manualmente** para no heredar automáticamente, aceptando que mi nuevo objetivo sabrá con qué arma lo cazaré.

**HU-K23:** Yo como **Killer** quiero **ver si un poder ya fue tomado por otro jugador** para saber qué opciones tengo disponibles al llegar a 2 kills.

---

### 📊 Estado del Juego

**HU-K24:** Yo como **Killer** quiero **ver el tiempo restante del juego** para ajustar mi estrategia según la urgencia.

**HU-K25:** Yo como **Killer eliminado** quiero **ver el estado del juego como espectador** para seguir disfrutando aunque ya no esté activo.

**HU-K26:** Yo como **Killer eliminado** quiero **ver el ranking actual (quién lleva más kills)** para saber quién va ganando.

**HU-K27:** Yo como **Killer eliminado** quiero **ver cuántos jugadores quedan vivos** para estimar qué tan cerca estamos del final.

---

### 📸 Extras (Baja Prioridad)

**HU-K28:** Yo como **Killer** quiero **subir una foto de mi asesinato** para guardar un recuerdo del momento.

---

## 👑 ROL: GAMEMASTER (Administrador)

### ⚙️ Configuración Pre-Juego

**HU-GM01:** Yo como **GameMaster** quiero **crear una nueva partida con un código único** para que los jugadores puedan unirse fácilmente.

**HU-GM02:** Yo como **GameMaster** quiero **configurar los lugares disponibles** para adaptar el juego a mi ubicación física (parcela).

**HU-GM03:** Yo como **GameMaster** quiero **configurar las armas disponibles** para que coincidan con los objetos físicos que tengo.

**HU-GM04:** Yo como **GameMaster** quiero **configurar las ventanas de tiempo (inicio, fin, pausas)** para controlar cuándo se puede jugar.

**HU-GM05:** Yo como **GameMaster** quiero **ver la lista de jugadores en el lobby** para saber quién se ha unido.

**HU-GM06:** Yo como **GameMaster** quiero **asignar personajes especiales aleatoriamente** para distribuir poderes de forma justa.

**HU-GM07:** Yo como **GameMaster** quiero **revisar la cadena circular de asignaciones** para asegurarme que todos tienen objetivo y cazador.

**HU-GM08:** Yo como **GameMaster** quiero **ajustar manualmente las asignaciones si es necesario** para balancear el juego o separar alianzas.

**HU-GM09:** Yo como **GameMaster** quiero **iniciar el juego cuando todos estén listos** para que cada jugador reciba su objetivo y condiciones.

---

### 📊 Monitoreo Durante el Juego

**HU-GM10:** Yo como **GameMaster** quiero **ver un dashboard con el estado de todos los jugadores** para monitorear el juego en tiempo real.

**HU-GM11:** Yo como **GameMaster** quiero **ver la cadena de objetivos actual (quién persigue a quién)** para entender la dinámica del juego.

**HU-GM12:** Yo como **GameMaster** quiero **ver el historial de asesinatos** para conocer el orden de los eventos.

**HU-GM13:** Yo como **GameMaster** quiero **ver intentos de asesinato fallidos** para saber quién está teniendo problemas.

**HU-GM14:** Yo como **GameMaster** quiero **ver qué jugadores tienen personajes especiales y si ya usaron sus poderes** para tener contexto completo.

**HU-GM15:** Yo como **GameMaster** quiero **ver qué jugadores tienen poderes de 2 kills** para entender las ventajas actuales.

**HU-GM16:** Yo como **GameMaster** quiero **ver estadísticas en tiempo real (jugadores vivos, kills totales, etc)** para narrar el estado del juego.

**HU-GM17:** Yo como **GameMaster** quiero **ver el ranking actual (quién lleva más kills)** para saber quién va ganando.

**HU-GM18:** Yo como **GameMaster** quiero **ver cuántos jugadores quedan vivos** para estimar qué tan cerca estamos del final.

---

### 🎛️ Control del Juego

**HU-GM19:** Yo como **GameMaster** quiero **pausar y reanudar el juego** para gestionar pausas de comida o actividades grupales.

**HU-GM20:** Yo como **GameMaster** quiero **eliminar manualmente a un jugador** para gestionar abandonos o situaciones especiales.

**HU-GM21:** Yo como **GameMaster** quiero **cambiar las condiciones (lugar/arma) de un jugador específico** para intervenir en casos de deadlock.

**HU-GM22:** Yo como **GameMaster** quiero **revocar un poder especial si está causando problemas** para mantener el balance del juego.

**HU-GM23:** Yo como **GameMaster** quiero **resolver disputas de asesinatos manualmente** para tomar la decisión final cuando hay desacuerdo.

**HU-GM24:** Yo como **GameMaster** quiero **activar eventos especiales** para dinamizar el juego cuando haya ciclos o estancamiento.

**HU-GM25:** Yo como **GameMaster** quiero **enviar notificaciones públicas personalizadas** para comunicar eventos o pistas (ej: Daga del Asesino).

**HU-GM26:** Yo como **GameMaster** quiero **finalizar el juego manualmente** para terminar cuando lo considere apropiado.

---

### 📸 Validación (Baja Prioridad)

**HU-GM27:** Yo como **GameMaster** quiero **ver las fotos de asesinatos subidas** para validar que cumplan las condiciones.

**HU-GM28:** Yo como **GameMaster** quiero **ver la galería de fotos de asesinatos** para revivir los mejores momentos del juego.

---

### 🏆 Final del Juego

**HU-GM29:** Yo como **GameMaster** quiero **ver el ranking final con estadísticas detalladas** para determinar al ganador.

**HU-GM30:** Yo como **GameMaster** quiero **compartir el podio y mejores momentos** para la ceremonia de premiación.

**HU-GM31:** Yo como **GameMaster** quiero **descargar las fotos y estadísticas del juego** para conservar los recuerdos.

---

## 🤖 ROL: AGENTE DE IA (ElevenLabs)

**HU-AI01:** Yo como **Agente de IA** quiero **responder preguntas sobre las reglas del juego** para ayudar a los jugadores a entender la mecánica.

**HU-AI02:** Yo como **Agente de IA** quiero **explicar cómo funciona la aplicación** para que los jugadores sepan usar todas las features.

**HU-AI03:** Yo como **Agente de IA** quiero **aclarar dudas sobre personajes especiales y poderes** para que los jugadores aprovechen sus habilidades.

**HU-AI04:** Yo como **Agente de IA** quiero **NO revelar información privilegiada del juego** para mantener la integridad y el misterio.

---

## 📊 Resumen de Prioridades

### ⚡ MUST HAVE (v1.0):
**Killer:** HU-K01 a HU-K14, HU-K18 a HU-K24
**GameMaster:** HU-GM01 a HU-GM20, HU-GM26, HU-GM29
**IA:** HU-AI01 a HU-AI04

### 🌟 NICE TO HAVE (v2.0):
**Killer:** HU-K15 a HU-K17, HU-K25 a HU-K28
**GameMaster:** HU-GM21 a HU-GM25, HU-GM27, HU-GM28, HU-GM30, HU-GM31

---

## 📈 Estimación Total

- **Historias MUST HAVE:** ~47 historias
- **Historias NICE TO HAVE:** ~15 historias
- **Total:** 62 historias de usuario