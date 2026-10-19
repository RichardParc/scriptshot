# Scriptshot

Scriptshot organiza el proceso de creación audiovisual desde la idea hasta el rodaje. Es una aplicación web personal con proyectos, editor narrativo, lista de tomas, rodaje por proyecto y locación, y capturas de oportunidad.

## Estado actual

El producto cubre el alcance funcional de las fases 1 a 7 del roadmap:

- **Proyectos:** crear, editar, buscar, ordenar y organizar en carpetas.
- **Historia y voz en off:** bloques editables, varias voces por bloque, estado de grabación y reordenamiento.
- **Escenas:** descripción, voz en off relacionada, cámara, ángulo, movimiento, locación, necesidades, referencia URL, postproducción y notas.
- **RODAJE por proyecto:** navegación escena por escena, progreso y estados pendiente, grabada y repetir.
- **RODAJE por locación:** reúne las tomas aún no grabadas de distintos proyectos en una misma locación.
- **Estados del proyecto:** se calculan en `src/lib/status.ts` a partir de escenas y voces en off; no son editables manualmente.
- **Tomas de oportunidad:** lista general, asociación opcional a proyectos y captura rápida desde RODAJE.
- **Configuración:** presets editables para tipos de plano, ángulos, movimientos, necesidades y tipos de oportunidad.

La aplicación guarda los cambios en Supabase/PostgreSQL. No usa sincronización en tiempo real por suscripción: las páginas consultan los datos al cargarse y las ediciones se escriben al guardar cada campo o acción.

## Stack

- Next.js 15 con App Router
- React 19 y TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- `@dnd-kit` para reordenamiento accesible con teclado

## Configuración local

1. Crea un proyecto en Supabase.
2. En el SQL Editor, ejecuta una vez y en este orden:

   `supabase/schema.sql` → `supabase/phase2.sql` → `supabase/phase3.sql` → `supabase/phase4.sql` → `supabase/phase5.sql` → `supabase/phase7.sql` → `supabase/folders.sql` → `supabase/settings.sql`

   La fase 6 solo calcula estados en la aplicación y no añade tablas.
3. Copia `.env.local.example` a `.env.local` y configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los datos de tu proyecto Supabase.
4. Instala dependencias y arranca el servidor:

   ```bash
   npm install
   npm run dev
   ```

   Abre `http://localhost:3000`.

## Datos y seguridad

La app usa la clave pública de Supabase desde el navegador. Las políticas actuales permiten acceso completo a esa clave y **no hay autenticación ni separación de datos por usuario**. Esto sirve únicamente para una instancia privada de uso personal; cualquier persona que consiga la URL y la clave pública podría leer, cambiar o borrar datos.

Antes de publicar la aplicación para otras personas o guardar datos que deban ser privados, hay que implementar autenticación y políticas RLS ligadas al usuario propietario. No se debe intentar ocultar la clave pública: la protección debe estar en las políticas de la base de datos.

Las referencias visuales actualmente se guardan como URL. La app todavía no sube archivos a Supabase Storage.

## Despliegue

El proyecto está preparado para el flujo GitHub → Vercel. Configura las mismas variables de entorno en Vercel. Mantén el despliegue privado hasta resolver autenticación y políticas de acceso.

## Siguiente trabajo recomendado

La prioridad inmediata es validar el flujo de rodaje y el manejo de guardados en móvil. Después, antes de compartir la aplicación, implementar autenticación y acceso por propietario. El roadmap restante —archivos de referencia, colaboración e IA— debe abordarse solo cuando sea necesario y aprobado.
