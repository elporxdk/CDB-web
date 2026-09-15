import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el navegador.
 *
 * Las dos variables son `NEXT_PUBLIC_*` porque tienen que llegar al navegador:
 * quien habla con Supabase es el propio cliente, no un servidor nuestro. Eso
 * significa que la `anon key` viaja en el bundle y cualquiera puede leerla. Es
 * lo esperado y no es una fuga: esa clave no da mas permiso que el del rol
 * `anon`, y quien decide lo que ese rol puede hacer son las politicas RLS de
 * `supabase/migraciones/0001_red_astra.sql`.
 *
 * Lo que NUNCA debe acabar aqui es la `service_role key`, que se salta RLS
 * entera. Esa se queda en el panel de Supabase.
 *
 * POR QUE NO SE LANZA UN ERROR AL IMPORTAR
 * ----------------------------------------
 * La tentacion es hacer `throw` si faltan las variables, y asi estaba en el
 * proyecto del que viene este foro. Aqui no sirve: las paginas se prerenderizan
 * durante `next build`, el modulo se evalua en ese momento, y un `throw`
 * tumbaria la compilacion entera del sitio -- incluida la portada, que no tiene
 * nada que ver con el foro. Con lo cual, por no haber configurado todavia
 * Supabase, se caeria el despliegue de todo.
 *
 * En vez de eso el modulo se deja importar siempre, y es la interfaz la que
 * avisa: `foroConfigurado` es false y el foro explica que falta configurarlo.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Si el foro puede funcionar. Falso mientras no esten puestas las variables. */
export const foroConfigurado = Boolean(url && anonKey);

let cliente: SupabaseClient | null = null;

/**
 * Devuelve el cliente, creandolo la primera vez.
 *
 * Es perezoso a proposito: asi el cliente solo se construye cuando alguien va a
 * usar el foro de verdad, ya en el navegador, y no al evaluar el modulo durante
 * la compilacion.
 */
export function obtenerSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Cópialas del panel de Supabase (Project Settings → API) al archivo .env.local, " +
        "y en Cloudflare a las variables del proyecto."
    );
  }

  cliente ??= createClient(url, anonKey, {
    auth: {
      // Mantiene la sesion guardada en localStorage y la refresca sola.
      persistSession: true,
      autoRefreshToken: true,
      // Necesario para que el enlace de confirmacion del correo y el de
      // restablecer contrasena canjeen su token al aterrizar en el sitio.
      detectSessionInUrl: true,
    },
  });

  return cliente;
}
