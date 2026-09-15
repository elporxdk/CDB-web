import type { ReactNode } from "react";
import { AuthProvider } from "@/components/foro/AuthProvider";
import { CabeceraForo } from "@/components/foro/CabeceraForo";

/**
 * Envoltura de RED ASTRA.
 *
 * Va en un grupo de rutas `(red-astra)` y no en el layout raíz a propósito: el
 * paréntesis no aparece en la URL (las rutas siguen siendo /foro, /auth y
 * /restablecer), pero deja el `AuthProvider` fuera de la portada. Si estuviera
 * arriba, la página principal —que es estática y no sabe nada de cuentas—
 * cargaría el SDK de Supabase y abriría una sesión para nada.
 */
export default function LayoutRedAstra({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CabeceraForo />
      <main>{children}</main>
    </AuthProvider>
  );
}
