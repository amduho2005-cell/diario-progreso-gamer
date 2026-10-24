import { useCallback, useEffect, useRef, useState } from "react";

// Ejecuta una petición y expone los 3 estados de la UI: cargando / error / datos (+ recargar).
export function useCarga<T>(cargar: () => Promise<T>, deps: unknown[]) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ultimaPeticion = useRef(0); // evita que una respuesta vieja pise a una más nueva

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ejecutar = useCallback(cargar, deps);

  const recargar = useCallback(async () => {
    const id = ++ultimaPeticion.current;
    setCargando(true);
    setError(null);
    try {
      const resultado = await ejecutar();
      if (id === ultimaPeticion.current) setDatos(resultado);
    } catch (e) {
      if (id === ultimaPeticion.current) setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      if (id === ultimaPeticion.current) setCargando(false);
    }
  }, [ejecutar]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, setDatos, cargando, error, recargar };
}
