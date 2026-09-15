# RED ASTRA — base de datos

El foro del sitio corre sobre [Supabase](https://supabase.com) (Postgres
gestionado). Aquí está el esquema, el control de acceso y sus pruebas.

```
supabase/
├── migraciones/0001_red_astra.sql   el esquema y TODO el control de acceso
└── pruebas/
    ├── 00_entorno.sql               simula el esquema `auth` de Supabase
    └── rls.sql                      45 comprobaciones de las políticas
```

## Dónde vive la seguridad

No hay servidor propio. El sitio habla directamente con la API de Supabase
usando la `anon key`, y esa clave **viaja en el bundle**: cualquiera puede
leerla con el inspector y llamar a la API a mano.

Por eso **las comprobaciones de React no protegen nada**. Sirven para no enseñar
botones que van a fallar. Lo único que de verdad impide publicar sin verificar,
editar lo ajeno o averiguar quién firmó en anónimo son las políticas RLS de
`migraciones/0001_red_astra.sql`.

Si esa migración no está aplicada, el foro **no tiene control de acceso**, por
mucho que la interfaz lo parezca.

## Puesta en marcha

1. **Crear el proyecto** en [supabase.com](https://supabase.com).

2. **Aplicar la migración**: panel → *SQL Editor* → pegar
   `migraciones/0001_red_astra.sql` → *Run*. Es idempotente: se puede volver a
   ejecutar sin romper nada.

3. **Configurar las URL de retorno**: panel → *Authentication* → *URL
   Configuration*. En *Redirect URLs* añadir:

   ```
   https://TU-DOMINIO/foro
   https://TU-DOMINIO/restablecer
   http://localhost:3000/foro
   http://localhost:3000/restablecer
   ```

   Sin esto, los enlaces de confirmación y de contraseña nueva llegan al sitio
   pero sin la sesión temporal, y no funcionan.

4. **Copiar las claves** al proyecto: panel → *Project Settings* → *API*. De
   ahí salen `Project URL` y la clave `anon` / `public`.

   Lo que hay que entender antes de pegarlas en ningún sitio: Next **incrusta**
   las variables `NEXT_PUBLIC_*` dentro del JavaScript durante `npm run build`.
   Es decir, **hacen falta en tiempo de compilación**, no de ejecución. Poner la
   clave solo en las variables de *runtime* del Worker no sirve de nada: el
   bundle ya se generó sin ella y el foro dirá que no está conectado.

   En local: `.env.local` (ver `.env.example`).

   En producción hay dos caminos, y los dos valen:

   **a) Variables de compilación de Cloudflare** (lo normal)

   Panel de Cloudflare → *Workers & Pages* → el Worker `cdb-web` → *Settings*.
   Ahí busca la sección de **Build** y, dentro, **«Build variables and
   secrets»**. Es una lista **distinta** de la de *Variables and Secrets* de
   runtime, y es la única que ve el `npm run build` que ejecuta Workers Builds.
   Añade las dos:

   ```
   NEXT_PUBLIC_SUPABASE_URL        https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY   eyJhbGciOi…  (la clave anon)
   ```

   Después hay que **volver a desplegar**: las variables se aplican en el
   siguiente build, no en el que ya pasó.

   **b) Versionarlas en el repositorio** (si el panel se hace bolas)

   Crear `.env.production` en la raíz con esas dos líneas y hacer commit. El
   `.gitignore` ya lo permite de forma explícita. No es una fuga: la clave
   `anon` **termina dentro del JavaScript que descarga cualquier visitante** de
   todas formas — se puede comprobar buscándola en el bundle después de
   compilar. Lo que nunca debe entrar ahí, ni en ningún sitio del repositorio,
   es la `service_role key`, que se salta RLS entera.

   Ventaja de (b): el despliegue no depende de que nadie recuerde configurar el
   panel. Ventaja de (a): rotar la clave no necesita un commit.

5. **Nombrar moderación**. El rol no se puede cambiar desde el sitio: la
   política `perfiles_actualizar_propio` lo bloquea a propósito, porque si no
   cualquiera se ascendería y podría borrar el foro y ver quién firma en
   anónimo. Se hace desde el *SQL Editor*:

   ```sql
   update public.perfiles set rol = 'moderador'
   where id = (select id from auth.users where email = 'quien@donbosco.edu.sv');
   ```

## Entrar por primera vez

Con los pasos de arriba hechos y el sitio redesplegado:

1. Ir a `/auth` → *Crear cuenta*, con nombre, correo y contraseña.
2. Supabase manda un correo de confirmación. **Hay que abrirlo**: hasta
   entonces la cuenta existe pero no puede publicar, porque la política
   `publicaciones_crear` exige `esta_verificado()`. La interfaz lo explica y
   ofrece reenviar el correo.
3. Volver al sitio y entrar. Ya se puede publicar, comentar y reaccionar.

### Si el correo no llega

Pasa a menudo, y no es un fallo del foro: el remitente que Supabase da por
defecto está **muy limitado** (unos pocos correos por hora para todo el
proyecto) y sus mensajes caen en spam con facilidad. Dos salidas:

- **Para probar ya**: confirmar la cuenta a mano desde el *SQL Editor*. Es
  exactamente lo que haría el enlace del correo:

  ```sql
  update auth.users set email_confirmed_at = now()
  where email = 'quien@donbosco.edu.sv';
  ```

- **Para abrirlo al colegio**: configurar un SMTP propio en *Authentication* →
  *Emails* → *SMTP Settings*. Sin eso, en cuanto se registren varios
  estudiantes seguidos, Supabase dejará de enviar por límite de envíos.

Si se prefiere no pedir confirmación de correo, se puede desactivar en
*Authentication* → *Sign In / Providers* → *Confirm email*. **Pero eso cambia
lo que significa «verificado»**: `esta_verificado()` pasaría a ser cierto para
cualquiera que se registre con un correo inventado, y el foro quedaría abierto
a cualquiera de fuera del colegio. Si se hace, conviene restringir los dominios
de correo permitidos.

## Cómo funciona el anonimato

RED ASTRA se prometió como un foro donde se puede preguntar sin firmar, y eso
condiciona el diseño entero.

`anonimo` **no borra el autor** de la fila: si lo borrara, la moderación no
podría responder de lo que se publica. Lo que se hace es que el autor **deje de
ser legible** para los demás, y eso se sostiene en dos piezas que van juntas:

- Las vistas `publicaciones_con_metricas` y `comentarios_con_autor` sustituyen
  el autor por `Anónimo` y `autor_id` por nulo. No es que la interfaz no lo
  pinte: **no se manda**.
- Al cliente **no se le concede permiso de lectura sobre la columna
  `autor_id`** de las tablas base. Sin eso, bastaría con consultar
  `publicaciones` directamente, saltándose la vista, y cruzar ese id con
  cualquier publicación firmada de la misma persona.

Por eso las vistas son `security definer` y no `security_invoker`, y por eso el
filtro de visibilidad está escrito en su `where`. **Si tocas una de esas vistas,
mantén ese `where`**: es el control de acceso de lectura del foro.

## Ejecutar las pruebas

Las pruebas no son adorno. Escribiendo esta migración encontraron tres fallos
reales que ya estaban puestos:

1. La comparación del autor usaba `=` en lugar de `is not distinct from`. Como
   `auth.uid()` es NULL sin sesión, `autor_id = NULL` da NULL y no falso, el
   `case` se iba por la rama `else`, y **la publicación anónima aparecía firmada
   justo ante quien no había iniciado sesión**.
2. El autor de una publicación que la moderación ocultaba **podía devolverla al
   foro él mismo** con un `update estado='publicado'`, las veces que quisiera:
   `with check` solo ve la fila nueva y no distingue «sigue publicada» de «acaba
   de resucitar». Lo arregla el trigger `congelar_pub`.
3. La moderación **podía reasignar la autoría** de una publicación o un
   comentario, es decir colgarle a alguien lo que dijo otro. Mismo trigger.

Para ejecutarlas hace falta un Postgres cualquiera (16 o superior); no hace
falta Supabase, porque `00_entorno.sql` simula lo justo de su esquema `auth`:

```bash
createdb red_astra_test
psql -d red_astra_test -f pruebas/00_entorno.sql
psql -d red_astra_test -f migraciones/0001_red_astra.sql
psql -d red_astra_test -f pruebas/rls.sql
```

Todas las líneas de salida deben empezar por `ok`. Una sola que diga
`FALLO EN LA PRUEBA` significa que el foro no tiene el control de acceso que
dice tener.
