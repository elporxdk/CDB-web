"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/foro/AuthProvider";
import { useVerificado } from "@/hooks/useVerificado";

/**
 * Contraseña nueva, al llegar desde el enlace del correo.
 *
 * Cuando esta página carga, `detectSessionInUrl` del cliente de Supabase ya ha
 * canjeado el token del enlace por una sesión temporal. Por eso basta con
 * actualizar al usuario de la sesión abierta: no hay que manejar el token a
 * mano.
 *
 * Si no hay sesión, el enlace caducó o ya se usó, y se dice tal cual.
 */
export default function PaginaRestablecer() {
  const router = useRouter();
  const { cambiarContrasena } = useAuth();
  const { autenticado, cargando } = useVerificado();

  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (contrasena !== repetida) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    setError(null);
    const { error } = await cambiarContrasena(contrasena);
    setEnviando(false);
    if (error) setError(error);
    else {
      setListo(true);
      setTimeout(() => router.push("/foro"), 1800);
    }
  }

  return (
    <section className="auth">
      <div className="auth-caja">
        <h1>Contraseña nueva</h1>

        {cargando ? (
          <div className="esqueleto" style={{ height: 120 }} aria-busy="true" />
        ) : listo ? (
          <p>Contraseña cambiada. Te llevamos al foro…</p>
        ) : !autenticado ? (
          <>
            <p>
              Este enlace ya caducó o se usó antes. Pide otro desde la pantalla
              de entrada.
            </p>
            <Link href="/auth" className="btn btn-fantasma">
              Ir a entrar
            </Link>
          </>
        ) : (
          <form onSubmit={enviar}>
            <div className="auth-campo">
              <label className="etiqueta" htmlFor="nueva">
                Contraseña nueva
              </label>
              <input
                id="nueva"
                className="campo"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="auth-campo">
              <label className="etiqueta" htmlFor="repetir">
                Repítela
              </label>
              <input
                id="repetir"
                className="campo"
                type="password"
                value={repetida}
                onChange={(e) => setRepetida(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="aviso-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-oro"
              style={{ width: "100%", marginTop: 6 }}
              disabled={enviando}
            >
              {enviando ? "Guardando…" : "Guardar"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
