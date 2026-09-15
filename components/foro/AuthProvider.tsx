"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { foroConfigurado, obtenerSupabase } from "@/lib/supabase";

/**
 * Sesión del foro, compartida por todas las páginas de RED ASTRA.
 *
 * Guarda la sesión de Supabase y la mantiene al día. Lo que decide qué puede
 * hacer cada quien no es esto, sino las políticas RLS: aquí solo se sabe quién
 * dice ser el visitante, para pintar la interfaz en consecuencia.
 */
interface ValorAuth {
  sesion: Session | null;
  usuario: User | null;
  cargando: boolean;
  /** Falso si aún no se han configurado las variables de Supabase. */
  configurado: boolean;
  registrarse: (
    correo: string,
    contrasena: string,
    nombre: string
  ) => Promise<{ error: string | null }>;
  entrar: (correo: string, contrasena: string) => Promise<{ error: string | null }>;
  salir: () => Promise<void>;
  reenviarConfirmacion: () => Promise<{ error: string | null }>;
  pedirRestablecer: (correo: string) => Promise<{ error: string | null }>;
  cambiarContrasena: (nueva: string) => Promise<{ error: string | null }>;
}

const ContextoAuth = createContext<ValorAuth | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  // Arranca en «cargando» solo si hay algo que cargar. Ponerlo a true siempre y
  // corregirlo dentro del efecto obliga a un render de más, y además React avisa
  // de ello: un setState síncrono en un efecto encadena renders.
  const [cargando, setCargando] = useState(foroConfigurado);

  useEffect(() => {
    // Sin variables de entorno no hay nada que consultar, y llamar al cliente
    // lanzaría. La interfaz explica lo que falta.
    if (!foroConfigurado) return;

    const supabase = obtenerSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });

    // Cambios de sesión: entrar, salir, refresco del token y también el canje
    // del enlace del correo al aterrizar en el sitio.
    const { data: oyente } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
    });

    return () => oyente.subscription.unsubscribe();
  }, []);

  const registrarse: ValorAuth["registrarse"] = useCallback(
    async (correo, contrasena, nombre) => {
      const { error } = await obtenerSupabase().auth.signUp({
        email: correo,
        password: contrasena,
        options: {
          // Se guarda en auth.users.raw_user_meta_data, que es de donde lo saca
          // el trigger `crear_perfil_al_registrarse` para rellenar el perfil.
          data: { full_name: nombre },
          emailRedirectTo: `${window.location.origin}/foro`,
        },
      });
      return { error: error ? traducirError(error.message) : null };
    },
    []
  );

  const entrar: ValorAuth["entrar"] = useCallback(async (correo, contrasena) => {
    const { error } = await obtenerSupabase().auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  const salir = useCallback(async () => {
    await obtenerSupabase().auth.signOut();
  }, []);

  /** Otro correo de confirmación, para quien no lo recibió o lo dejó caducar. */
  const reenviarConfirmacion: ValorAuth["reenviarConfirmacion"] = useCallback(async () => {
    const correo = sesion?.user?.email;
    if (!correo) return { error: "No hay ninguna sesión abierta." };

    const { error } = await obtenerSupabase().auth.resend({
      type: "signup",
      email: correo,
      options: { emailRedirectTo: `${window.location.origin}/foro` },
    });
    return { error: error ? traducirError(error.message) : null };
  }, [sesion]);

  /**
   * Correo de restablecimiento.
   *
   * `redirectTo` apunta a /restablecer, y ese origen tiene que estar en la
   * lista de «Redirect URLs» de Supabase (Authentication → URL Configuration).
   * Si no está, el enlace lleva al sitio pero sin la sesión temporal, y no se
   * puede cambiar nada.
   *
   * No se distingue si el correo existe o no: el mensaje de la interfaz es el
   * mismo en ambos casos, a propósito. Decir «ese correo no está registrado»
   * convierte el formulario en una forma de averiguar quién tiene cuenta.
   */
  const pedirRestablecer: ValorAuth["pedirRestablecer"] = useCallback(async (correo) => {
    const { error } = await obtenerSupabase().auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  /**
   * Cambio de contraseña. Sirve para los dos casos, porque para Supabase son el
   * mismo: hay una sesión abierta y se actualiza a su usuario. Al llegar desde
   * el enlace del correo, `detectSessionInUrl` ya canjeó el token por una
   * sesión antes de que esto se llame.
   */
  const cambiarContrasena: ValorAuth["cambiarContrasena"] = useCallback(async (nueva) => {
    const { error } = await obtenerSupabase().auth.updateUser({ password: nueva });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  return (
    <ContextoAuth.Provider
      value={{
        sesion,
        usuario: sesion?.user ?? null,
        cargando,
        configurado: foroConfigurado,
        registrarse,
        entrar,
        salir,
        reenviarConfirmacion,
        pedirRestablecer,
        cambiarContrasena,
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth(): ValorAuth {
  const ctx = useContext(ContextoAuth);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/** Traduce los errores más comunes de Supabase al español. */
function traducirError(mensaje: string): string {
  const mapa: Record<string, string> = {
    "Invalid login credentials": "Correo o contraseña incorrectos.",
    "User already registered": "Ya existe una cuenta con este correo.",
    "Email not confirmed": "Tienes que confirmar tu correo antes de entrar.",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 6 caracteres.",
    "New password should be different from the old password.":
      "La contraseña nueva tiene que ser distinta de la actual.",
    "Auth session missing!":
      "El enlace ha caducado o ya se usó. Pide otro correo de restablecimiento.",
    "For security purposes, you can only request this after 60 seconds.":
      "Por seguridad, espera un minuto antes de pedir otro correo.",
    "Email rate limit exceeded":
      "Se han pedido demasiados correos seguidos. Espera unos minutos.",
  };
  return mapa[mensaje] ?? mensaje;
}
