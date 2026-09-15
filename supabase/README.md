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

4. **Copiar las claves** al proyecto: panel → *Project Settings* → *API*. Ver
   `.env.example` en la raíz. En local van en `.env.local`; en producción, en
   las variables del proyecto de Cloudflare — y hacen falta **en tiempo de
   compilación**, porque Next las incrusta en el bundle.

5. **Nombrar moderación**. El rol no se puede cambiar desde el sitio: la
   política `perfiles_actualizar_propio` lo bloquea a propósito, porque si no
   cualquiera se ascendería y podría borrar el foro y ver quién firma en
   anónimo. Se hace desde el *SQL Editor*:

   ```sql
   update public.perfiles set rol = 'moderador'
   where id = (select id from auth.users where email = 'quien@donbosco.edu.sv');
   ```

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
