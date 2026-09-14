"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REVEAL_FROM = { opacity: 0, y: 34 };

export default function ScrollAnimations() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const ctx = gsap.context(() => {
      // Barra de progreso del scroll en el header.
      gsap.to(".scroll-progress-bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // Entrada de la mascota del hero + su constelación girando en bucle.
      gsap.from(".hero-art", {
        opacity: 0,
        y: 40,
        scale: 0.94,
        duration: 1.1,
        delay: 0.1,
        ease: "power3.out",
      });
      gsap.to(".hero-art .constellation", {
        rotate: 360,
        duration: 220,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      // Relevo de imagen: el águila del hero se va antes de la frase fijada
      // y más adelante aparece Aguila2 en el apartado de transparencia.
      gsap.to(".hero-art", {
        opacity: 0,
        y: -70,
        scale: 0.82,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "bottom 90%",
          end: "bottom 25%",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".about-art",
        { opacity: 0, x: -90, scale: 0.86, rotate: -8 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".about",
            start: "top 90%",
            end: "top 40%",
            scrub: true,
          },
        }
      );
      // Flotación vertical suave (aleteo).
      gsap.to(".about-art img", {
        y: -14,
        rotate: 2,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      // Parallax sutil: el águila sube más despacio que el contenido al hacer scroll.
      gsap.to(".about-art img", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".about",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      // Pulso de brillo dorado en la sombra del águila.
      gsap.to(".about-art img", {
        filter: "drop-shadow(0 22px 42px rgba(212,167,44,0.55))",
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      // Partículas doradas orbitando el águila.
      const particles = gsap.utils.toArray<HTMLElement>(".about-spark");
      particles.forEach((spark, i) => {
        const radius = 90 + (i % 3) * 28;
        const speed = 6 + (i % 4) * 2;
        const angle0 = (i / particles.length) * Math.PI * 2;
        const state = { angle: angle0 };

        gsap.to(state, {
          angle: angle0 + Math.PI * 2,
          duration: speed,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            gsap.set(spark, {
              x: Math.cos(state.angle) * radius,
              y: Math.sin(state.angle) * radius,
            });
          },
        });
        gsap.to(spark, {
          opacity: 0.2 + (i % 3) * 0.2,
          duration: 1.5 + (i % 3),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Encabezados de sección.
      gsap.utils.toArray<HTMLElement>(".sec-head").forEach((head) => {
        gsap.from(head.children, {
          ...REVEAL_FROM,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: head, start: "top 85%" },
        });
      });

      // Contadores de las estadísticas de transparencia.
      gsap.utils.toArray<HTMLElement>(".stat").forEach((stat, i) => {
        gsap.from(stat, {
          ...REVEAL_FROM,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".stat-row", start: "top 88%" },
        });

        const value = stat.querySelector("b");
        if (!value) return;
        const target = Number(value.textContent);
        if (!Number.isFinite(target)) return;

        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          delay: i * 0.1,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            value.textContent = String(Math.round(counter.value));
          },
          scrollTrigger: { trigger: ".stat-row", start: "top 88%" },
        });
      });

      // Tarjetas de propuestas, por bloque de área.
      gsap.utils.toArray<HTMLElement>(".area-block").forEach((block) => {
        gsap.from(block.querySelector(".area-head"), {
          opacity: 0,
          x: -24,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: block, start: "top 85%" },
        });
        // Las tarjetas entran haciendo zoom.
        gsap.from(block.querySelectorAll(".card"), {
          opacity: 0,
          scale: 0.86,
          y: 40,
          duration: 0.7,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: block, start: "top 80%" },
        });
      });

      // Logo y constelación del apartado del nombre.
      gsap.from(".name-art img", {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".name-story", start: "top 78%" },
      });
      // Zoom continuo del emblema mientras se atraviesa el apartado.
      gsap.fromTo(
        ".name-art",
        { scale: 0.88 },
        {
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: ".name-story",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      gsap.to(".name-art .constellation", {
        rotate: -360,
        duration: 260,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      gsap.from(".name-copy > *", {
        ...REVEAL_FROM,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ".name-copy", start: "top 82%" },
      });

      // Objetivo general: el panel llega inclinado y se endereza haciendo
      // zoom conforme baja el scroll.
      gsap.fromTo(
        ".objective-panel",
        { rotationX: 20, scale: 0.9, y: 60, opacity: 0.25 },
        {
          rotationX: 0,
          scale: 1,
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".tilt-stage",
            start: "top 92%",
            end: "top 42%",
            scrub: true,
          },
        }
      );

      gsap.from(".specific-item", {
        opacity: 0,
        scale: 0.9,
        y: 34,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".specific-list", start: "top 85%" },
      });

      // Frase fijada: se queda en pantalla y se revela palabra por palabra
      // conforme el usuario sigue bajando, como una diapositiva.
      if (document.querySelector(".statement")) {
        const slide = gsap.timeline({
          scrollTrigger: {
            trigger: ".statement",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        slide
          .from(".statement-glow", {
            scale: 0.35,
            opacity: 0,
            duration: 1.6,
            ease: "power2.out",
          })
          .from(
            ".statement-eyebrow",
            { opacity: 0, y: 24, duration: 0.5, ease: "power2.out" },
            0
          )
          .from(
            ".statement-word > span",
            {
              yPercent: 118,
              opacity: 0,
              duration: 0.6,
              stagger: 0.42,
              ease: "power3.out",
            },
            0.25
          )
          .to(
            ".statement-inner",
            { scale: 1.07, duration: 1, ease: "none" },
            1.5
          );
      }

      // Buzón.
      gsap.from(".buzon-inner > div", {
        ...REVEAL_FROM,
        duration: 0.7,
        stagger: 0.14,
        ease: "power2.out",
        scrollTrigger: { trigger: ".buzon", start: "top 80%" },
      });
      gsap.to(".buzon-mascot img", {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Próximamente — foro de Di Astrea.
      gsap.from(".coming-soon-badge", {
        opacity: 0,
        y: -18,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".coming-soon", start: "top 80%" },
      });
      gsap.from(".coming-soon h2", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".coming-soon", start: "top 78%" },
      });
      gsap.from(".coming-soon p", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: ".coming-soon", start: "top 75%" },
      });
      // Las órbitas crecen y rotan al entrar.
      gsap.fromTo(
        ".cs-orbit",
        { scale: 0.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: ".coming-soon", start: "top 80%" },
        }
      );
      gsap.to(".cs-ring-1", {
        rotate: 360,
        duration: 40,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      gsap.to(".cs-ring-2", {
        rotate: -360,
        duration: 60,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      gsap.to(".cs-ring-3", {
        rotate: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
