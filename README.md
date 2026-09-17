# Scriptshot — Fase 1 + Fase 2

De la idea al rodaje. Fase 1: crear y listar proyectos, con persistencia real
en Supabase. Fase 2: editor de historia — bloques de historia, voz en off y
escenas.

## Qué incluye

**Fase 1**
- Dashboard con lista de proyectos, crear/eliminar proyecto
- Sistema visual oscuro base

**Fase 2**
- Bloques de historia: crear, renombrar, eliminar, reordenar (↑↓)
- Voz en off por bloque: texto + estado GRABADA/PENDIENTE, reordenable
- Escenas por bloque: descripción de qué grabar, reordenable
- Todo persiste en Supabase en tiempo real (autosave al perder foco / al
  cambiar estado)

Fuera de alcance a propósito: metadata de producción por escena (cámara,
ángulo, movimiento, locación...) — eso es Fase 3. RODAJE, locaciones, IA,
autenticación, colaboración — fases posteriores. Ver el prompt maestro del
producto para el roadmap completo.

**Simplificación consciente sobre el prompt maestro:** el reordenamiento usa
botones ↑↓ en vez de arrastrar y soltar (evita la dependencia de dnd-kit por
ahora). Se puede migrar a drag & drop real más adelante si hace falta.

## Setup

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com) → New Project.
   - En el SQL Editor, corre `supabase/schema.sql` primero, y luego
     `supabase/phase2.sql`.
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
