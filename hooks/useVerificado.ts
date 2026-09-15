import { useAuth } from "@/components/foro/AuthProvider";

/**
 * Estado de verificación del usuario actual.
 *
 * «Verificado» = tener el correo confirmado. Se lee de
 * `usuario.email_confirmed_at`, el mismo campo que consulta la función
 * `esta_verificado()` de Postgres, para que interfaz y base de datos no puedan
 * discrepar.
 *
 * ADVERTENCIA IMPORTANTE
 * ----------------------
 * Este hook NO protege nada. Vive en el navegador, y el navegador es del
 * visitante: el valor sale del JWT que guarda el propio cliente y se puede
 * manipular con el inspector abierto, o ignorar por completo llamando a la API
 * de Supabase a mano con la `anon key` que va en el bundle.
 *
 * Sirve para no enseñar un botón que va a fallar, y para explicar por qué. Lo
 * que de verdad impide publicar sin verificar son las políticas RLS de
 * `supabase/migraciones/0001_red_astra.sql`. Si alguien fuerza este valor a
 * `true`, la interfaz le dejará escribir el formulario y Postgres rechazará el
 * INSERT: exactamente el comportamiento que se busca.
 */
export type EstadoVerificacion = {
  /** Hay sesión abierta. */
  autenticado: boolean;
  /** Hay sesión Y el correo está confirmado. */
  verificado: boolean;
  /** Sesión abierta pero correo sin confirmar: el caso que hay que explicar. */
  pendienteDeConfirmar: boolean;
  /** Todavía se está resolviendo la sesión; no decidir nada aún. */
  cargando: boolean;
  usuarioId: string | null;
  correo: string | null;
};

export function useVerificado(): EstadoVerificacion {
  const { usuario, cargando } = useAuth();

  const autenticado = Boolean(usuario);
  const verificado = Boolean(usuario?.email_confirmed_at);

  return {
    autenticado,
    verificado,
    pendienteDeConfirmar: autenticado && !verificado,
    cargando,
    usuarioId: usuario?.id ?? null,
    correo: usuario?.email ?? null,
  };
}
