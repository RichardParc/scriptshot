# Scriptshot — Phase 1

De la idea al rodaje. Fase 1: crear y listar proyectos, con persistencia real
en Supabase (no local storage) para que el dashboard sea el mismo desde
cualquier dispositivo.

## Qué incluye esta fase

- Dashboard con lista de proyectos
- Crear proyecto (nombre, formato, duración, idea)
- Página de proyecto (shell — historia/escenas llegan en Fase 2)
- Sistema visual oscuro base (colores, tipografía, componentes)

Fuera de alcance a propósito: historia/escenas, RODAJE, locaciones, IA,
autenticación, colaboración. Ver el prompt maestro del producto para el
roadmap completo por fases.

## Setup

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com) → New Project.
   - En el SQL Editor, pega y ejecuta el contenido de `supabase/schema.sql`.
   - En Project Settings → API, copia la `Project URL` y la `anon public key`.

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
