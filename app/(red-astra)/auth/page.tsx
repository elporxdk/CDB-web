"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/foro/AuthProvider";
import { useVerificado } from "@/hooks/useVerificado";
import { foroConfigurado } from "@/lib/supabase";

/**
 * Entrar y crear cuenta.
 *
 * `useSearchParams` obliga a envolver en <Suspense>: durante el prerenderizado
 * no se conocen los parámetros de la URL, y sin el límite de suspense Next no
 * puede generar la página.
 */
export default function PaginaAuth() {
  return (
    <Suspense fallback={<section className="auth" aria-busy="true" />}>
      <Formulario />
    </Suspense>
  );
}

type Modo = "entrar" | "registro" | "olvido";

function Formulario() {
  const router = useRouter();
  const parametros = useSearchParams();
  const { entrar, registrarse, pedirRestablecer } = useAuth();
  const { autenticado, cargando: cargandoSesion } = useVerificado();

  const [modo, setModo] = useState<Modo>(
    parametros.get("modo") === "registro" ? "registro" : "entrar"
  );
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Quien ya tiene sesión no pinta nada en esta página.
  useEffect(() => {
    if (!cargandoSesion && autenticado) router.replace("/foro");
  }, [autenticado, cargandoSesion, router]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setAviso(null);

    if (modo === "olvido") {
      const { error } = await pedirRestablecer(correo);
      setEnviando(false);
      // El mensaje es el mismo exista o no la cuenta: si se distinguiera, este
      // formulario serviría para averiguar quién tiene cuenta en el colegio.
      if (error) setError(error);
      else setAviso("Si ese correo tiene cuenta, le llegará un enlace para cambiar la contraseña.");
      return;
    }

    if (modo === "registro") {
      const { error } = await registrarse(correo, contrasena, nombre.trim());
      setEnviando(false);
      if (error) setError(error);
      else setAviso(`Cuenta creada. Te enviamos un enlace de confirmación a ${correo}: ábrelo para poder publicar.`);
      return;
    }

    const { error } = await entrar(correo, contrasena);
    setEnviando(false);
    if (error) setError(error);
    else router.push("/foro");
  }

  if (!foroConfigurado) {
    return (
      <section className="auth">
        <div className="auth-caja">
          <h1>Las cuentas no están conectadas</h1>
          <p>
            Faltan las variables de Supabase. Los pasos están en{" "}
            <code>supabase/README.md</code>.
          </p>
          <Link href="/" className="btn btn-fantasma">
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth">
      <div className="auth-caja">
        <h1>
          {modo === "registro"
            ? "Crear cuenta"
            : modo === "olvido"
              ? "Recuperar la contraseña"
              : "Entrar a RED ASTRA"}
        </h1>
        <p>
          {modo === "olvido"
            ? "Te mandamos un enlace para poner una contraseña nueva."
            : "Leer el foro es abierto. Publicar, comentar y reaccionar necesita cuenta con el correo confirmado."}
        </p>

        {modo !== "olvido" && (
          <div className="auth-pestanas">
            <button
              type="button"
              className={`chip ${modo === "entrar" ? "is-active" : ""}`}
              onClick={() => setModo("entrar")}
            >
              Ya tengo cuenta
            </button>
            <button
              type="button"
              className={`chip ${modo === "registro" ? "is-active" : ""}`}
              onClick={() => setModo("registro")}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <form onSubmit={enviar}>
          {modo === "registro" && (
            <div className="auth-campo">
              <label className="etiqueta" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                className="campo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                autoComplete="name"
                placeholder="Como quieres que te vean"
              />
            </div>
          )}

          <div className="auth-campo">
            <label className="etiqueta" htmlFor="correo">
              Correo
            </label>
            <input
              id="correo"
              className="campo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          {modo !== "olvido" && (
            <div className="auth-campo">
              <label className="etiqueta" htmlFor="contrasena">
                Contraseña
              </label>
              <input
                id="contrasena"
                className="campo"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={6}
                autoComplete={modo === "registro" ? "new-password" : "current-password"}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          {error && (
            <p className="aviso-error" role="alert">
              {error}
            </p>
          )}
          {aviso && (
            <p className="aviso-error" role="status">
              {aviso}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-oro"
            style={{ width: "100%", marginTop: 6 }}
            disabled={enviando}
          >
            {enviando
              ? "Un momento…"
              : modo === "registro"
                ? "Crear cuenta"
                : modo === "olvido"
                  ? "Enviar el enlace"
                  : "Entrar"}
          </button>
        </form>

        <p className="auth-pie">
          {modo === "olvido" ? (
            <button type="button" onClick={() => setModo("entrar")}>
              Volver a entrar
            </button>
          ) : (
            <button type="button" onClick={() => setModo("olvido")}>
              Olvidé mi contraseña
            </button>
          )}
        </p>
      </div>
    </section>
  );
}
