# Scriptshot — Fase 1 a 4

De la idea al rodaje. Fase 1: proyectos. Fase 2: editor de historia. Fase 3:
metadata de producción por escena. Fase 4: RODAJE (modo de grabación).

## Qué incluye

**Fase 1**
- Dashboard con lista de proyectos, crear/eliminar proyecto

**Fase 2**
- Bloques de historia, voz en off, escenas — crear, editar, reordenar

**Fase 3**
- Metadata de producción por escena (cámara, ángulo, movimiento, locación,
  necesidades, referencia, postproducción, notas)

**Fase 4 — RODAJE**
- Ruta `/project/[id]/rodaje`: modo pantalla completa, una escena a la vez
- Contador de progreso (ej. 04/18) y barra de avance
- Cada escena muestra su descripción y toda su metadata de producción
- Botones grandes: ← Anterior / Siguiente →, GRABADA, REPETIR
- Marcar GRABADA avanza automáticamente a la siguiente escena pendiente
- Diseñado mobile-first: una escena por pantalla, texto y controles grandes

Todo persiste en Supabase en tiempo real.

Fuera de alcance a propósito: RODAJE global por locación (Fase 5), tomas de
oportunidad (Fase 7), cálculo automático de estado del proyecto (Fase 6),
IA, autenticación, colaboración. Ver el prompt maestro del producto para el
roadmap completo.

**Simplificación consciente sobre el prompt maestro:** el reordenamiento
del editor usa botones ↑↓ en vez de arrastrar y soltar (evita la
dependencia de dnd-kit por ahora).

## Setup

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com) → New Project.
   - En el SQL Editor, corre en orden: `supabase/schema.sql`,
     `supabase/phase2.sql`, `supabase/phase3.sql`, `supabase/phase4.sql`.
   - En Project Settings → Data API, copia el Project URL. En Project
     Settings → API Keys, copia la anon/publishable key.

2. **Variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con
   los valores del paso anterior.

3. **Instalar y correr localmente**
   ```bash
   npm install
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000).

## Deploy (GitHub → Vercel)

1. Sube este proyecto a un repo de GitHub.
2. En [vercel.com](https://vercel.com), importa el repo.
3. En la configuración del proyecto en Vercel, agrega las mismas dos
   variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Cada push a la rama principal vuelve a desplegar automáticamente.

## Notas de arquitectura

- **Sin auth todavía.** La tabla `project` usa la `anon key` directamente,
  con una política de RLS abierta. Es un trade-off consciente de la Fase 1
  (uso personal, un solo dueño implícito) — se cierra cuando llegue la fase
  de autenticación/colaboración.
- **`status` es manual por ahora.** El cálculo automático de estado
  (sección 34/35 del prompt maestro: LISTO PARA EDITAR, FALTAN TOMAS, etc.)
  depende de escenas y voz en off, que llegan en fases posteriores.
- **Sin Dexie/IndexedDB.** Se decidió deliberadamente ir remote-first desde
  esta fase (Supabase/Postgres) en vez de local-first, porque la promesa
  central del producto (mismo shot list en laptop y en el celular durante
  el rodaje) no es alcanzable con almacenamiento solo-en-navegador.
