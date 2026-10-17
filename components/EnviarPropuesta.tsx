"use client";

import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  enviarPropuesta,
  LIMITES,
  validarPropuesta,
  type CampoPropuesta,
  type ErroresPropuesta,
  type Propuesta,
} from "@/lib/propuestas";

const VACIA: Propuesta = { nombre: "", grado: "", propuesta: "" };

type Estado = "editando" | "enviando" | "enviada" | "error";

/** Orden de los campos en pantalla: el foco va al primero que falle. */
const ORDEN: CampoPropuesta[] = ["nombre", "grado", "propuesta"];

/**
 * Formulario nativo para que el estudiantado envíe propuestas al Consejo.
 *
 * Sustituye al enlace a Google Forms. Cada propuesta llega por correo al
 * buzón del Consejo (ver app/api/propuestas/route.ts). La validación y el envío
 * viven en lib/propuestas.ts; aquí solo hay estado de interfaz.
 *
 * Los errores no aparecen mientras se escribe por primera vez: salen al
 * intentar enviar, y a partir de ahí se recalculan con cada tecla para que
 * desaparezcan en cuanto se corrigen.
 */
export default function EnviarPropuesta() {
  const id = useId();
  const [valores, setValores] = useState<Propuesta>(VACIA);
  const [errores, setErrores] = useState<ErroresPropuesta>({});
  const [intentado, setIntentado] = useState(false);
  const [estado, setEstado] = useState<Estado>("editando");
  const [mensajeError, setMensajeError] = useState("");

  const nombreRef = useRef<HTMLInputElement>(null);
  const gradoRef = useRef<HTMLInputElement>(null);
  const propuestaRef = useRef<HTMLTextAreaElement>(null);
  const avisoRef = useRef<HTMLDivElement>(null);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const siguientes = { ...valores, [e.target.name]: e.target.value };
    setValores(siguientes);
    if (intentado) setErrores(validarPropuesta(siguientes));
    // Volver a escribir después de enviar retira el aviso: ya es otra propuesta.
    if (estado === "enviada" || estado === "error") setEstado("editando");
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;

    setIntentado(true);
    const encontrados = validarPropuesta(valores);
    setErrores(encontrados);

    const primero = ORDEN.find((campo) => encontrados[campo]);
    if (primero) {
      // El mapa se arma aquí, en el manejador, y no durante el render: leer
      // refs al pintar es justo lo que React desaconseja.
      const refs = { nombre: nombreRef, grado: gradoRef, propuesta: propuestaRef };
      refs[primero].current?.focus();
      return;
    }

    // El campo trampa no está en el estado de React: se lee del DOM al enviar,
    // que es justo donde lo habrá escrito un bot.
    const trampa = String(new FormData(e.currentTarget).get("sitio_web") ?? "");

    setEstado("enviando");
    try {
      await enviarPropuesta(
        {
          nombre: valores.nombre.trim(),
          grado: valores.grado.trim(),
          propuesta: valores.propuesta.trim(),
        },
        trampa
      );
      setValores(VACIA);
      setErrores({});
      setIntentado(false);
      setEstado("enviada");
      // El botón estaba deshabilitado y el foco se habría perdido; se lleva al
      // aviso para que el lector de pantalla lo lea y el teclado siga ahí.
      requestAnimationFrame(() => avisoRef.current?.focus());
    } catch (err) {
      // Lo escrito NO se borra: si el envío falla, no se pierde la propuesta.
      setMensajeError(err instanceof Error ? err.message : "No se pudo enviar la propuesta.");
      setEstado("error");
      requestAnimationFrame(() => avisoRef.current?.focus());
    }
  }

  const ids = {
    nombre: `${id}-nombre`,
    grado: `${id}-grado`,
    propuesta: `${id}-propuesta`,
    contador: `${id}-contador`,
  };
  const errorDe = (campo: CampoPropuesta) => `${ids[campo]}-error`;

  const largo = valores.propuesta.length;
  const cercaDelLimite = largo > LIMITES.propuesta.max * 0.9;

  return (
    <section className="enviar" id="enviar-propuesta">
      <div className="wrap enviar-grid">
        <div className="enviar-copy">
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <p className="tag">
              <span className="dot" />
              Buzón de propuestas
            </p>
            <h2>¿Qué te gustaría ver en el colegio?</h2>
          </div>
          <p>
            Las mejores propuestas no nacen en una oficina: nacen en el patio,
            en el salón, en la fila de la cafetería. Cuéntanos qué falta y qué
            cambiarías. Tu idea puede ser el próximo proyecto del Consejo.
          </p>
          <div className="enviar-mascota">
            <Image src="/Aguila3.png" alt="" width={2508} height={2508} sizes="200px" />
          </div>
        </div>

        <form className="form-propuesta" onSubmit={enviar} noValidate aria-labelledby={`${id}-titulo`}>
          <h3 id={`${id}-titulo`}>Envía tu propuesta</h3>
          <p className="form-intro">Los tres campos son obligatorios.</p>

          <div className="campo">
            <label htmlFor={ids.nombre}>Nombre completo</label>
            <input
              ref={nombreRef}
              id={ids.nombre}
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Ej.: Ana María López"
              maxLength={LIMITES.nombre.max}
              value={valores.nombre}
              onChange={cambiar}
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby={errores.nombre ? errorDe("nombre") : undefined}
            />
            <div className="campo-pie">
              {errores.nombre && (
                <p className="campo-error" id={errorDe("nombre")}>
                  {errores.nombre}
                </p>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor={ids.grado}>Grado o especialidad</label>
            <input
              ref={gradoRef}
              id={ids.grado}
              name="grado"
              type="text"
              placeholder="Ej.: 2.º año de bachillerato, Electrónica"
              maxLength={LIMITES.grado.max}
              value={valores.grado}
              onChange={cambiar}
              aria-invalid={Boolean(errores.grado)}
              aria-describedby={errores.grado ? errorDe("grado") : undefined}
            />
            <div className="campo-pie">
              {errores.grado && (
                <p className="campo-error" id={errorDe("grado")}>
                  {errores.grado}
                </p>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor={ids.propuesta}>Tu propuesta</label>
            <textarea
              ref={propuestaRef}
              id={ids.propuesta}
              name="propuesta"
              rows={6}
              placeholder="¿Qué propones y por qué? Cuanto más concreta, más fácil es llevarla a cabo."
              maxLength={LIMITES.propuesta.max}
              value={valores.propuesta}
              onChange={cambiar}
              aria-invalid={Boolean(errores.propuesta)}
              aria-describedby={
                [errores.propuesta ? errorDe("propuesta") : "", ids.contador].join(" ").trim()
              }
            />
            <div className="campo-pie">
              {errores.propuesta && (
                <p className="campo-error" id={errorDe("propuesta")}>
                  {errores.propuesta}
                </p>
              )}
              <span id={ids.contador} className={`contador ${cercaDelLimite ? "cerca" : ""}`}>
                {largo} / {LIMITES.propuesta.max}
              </span>
            </div>
          </div>

          {/* Trampa para bots: fuera de la pantalla, fuera del orden de
              tabulación y oculta a los lectores de pantalla. Una persona no la
              rellena nunca. No se usa display:none porque algunos bots se
              saltan los campos que lo llevan. */}
          <div className="campo-trampa" aria-hidden="true">
            <label htmlFor={`${id}-sitio`}>Sitio web (déjalo vacío)</label>
            <input id={`${id}-sitio`} name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form-pie">
            <button type="submit" className="btn-primary" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Enviando…" : "Enviar propuesta"}
            </button>
          </div>

          {/* La región existe siempre (vacía o no) para que los lectores de
              pantalla la registren antes de que cambie y lean el aviso. */}
          <div role="status" aria-live="polite">
            {estado === "enviada" && (
              <div className="aviso-envio exito" ref={avisoRef} tabIndex={-1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M7.5 12.3l3 3 6-6.3" />
                </svg>
                <div>
                  <strong>Propuesta enviada con éxito</strong>
                  Ya va camino del correo del Consejo. Gracias por tomarte el
                  tiempo de escribirla; puedes enviar otra cuando quieras.
                </div>
              </div>
            )}
            {estado === "error" && (
              <div className="aviso-envio error" ref={avisoRef} tabIndex={-1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M12 7.5v5.5M12 16.5v.01" />
                </svg>
                <div>
                  <strong>No se pudo enviar</strong>
                  {mensajeError} Lo que escribiste sigue en el formulario.
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
