"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/foro/Chip";
import { Compositor } from "@/components/foro/Compositor";
import { SoloVerificados } from "@/components/foro/SoloVerificados";
import { TarjetaPublicacion } from "@/components/foro/TarjetaPublicacion";
import { useVerificado } from "@/hooks/useVerificado";
import {
  obtenerCategorias,
  obtenerMisGuardados,
  obtenerMisReacciones,
  obtenerPerfil,
  obtenerPublicaciones,
  POR_PAGINA,
  type Categoria,
  type Orden,
  type Publicacion,
} from "@/lib/foro";
import { foroConfigurado } from "@/lib/supabase";

type Pestana = "todas" | "guardadas" | "mias";

const ORDENES: { id: Orden; etiqueta: string }[] = [
  { id: "recientes", etiqueta: "Recientes" },
  { id: "populares", etiqueta: "Con más estrellas" },
  { id: "interaccion", etiqueta: "Con más movimiento" },
];

export default function PaginaForo() {
  const { autenticado, usuarioId, cargando: cargandoSesion } = useVerificado();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [misReacciones, setMisReacciones] = useState<Set<string>>(new Set());
  const [misGuardados, setMisGuardados] = useState<Set<string>>(new Set());

  /**
   * Quién es moderador se guarda como «el id del que sabemos que lo es», y el
   * booleano se deriva. Guardar el booleano obligaría a ponerlo a false al
   * cerrar sesión desde un efecto, que es justo el setState síncrono que
   * encadena renders; así, al cambiar `usuarioId` el valor derivado ya es false
   * sin tocar nada.
   */
  const [idModerador, setIdModerador] = useState<string | null>(null);
  const esModerador = Boolean(usuarioId && idModerador === usuarioId);

  const [pestana, setPestana] = useState<Pestana>("todas");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("recientes");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaActiva, setBusquedaActiva] = useState("");
  const [pagina, setPagina] = useState(0);

  /**
   * Lista, contador, carga y error en un solo estado.
   *
   * Van juntos porque se escriben juntos, al terminar la petición, y eso permite
   * que `cargar` no toque el estado hasta después del primer `await`. Si lo
   * hiciera antes, llamarla desde un efecto sería un setState síncrono dentro
   * del efecto.
   */
  const [lista, setLista] = useState<{
    publicaciones: Publicacion[];
    total: number;
    cargando: boolean;
    error: string | null;
  }>({ publicaciones: [], total: 0, cargando: foroConfigurado, error: null });

  const { publicaciones, total, cargando, error } = lista;

  // Las categorías no cambian entre búsquedas: se piden una vez.
  useEffect(() => {
    if (!foroConfigurado) return;
    obtenerCategorias()
      .then(setCategorias)
      .catch((e) =>
        setLista((l) => ({ ...l, error: e instanceof Error ? e.message : String(e) }))
      );
  }, []);

  // El rol decide si se enseñan los botones de moderación. Quien de verdad
  // decide si funcionan es `es_moderador()` dentro de Postgres.
  useEffect(() => {
    if (!usuarioId) return;
    let vivo = true;
    obtenerPerfil(usuarioId)
      .then((p) => {
        if (vivo && p?.rol === "moderador") setIdModerador(usuarioId);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [usuarioId]);

  const cargar = useCallback(async () => {
    if (!foroConfigurado) return;

    try {
      // La pestaña de guardadas necesita primero la lista de ids; sin ese paso
      // no hay forma de filtrar por «lo mío» desde la vista. Y es además el
      // primer `await` de la función: a partir de aquí ya se puede tocar el
      // estado sin que sea síncrono respecto a quien la llamó.
      let ids: string[] | undefined;
      if (pestana === "guardadas") {
        const guardados = await obtenerMisGuardados();
        setMisGuardados(guardados);
        ids = [...guardados];
      }

      const { publicaciones: encontradas, total: cuantas } = await obtenerPublicaciones({
        categoriaId: categoriaId ?? undefined,
        busqueda: busquedaActiva,
        orden,
        pagina,
        ids,
        autorId: pestana === "mias" ? usuarioId ?? undefined : undefined,
      });

      setLista({ publicaciones: encontradas, total: cuantas, cargando: false, error: null });

      // Una sola petición para las reacciones de toda la página, en vez de una
      // por tarjeta.
      if (autenticado && encontradas.length > 0) {
        const idsPagina = encontradas.map((p) => p.id);
        const [reacciones, guardados] = await Promise.all([
          obtenerMisReacciones(idsPagina),
          obtenerMisGuardados(),
        ]);
        setMisReacciones(reacciones);
        setMisGuardados(guardados);
      }
    } catch (e) {
      setLista((l) => ({
        ...l,
        cargando: false,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, [categoriaId, busquedaActiva, orden, pagina, pestana, usuarioId, autenticado]);

  useEffect(() => {
    if (cargandoSesion) return;
    cargar();
  }, [cargar, cargandoSesion]);

  /**
   * Cambiar de filtro vuelve a la primera página y enseña el esqueleto.
   *
   * Se hace aquí, en el manejador, y no en un efecto que vigile los filtros:
   * un efecto que solo existe para corregir estado en respuesta a un clic
   * encadena un render de más, y es lo que React desaconseja. Además, quedarse
   * en la página 3 al cambiar de filtro dejaría una lista vacía.
   */
  function cambiarFiltro(aplicar: () => void) {
    aplicar();
    setPagina(0);
    setLista((l) => ({ ...l, cargando: true }));
  }

  function irAPagina(n: number) {
    setPagina(n);
    setLista((l) => ({ ...l, cargando: true }));
  }

  const porId = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias]
  );
  const ultimaPagina = Math.max(0, Math.ceil(total / POR_PAGINA) - 1);

  if (!foroConfigurado) return <FaltaConfigurar />;

  return (
    <section className="foro">
      <div className="wrap">
        <header className="foro-head">
          <p className="eyebrow">RED ASTRA</p>
          <h1>El foro del estudiantado</h1>
          <p className="foro-lede">
            Un espacio para pedir consejo, proponer y contar lo que pasa en el
            colegio, con moderación estudiantil. Leerlo es abierto; para escribir
            hace falta una cuenta con el correo confirmado. Puedes publicar sin
            firmar.
          </p>
        </header>

        <div className="foro-barra">
          <Chip activo={pestana === "todas"} onClick={() => cambiarFiltro(() => setPestana("todas"))}>
            Todas
          </Chip>
          {autenticado && (
            <>
              <Chip activo={pestana === "guardadas"} onClick={() => cambiarFiltro(() => setPestana("guardadas"))}>
                Guardadas
              </Chip>
              <Chip activo={pestana === "mias"} onClick={() => cambiarFiltro(() => setPestana("mias"))}>
                Mías
              </Chip>
            </>
          )}

          <form
            className="foro-buscador"
            onSubmit={(e) => {
              e.preventDefault();
              cambiarFiltro(() => setBusquedaActiva(busqueda));
            }}
          >
            <input
              className="campo"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en el foro…"
              aria-label="Buscar"
            />
            <button type="submit" className="btn btn-fantasma">
              Buscar
            </button>
          </form>
        </div>

        <div className="foro-barra">
          <Chip activo={categoriaId === null} onClick={() => cambiarFiltro(() => setCategoriaId(null))}>
            Todo el foro
          </Chip>
          {categorias.map((c) => (
            <Chip
              key={c.id}
              activo={categoriaId === c.id}
              onClick={() => cambiarFiltro(() => setCategoriaId(c.id))}
              titulo={c.descripcion ?? undefined}
            >
              {c.nombre}
            </Chip>
          ))}
        </div>

        <div className="foro-barra">
          {ORDENES.map((o) => (
            <Chip key={o.id} activo={orden === o.id} onClick={() => cambiarFiltro(() => setOrden(o.id))}>
              {o.etiqueta}
            </Chip>
          ))}
        </div>

        <div style={{ margin: "22px 0" }}>
          <SoloVerificados accion="publicar">
            {usuarioId && (
              <Compositor
                categorias={categorias}
                autorId={usuarioId}
                categoriaPreseleccionada={categoriaId ?? undefined}
                onPublicado={() => cambiarFiltro(() => setPestana("todas"))}
              />
            )}
          </SoloVerificados>
        </div>

        {error && (
          <p className="aviso-error" role="alert">
            {error}
          </p>
        )}

        {cargando ? (
          <div className="pub-lista" aria-busy="true">
            <div className="esqueleto" />
            <div className="esqueleto" />
            <div className="esqueleto" />
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="vacio">
            <strong>Aquí no hay nada todavía</strong>
            {pestana === "guardadas"
              ? "Lo que guardes aparecerá en esta pestaña."
              : pestana === "mias"
                ? "Cuando publiques algo, lo verás aquí."
                : busquedaActiva
                  ? `Ninguna publicación coincide con «${busquedaActiva}».`
                  : "Sé quien abra la primera conversación."}
          </div>
        ) : (
          <div className="pub-lista">
            {publicaciones.map((p) => (
              <TarjetaPublicacion
                key={p.id}
                publicacion={p}
                categoria={porId.get(p.categoria_id)}
                reaccionada={misReacciones.has(p.id)}
                guardada={misGuardados.has(p.id)}
                esModerador={esModerador}
                onCambio={cargar}
              />
            ))}
          </div>
        )}

        {total > POR_PAGINA && (
          <nav className="paginacion" aria-label="Paginación">
            <button
              type="button"
              className="btn btn-fantasma"
              onClick={() => irAPagina(Math.max(0, pagina - 1))}
              disabled={pagina === 0}
            >
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {ultimaPagina + 1}
            </span>
            <button
              type="button"
              className="btn btn-fantasma"
              onClick={() => irAPagina(Math.min(ultimaPagina, pagina + 1))}
              disabled={pagina >= ultimaPagina}
            >
              Siguiente
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

/**
 * Lo que se ve si el sitio está desplegado pero Supabase aún no está conectado.
 *
 * Es preferible a que la página reviente: el resto del sitio funciona, y quien
 * administra ve exactamente qué le falta.
 */
function FaltaConfigurar() {
  return (
    <section className="foro">
      <div className="wrap">
        <header className="foro-head">
          <p className="eyebrow">RED ASTRA</p>
          <h1>El foro todavía no está conectado</h1>
        </header>
        <div className="aviso aviso-oro">
          <h3>Faltan las variables de Supabase</h3>
          <p>
            Para que RED ASTRA funcione hay que crear un proyecto en Supabase,
            ejecutar <code>supabase/migraciones/0001_red_astra.sql</code> en su
            editor de SQL y definir estas dos variables:
          </p>
          <p className="pista" style={{ marginTop: 10 }}>
            <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </p>
          <p style={{ marginTop: 10 }}>
            En local van en <code>.env.local</code>; en producción, en las
            variables del proyecto de Cloudflare Workers. Los pasos completos
            están en <code>supabase/README.md</code>.
          </p>
          <div className="aviso-acciones">
            <Link href="/" className="btn btn-fantasma">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
