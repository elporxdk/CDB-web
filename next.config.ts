import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Rutas de la versión anterior con cuentas de usuario.
   *
   * El sitio tuvo foro con inicio de sesión en /foro, /auth y /restablecer, y
   * esas rutas estuvieron enlazadas desde el menú en producción: hay quien las
   * tiene guardadas. Sin esto darían 404.
   *
   * Son temporales (307) a propósito. RED ASTRA sigue «en desarrollo» en el
   * plan de trabajo; una redirección permanente (308) la guardan los
   * navegadores sin fecha de caducidad, y el día que el foro vuelva a /foro
   * quien la hubiera visitado seguiría rebotando a la portada.
   */
  async redirects() {
    return [
      { source: "/foro", destination: "/#foro", permanent: false },
      { source: "/foro/:ruta*", destination: "/#foro", permanent: false },
      { source: "/auth", destination: "/", permanent: false },
      { source: "/restablecer", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;

// Makes the Cloudflare bindings declared in wrangler.jsonc available during `next dev`.
// See https://opennext.js.org/cloudflare/bindings
import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
