"use client";

/**
 * Pastilla de filtro. La usan la barra de categorías y la de orden.
 *
 * `aria-pressed` y no `aria-selected`: es un interruptor, no una pestaña.
 */
export function Chip({
  children,
  activo,
  onClick,
  titulo,
}: {
  children: React.ReactNode;
  activo: boolean;
  onClick: () => void;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      title={titulo}
      className={`chip ${activo ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}
