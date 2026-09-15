-- ============================================================================
--  RED ASTRA — pruebas de las politicas de acceso
-- ============================================================================
--
--  Comprueban lo que la migracion promete. No son adorno: la comparacion de
--  `puede_ver_autor` estuvo escrita con `=` en lugar de `is not distinct from`,
--  y con eso la publicacion anonima salia FIRMADA ante los visitantes sin
--  sesion. Lo encontro la prueba "el visitante sin sesion ve Anónimo", que por
--  eso sigue aqui.
--
--  COMO EJECUTARLAS
--  ----------------
--  Contra un Postgres de usar y tirar (ver README de supabase/), en este orden:
--
--    psql -f pruebas/00_entorno.sql      -- simula el esquema auth de Supabase
--    psql -f migraciones/0001_red_astra.sql
--    psql -f pruebas/rls.sql
--
--  Todas las lineas de salida deben empezar por "ok". Una sola que diga
--  "FALLO EN LA PRUEBA" significa que el foro no tiene el control de acceso que
--  dice tener.
-- ============================================================================

\set QUIET on
\pset border 2

create or replace function pg_temp.espera_fallo(etiqueta text, sentencia text)
returns text language plpgsql as $$
begin
  execute sentencia;
  return format('FALLO EN LA PRUEBA  <- %s : la sentencia ENTRO y no debia', etiqueta);
exception when others then
  return format('ok [%s] %s', sqlstate, etiqueta);
end $$;

create or replace function pg_temp.espera_exito(etiqueta text, sentencia text)
returns text language plpgsql as $$
begin
  execute sentencia;
  return format('ok        %s', etiqueta);
exception when others then
  return format('FALLO EN LA PRUEBA  <- %s : rechazada con [%s] %s', etiqueta, sqlstate, sqlerrm);
end $$;

-- RLS no lanza error al editar o borrar lo ajeno: simplemente no encuentra la
-- fila. Lo que hay que comprobar es cuantas filas toco, y para eso hace falta
-- GET DIAGNOSTICS: un CTE que modifica datos no puede ir dentro de una
-- subconsulta, que es como estaba escrito antes y no compilaba.
create or replace function pg_temp.espera_filas(etiqueta text, sentencia text, esperado int)
returns text language plpgsql as $$
declare
  tocadas int;
begin
  execute sentencia;
  get diagnostics tocadas = row_count;
  if tocadas = esperado then
    return format('ok        %s', etiqueta);
  end if;
  return format('FALLO EN LA PRUEBA  <- %s : esperaba %s fila(s), toco %s', etiqueta, esperado, tocadas);
exception when others then
  return format('FALLO EN LA PRUEBA  <- %s : error [%s] %s', etiqueta, sqlstate, sqlerrm);
end $$;

create or replace function pg_temp.espera_igual(etiqueta text, obtenido text, esperado text)
returns text language plpgsql as $$
begin
  if obtenido is not distinct from esperado then
    return format('ok        %s', etiqueta);
  end if;
  return format('FALLO EN LA PRUEBA  <- %s : esperaba «%s», obtuvo «%s»', etiqueta, esperado, obtenido);
end $$;

-- ---------------------------------------------------------------------------
--  Datos de prueba. Como rol de servicio, igual que el panel de Supabase.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@donbosco.edu.sv',  now(), '{"full_name":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'beto@donbosco.edu.sv', null,  '{"full_name":"Beto"}'),
  ('33333333-3333-3333-3333-333333333333', 'cris@donbosco.edu.sv', now(), '{"full_name":"Cris"}'),
  ('44444444-4444-4444-4444-444444444444', 'dani@donbosco.edu.sv', now(), '{"full_name":"Dani"}')
on conflict (id) do nothing;

update public.perfiles set rol = 'moderador'
  where id = '33333333-3333-3333-3333-333333333333';

insert into public.publicaciones (id, autor_id, categoria_id, titulo, cuerpo, anonimo, estado) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   (select id from public.categorias where slug='carl-rogers'),
   'Publicacion firmada de Ana','Texto de una publicacion normal, con su firma.', false, 'publicado'),
  ('aaaaaaaa-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',
   (select id from public.categorias where slug='carl-rogers'),
   'Publicacion ANONIMA de Ana','Esto lo escribe Ana pero nadie debe saberlo.', true, 'publicado'),
  ('aaaaaaaa-0000-0000-0000-000000000003','44444444-4444-4444-4444-444444444444',
   (select id from public.categorias where slug='general'),
   'Publicacion oculta de Dani','La moderacion la retiro del foro.', false, 'oculto'),
  ('aaaaaaaa-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',
   (select id from public.categorias where slug='general'),
   'Publicacion oculta de Ana','Retirada, y Dani no debe verla.', false, 'oculto'),
  ('aaaaaaaa-0000-0000-0000-000000000005','44444444-4444-4444-4444-444444444444',
   (select id from public.categorias where slug='adn-salesiano'),
   'Publicacion visible de Dani','Esta si esta publicada y es suya.', false, 'publicado')
on conflict (id) do nothing;

insert into public.comentarios (id, publicacion_id, autor_id, cuerpo, anonimo) values
  ('cccccccc-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
   '44444444-4444-4444-4444-444444444444','Comentario firmado de Dani.', false),
  ('cccccccc-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111','Comentario anonimo de Ana.', true)
on conflict (id) do nothing;

\echo ''
\echo '=== 1. QUIEN PUEDE PUBLICAR ==='
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
  select pg_temp.espera_fallo('Beto (correo SIN confirmar) no puede publicar',
    $q$insert into public.publicaciones (autor_id, categoria_id, titulo, cuerpo)
       values ('22222222-2222-2222-2222-222222222222',
               (select id from public.categorias where slug='general'),
               'Publicacion de prueba','Esto no deberia entrar sin verificar.')$q$) as resultado;
  select pg_temp.espera_fallo('Beto tampoco puede comentar',
    $q$insert into public.comentarios (publicacion_id, autor_id, cuerpo)
       values ('aaaaaaaa-0000-0000-0000-000000000001',
               '22222222-2222-2222-2222-222222222222','Comentario sin verificar.')$q$) as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  select pg_temp.espera_exito('Ana (verificada) si puede publicar',
    $q$insert into public.publicaciones (autor_id, categoria_id, titulo, cuerpo)
       values ('11111111-1111-1111-1111-111111111111',
               (select id from public.categorias where slug='general'),
               'Publicacion de prueba','Contenido suficientemente largo.')$q$) as resultado;
  select pg_temp.espera_fallo('Ana no puede publicar firmando como Dani',
    $q$insert into public.publicaciones (autor_id, categoria_id, titulo, cuerpo)
       values ('44444444-4444-4444-4444-444444444444',
               (select id from public.categorias where slug='general'),
               'Suplantacion','Publicar en nombre de otra persona.')$q$) as resultado;
  select pg_temp.espera_fallo('Ana no puede crear una publicacion ya oculta',
    $q$insert into public.publicaciones (autor_id, categoria_id, titulo, cuerpo, estado)
       values ('11111111-1111-1111-1111-111111111111',
               (select id from public.categorias where slug='general'),
               'Nace oculta','Deberia rechazarse por la politica.','oculto')$q$) as resultado;
  select pg_temp.espera_fallo('Nadie comenta en una publicacion oculta',
    $q$insert into public.comentarios (publicacion_id, autor_id, cuerpo)
       values ('aaaaaaaa-0000-0000-0000-000000000003',
               '11111111-1111-1111-1111-111111111111','Comentando un hilo retirado.')$q$) as resultado;
  select pg_temp.espera_fallo('El titulo demasiado corto lo rechaza el check',
    $q$insert into public.publicaciones (autor_id, categoria_id, titulo, cuerpo)
       values ('11111111-1111-1111-1111-111111111111',
               (select id from public.categorias where slug='general'),
               'ab','Cuerpo suficientemente largo para pasar.')$q$) as resultado;
rollback;

\echo ''
\echo '=== 2. ESCALADA DE PRIVILEGIOS ==='
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  select pg_temp.espera_fallo('Ana no puede ascenderse a moderadora',
    $q$update public.perfiles set rol='moderador'
       where id='11111111-1111-1111-1111-111111111111'$q$) as resultado;
  select pg_temp.espera_exito('Ana si puede cambiar su propio nombre',
    $q$update public.perfiles set nombre='Ana Maria'
       where id='11111111-1111-1111-1111-111111111111'$q$) as resultado;
rollback;

\echo ''
\echo '=== 3. EDITAR Y BORRAR LO AJENO ==='
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_filas('Dani no puede editar la publicacion de Ana',
    $q$update public.publicaciones set titulo='Secuestrada'
       where id='aaaaaaaa-0000-0000-0000-000000000001'$q$, 0) as resultado;
  select pg_temp.espera_filas('Dani no puede borrar la publicacion de Ana',
    $q$delete from public.publicaciones
       where id='aaaaaaaa-0000-0000-0000-000000000001'$q$, 0) as resultado;
  select pg_temp.espera_filas('Dani si puede editar la suya publicada',
    $q$update public.publicaciones set titulo='Titulo corregido por Dani'
       where id='aaaaaaaa-0000-0000-0000-000000000005'$q$, 1) as resultado;
  -- Buscado: una vez la moderacion oculta algo, su autor ya no lo edita.
  select pg_temp.espera_fallo('Dani NO puede editar la suya que fue ocultada',
    $q$update public.publicaciones set titulo='Intento de reescribirla'
       where id='aaaaaaaa-0000-0000-0000-000000000003'$q$) as resultado;
  select pg_temp.espera_fallo('Dani NO puede devolver al foro lo ocultado',
    $q$update public.publicaciones set estado='publicado'
       where id='aaaaaaaa-0000-0000-0000-000000000003'$q$) as resultado;
  select pg_temp.espera_fallo('Dani no puede regalarle la autoria a Ana',
    $q$update public.publicaciones set autor_id='11111111-1111-1111-1111-111111111111'
       where id='aaaaaaaa-0000-0000-0000-000000000005'$q$) as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
  select pg_temp.espera_filas('La moderacion si puede ocultar la de Ana',
    $q$update public.publicaciones set estado='oculto'
       where id='aaaaaaaa-0000-0000-0000-000000000001'$q$, 1) as resultado;
  select pg_temp.espera_filas('...y devolverla al foro',
    $q$update public.publicaciones set estado='publicado'
       where id='aaaaaaaa-0000-0000-0000-000000000001'$q$, 1) as resultado;
  -- Lo que NO puede hacer ni la moderacion: colgarle a otro lo que dijo alguien.
  select pg_temp.espera_fallo('la MODERACION tampoco puede reasignar la autoria',
    $q$update public.publicaciones set autor_id='44444444-4444-4444-4444-444444444444'
       where id='aaaaaaaa-0000-0000-0000-000000000001'$q$) as resultado;
  select pg_temp.espera_fallo('...ni la de un comentario',
    $q$update public.comentarios set autor_id='44444444-4444-4444-4444-444444444444'
       where publicacion_id='aaaaaaaa-0000-0000-0000-000000000001'$q$) as resultado;
rollback;

\echo ''
\echo '=== 4. ANONIMATO: la tabla base no es legible ==='
begin;
  set local role anon;
  select pg_temp.espera_fallo('anon NO puede leer publicaciones.autor_id',
    $q$select autor_id from public.publicaciones$q$) as resultado;
  select pg_temp.espera_fallo('anon NO puede hacer select * sobre publicaciones',
    $q$select * from public.publicaciones$q$) as resultado;
  select pg_temp.espera_fallo('anon NO puede leer comentarios.autor_id',
    $q$select autor_id from public.comentarios$q$) as resultado;
  select pg_temp.espera_exito('anon SI puede leer la vista',
    $q$select 1 from public.publicaciones_con_metricas limit 1$q$) as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_fallo('con sesion TAMPOCO se lee publicaciones.autor_id',
    $q$select autor_id from public.publicaciones$q$) as resultado;
rollback;

\echo ''
\echo '=== 5. ANONIMATO: a quien se le enmascara el autor ==='
-- La prueba que encontro el fallo de la logica ternaria.
begin;
  set local role anon;
  select pg_temp.espera_igual('el visitante SIN SESION ve «Anónimo»',
    (select autor_nombre from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000002'), 'Anónimo') as resultado;
  select pg_temp.espera_igual('...y no recibe el autor_id',
    (select coalesce(autor_id::text,'(NULO)') from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000002'), '(NULO)') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_igual('otro estudiante ve «Anónimo»',
    (select autor_nombre from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000002'), 'Anónimo') as resultado;
  -- La oculta de ANA. La 003 no sirve para esto: su autor es el propio Dani,
  -- y el autor si debe ver lo suyo aunque este oculto.
  select pg_temp.espera_igual('...y la publicacion oculta AJENA no le aparece',
    (select count(*)::text from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000004'), '0') as resultado;
  select pg_temp.espera_igual('...pero la oculta PROPIA si la ve',
    (select count(*)::text from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000003'), '1') as resultado;
  select pg_temp.espera_igual('un comentario anonimo tambien sale como «Anónimo»',
    (select autor_nombre from public.comentarios_con_autor
     where id='cccccccc-0000-0000-0000-000000000002'), 'Anónimo') as resultado;
  select pg_temp.espera_igual('...y sin autor_id',
    (select coalesce(autor_id::text,'(NULO)') from public.comentarios_con_autor
     where id='cccccccc-0000-0000-0000-000000000002'), '(NULO)') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  select pg_temp.espera_igual('la AUTORA si se reconoce en su publicacion anonima',
    (select autor_nombre from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000002'), 'Ana') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
  select pg_temp.espera_igual('la autora tambien se reconoce en su comentario anonimo',
    (select autor_nombre from public.comentarios_con_autor
     where id='cccccccc-0000-0000-0000-000000000002'), 'Ana') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
  select pg_temp.espera_igual('la MODERACION ve quien firma la anonima',
    (select autor_nombre from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000002'), 'Ana') as resultado;
  select pg_temp.espera_igual('...y tambien ve las publicaciones ocultas',
    (select count(*)::text from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000003'), '1') as resultado;
rollback;

\echo ''
\echo '=== 6. REACCIONES Y GUARDADOS ==='
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_exito('Dani reacciona una vez',
    $q$insert into public.reacciones (publicacion_id, usuario_id)
       values ('aaaaaaaa-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444')$q$) as resultado;
  select pg_temp.espera_fallo('...y no puede inflar el contador repitiendo',
    $q$insert into public.reacciones (publicacion_id, usuario_id)
       values ('aaaaaaaa-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444')$q$) as resultado;
  select pg_temp.espera_fallo('Dani no puede reaccionar en nombre de Ana',
    $q$insert into public.reacciones (publicacion_id, usuario_id)
       values ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111')$q$) as resultado;
  select pg_temp.espera_igual('la vista cuenta esa reaccion',
    (select reacciones::text from public.publicaciones_con_metricas
     where id='aaaaaaaa-0000-0000-0000-000000000001'), '1') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  insert into public.guardados (usuario_id, publicacion_id)
    values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001');
  select pg_temp.espera_igual('Ana ve su propio guardado',
    (select count(*)::text from public.guardados), '1') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  insert into public.guardados (usuario_id, publicacion_id)
    values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001');
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_igual('Dani NO ve lo que guardo Ana',
    (select count(*)::text from public.guardados), '0') as resultado;
rollback;

\echo ''
\echo '=== 7. AVISO AUTOMATICO AL RESPONDER ==='
begin;
  set local role authenticated;
  -- Ana responde en ANONIMO a la publicacion de Dani. Se usa la 005 y no la
  -- 001 porque esta ultima ya trae comentarios en los datos base, y con ellos
  -- el conteo de avisos mediria el arrastre en vez de esta respuesta.
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  insert into public.comentarios (publicacion_id, autor_id, cuerpo, anonimo)
    values ('aaaaaaaa-0000-0000-0000-000000000005',
            '11111111-1111-1111-1111-111111111111','Respuesta anonima de Ana.', true);
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_igual('a Dani le llega el aviso de la respuesta',
    (select count(*)::text from public.notificaciones where tipo='respuesta'), '1') as resultado;
  -- El aviso no puede delatar a quien respondio de forma anonima.
  select pg_temp.espera_igual('el aviso NO nombra a quien respondio',
    (select bool_and(texto not like '%Ana%')::text from public.notificaciones where tipo='respuesta'), 'true') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  insert into public.comentarios (publicacion_id, autor_id, cuerpo)
    values ('aaaaaaaa-0000-0000-0000-000000000005',
            '44444444-4444-4444-4444-444444444444','Me respondo a mi mismo.');
  select pg_temp.espera_igual('nadie recibe aviso de su propio comentario',
    (select count(*)::text from public.notificaciones where tipo='respuesta'), '0') as resultado;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  select pg_temp.espera_fallo('nadie puede fabricarle un aviso a otro',
    $q$insert into public.notificaciones (usuario_id, tipo, texto)
       values ('11111111-1111-1111-1111-111111111111','moderacion','Aviso falso.')$q$) as resultado;
rollback;
