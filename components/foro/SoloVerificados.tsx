"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/foro/AuthProvider";
import { useVerificado } from "@/hooks/useVerificado";

/**
 * Envuelve lo que solo debe usarse con el correo confirmado.
 *
 * ES INTERFAZ, NO SEGURIDAD. Ocultar un botón no impide nada a quien sepa abrir
 * el inspector: la `anon key` va en el bundle y la API de Supabase está a un
 * `fetch` de distancia. Lo que de verdad bloquea la escritura son las políticas
 * RLS de la migración, que se evalúan en Postgres y no se pueden tocar desde el
 * cliente.
 *
 * Lo que sí aporta este componente es no dejar a nadie delante de un botón que
 * va a devolver un error, y explicarle por qué en vez de escondérselo sin más.
 * Los tres estados se tratan por separado a propósito:
 *
 *   - sin sesión            -> invitar a entrar
 *   - sesión sin confirmar  -> decir que revise el correo (el caso más
 *                              frustrante si no se explica: la cuenta existe,
 *                              parece que debería funcionar, y no funciona)
 *   - verificado            -> pasar
 */
export function SoloVerificados({
  children,
  variante = "aviso",
  accion = "participar en el foro",
}: {
  children: React.ReactNode;
  variante?: "aviso" | "oculto";
  accion?: string;
}) {
  const { verificado, pendienteDeConfirmar, cargando, correo } = useVerificado();
  const { reenviarConfirmacion } = useAuth();
  const [reenviando, setReenviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Mientras se resuelve la sesión no se decide: pintar el aviso aquí haría
  // parpadear «entra» a quien ya la tiene abierta.
  if (cargando) return <div className="esqueleto" style={{ height: 96 }} aria-hidden="true" />;

  if (verificado) return <>{children}</>;
  if (variante === "oculto") return null;

  if (pendienteDeConfirmar) {
    return (
      <div className="aviso aviso-oro">
        <h3>Confirma tu correo para {accion}</h3>
        <p>
          Te enviamos un enlace a <strong>{correo}</strong>. Ábrelo y vuelve aquí:
          podrás publicar, comentar y reaccionar de inmediato.
        </p>
        <p className="pista" style={{ marginTop: 8 }}>
          Mientras tanto puedes leer todo el foro con normalidad.
        </p>
        <div className="aviso-acciones">
          <button
            type="button"
            className="btn btn-fantasma"
            disabled={reenviando}
            onClick={async () => {
              setReenviando(true);
              const { error } = await reenviarConfirmacion();
              setAviso(error ?? "Te reenviamos el correo. Revisa también el spam.");
              setReenviando(false);
            }}
          >
            {reenviando ? "Enviando…" : "Reenviar el correo"}
          </button>
        </div>
        {aviso && (
          <p className="pista" style={{ marginTop: 10 }} role="status">
            {aviso}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="aviso">
      <h3>Entra para {accion}</h3>
      <p>
        Leer RED ASTRA es abierto. Para publicar, comentar o reaccionar hace falta
        una cuenta del colegio con el correo confirmado.
      </p>
      <div className="aviso-acciones">
        <Link href="/auth?modo=registro" className="btn btn-oro">
          Crear cuenta
        </Link>
        <Link href="/auth" className="btn btn-fantasma">
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  );
}
