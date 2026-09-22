# Scriptshot — Fase 1 a 7

De la idea al rodaje. Fase 1: proyectos. Fase 2: editor de historia. Fase 3:
metadata de producción por escena. Fase 4: RODAJE por proyecto. Fase 5:
RODAJE global por locación. Fase 6: estado automático del proyecto.
Fase 7: tomas de oportunidad.

## Qué incluye

**Fase 7 — Tomas de oportunidad**
- `/oportunidades`: lista de capturas espontáneas, no ligadas a ningún
  proyecto necesariamente (descripción, tipo, locación, referencia, notas,
  y asociación opcional a un proyecto existente)
- Botón flotante "+ Oportunidad" dentro de RODAJE — abre un formulario
  corto sin salir de la pantalla de grabación, para capturar algo
  espontáneo sin perder el hilo de lo que se está filmando


**Fase 6 — Estado automático**
- El estado del proyecto (IDEA, EN PLANIFICACIÓN, LISTO PARA RODAJE, EN
  RODAJE, FALTAN TOMAS, FALTA VOZ EN OFF, LISTO PARA EDITAR) ya no se guarda
  manualmente — se calcula en `src/lib/status.ts` a partir de las escenas y
  la voz en off reales, cada vez que se muestra
- El progreso ("18/24 tomas", con barra) aparece en el dashboard y en la
  página del proyecto
- La columna `status` de la tabla `project` sigue existiendo (se usa como
  valor inicial al crear un proyecto) pero ya no se lee en ningún otro
  lado — toda la UI confía en el cálculo, no en ese campo


**Fase 1** — Dashboard con lista de proyectos, crear/eliminar proyecto

**Fase 2** — Bloques de historia, voz en off, escenas — crear, editar, reordenar

**Fase 3** — Metadata de producción por escena (cámara, ángulo, movimiento,
necesidades, referencia, postproducción, notas)

**Fase 4 — RODAJE** — `/project/[id]/rodaje`: modo pantalla completa, una
escena a la vez, con progreso y navegación ← →, GRABADA/REPETIR

**Fase 5 — RODAJE por locación** (el diferenciador clave del producto)
- La locación de cada escena ahora es un registro compartido (tabla
  `location`), no texto libre — se escribe con autocompletar y se crea
  automáticamente si no existe
- `/locaciones`: lista todas las locaciones con tomas pendientes, cuántos
  proyectos y cuántas tomas hay en cada una
- `/locaciones/[id]`: mismo modo RODAJE de Fase 4, pero mezclando las
  escenas pendientes de *todos* los proyectos que comparten esa locación

Todo persiste en Supabase en tiempo real.

Fuera de alcance a propósito: tomas de oportunidad (Fase 7), cálculo
automático de estado del proyecto (Fase 6), IA, autenticación,
colaboración. Ver el prompt maestro del producto para el roadmap completo.

**Simplificaciones conscientes sobre el prompt maestro:**
- El reordenamiento del editor usa botones ↑↓ en vez de arrastrar y soltar
- La búsqueda de locación usa un `<datalist>` nativo del navegador, sin
  componente de autocompletar custom

## Setup

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com) → New Project.
   - En el SQL Editor, corre en orden: `supabase/schema.sql`,
     `supabase/phase2.sql`, `supabase/phase3.sql`, `supabase/phase4.sql`,
     `supabase/phase5.sql`, `supabase/phase7.sql` (Fase 6 no agrega tablas).
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
