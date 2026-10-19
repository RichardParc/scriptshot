# Activar acceso privado en Scriptshot

El acceso por sesión ya está integrado en la app. La base actual todavía tiene políticas que permiten consultas anónimas; los datos no quedan protegidos hasta completar la migración.

## Orden de despliegue

1. En Supabase, agrega `https://scriptshot.vercel.app/auth/callback` a **Authentication → URL Configuration → Redirect URLs**. Si usas desarrollo local, agrega también `http://localhost:3000/auth/callback`.
2. Despliega el código de esta rama en Vercel. El login requiere que existan las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el entorno de producción.
3. Abre `/login`, crea la cuenta propietaria y confirma el correo si Supabase lo solicita. Mantén abierta esa sesión.
4. En Supabase, abre **Authentication → Users**, copia el UUID de esa cuenta y reemplaza `REPLACE_WITH_AUTH_USER_UUID` en `supabase/auth-ownership.sql`.
5. Ejecuta el archivo completo en **SQL Editor**. La transacción asigna los registros actuales a esa cuenta y reemplaza las políticas anónimas por políticas de propietario. No ejecutes el script con el UUID de otra cuenta: los registros actuales quedarán asignados a ese usuario.
6. Recarga Scriptshot y confirma que aparecen tus proyectos. En una ventana privada sin sesión, las rutas de la app deben llevar a `/login` y las consultas anónimas a las tablas deben quedar bloqueadas por RLS.
7. Si Scriptshot será de uso personal, desactiva los nuevos registros en **Authentication → Settings** después de crear la cuenta propietaria.

Hasta completar el paso 5, el acceso directo a Supabase con la clave pública sigue permitido por las políticas antiguas. La clave pública no es un secreto; la protección efectiva depende de RLS.
