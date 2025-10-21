import type { Route } from "./+types/dev";
import { useState, useEffect, useRef } from "react";
import { Link, useFetcher } from "react-router";
import {
  getAllElementosGeograficos,
  deleteElementoGeografico,
  updateElementoGeografico,
  createElementoGeografico,
  getSettings,
  updateTestMode,
  getAllCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../db/queries";
import type { ElementoGeografico, Categoria } from "../db/schema";
import { MAP_WIDTH, MAP_HEIGHT } from "../constants/map";

interface Punto {
  id: string;
  x: number;
  y: number;
  nombre: string;
  categoriaId?: string;
  tolerancia: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Modo Desarrollo - Coordenadas del Mapa" },
    {
      name: "description",
      content: "Herramienta para obtener coordenadas del mapa",
    },
  ];
}

export async function loader() {
  const cordilleras = await getAllElementosGeograficos();
  const categorias = await getAllCategorias();
  const settings = await getSettings();
  return { cordilleras, categorias, settings };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deleteElementoGeografico(id);
  } else if (intent === "update") {
    const id = formData.get("id") as string;
    const data: Partial<ElementoGeografico> = {};

    if (formData.has("x")) data.x = Number(formData.get("x"));
    if (formData.has("y")) data.y = Number(formData.get("y"));
    if (formData.has("nombre")) data.nombre = formData.get("nombre") as string;
    if (formData.has("categoriaId")) {
      const categoriaId = formData.get("categoriaId") as string;
      data.categoriaId = categoriaId || null;
    }
    if (formData.has("tolerancia"))
      data.tolerancia = Number(formData.get("tolerancia"));
    if (formData.has("width")) {
      const width = formData.get("width");
      data.width = width ? Number(width) : null;
    }
    if (formData.has("height")) {
      const height = formData.get("height");
      data.height = height ? Number(height) : null;
    }
    if (formData.has("rotation")) {
      const rotation = formData.get("rotation");
      data.rotation = rotation ? Number(rotation) : null;
    }

    await updateElementoGeografico(id, data);
  } else if (intent === "create") {
    const categoriaId = formData.get("categoriaId") as string;
    const newElementoGeografico = {
      id: `${Date.now()}`,
      nombre: formData.get("nombre") as string,
      categoriaId: categoriaId || null,
      x: Number(formData.get("x")),
      y: Number(formData.get("y")),
      tolerancia: Number(formData.get("tolerancia")),
      width:
        formData.has("width") && formData.get("width")
          ? Number(formData.get("width"))
          : null,
      height:
        formData.has("height") && formData.get("height")
          ? Number(formData.get("height"))
          : null,
      rotation:
        formData.has("rotation") && formData.get("rotation")
          ? Number(formData.get("rotation"))
          : null,
    };

    await createElementoGeografico(newElementoGeografico);
  } else if (intent === "toggleTestMode") {
    const enabled = formData.get("enabled") === "true";
    await updateTestMode(enabled);
  } else if (intent === "createCategoria") {
    const nombre = formData.get("nombre") as string;
    await createCategoria({ id: `${Date.now()}`, nombre });
  } else if (intent === "updateCategoria") {
    const id = formData.get("id") as string;
    const nombre = formData.get("nombre") as string;
    await updateCategoria(id, { nombre });
  } else if (intent === "deleteCategoria") {
    const id = formData.get("id") as string;
    await deleteCategoria(id);
  }

  return { success: true };
}

export default function Dev({ loaderData }: Route.ComponentProps) {
  const { cordilleras, categorias, settings } = loaderData;
  const fetcher = useFetcher();
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [nombrePunto, setNombrePunto] = useState("");
  const [mostrarElementoGeograficos, setMostrarElementoGeograficos] = useState(true);
  const [tolerancia, setTolerancia] = useState(30);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<string | null>(
    null,
  );
  const [modoZona, setModoZona] = useState(false);
  const [puntoArrastrando, setPuntoArrastrando] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);
  const [categoriaEditandoNombre, setCategoriaEditandoNombre] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const puntosRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const puntosContainerRef = useRef<HTMLDivElement>(null);

  // Combinar cordilleras de BD con puntos de localStorage en el estado inicial
  useEffect(() => {
    // Convertir cordilleras de BD a formato Punto para trabajar con ellas
    const cordillerasAsPuntos: Punto[] = cordilleras.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      categoriaId: c.categoriaId ?? undefined,
      x: c.x,
      y: c.y,
      tolerancia: c.tolerancia,
      width: c.width ?? undefined,
      height: c.height ?? undefined,
      rotation: c.rotation ?? undefined,
    }));

    // Invertir el orden para mostrar los más recientes primero
    setPuntos(cordillerasAsPuntos.reverse());
    setMostrarElementoGeograficos(false); // No necesitamos mostrar cordilleras separadas
  }, [cordilleras]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (puntoSeleccionado || puntoArrastrando) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * MAP_WIDTH);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * MAP_HEIGHT);

    if (nombrePunto.trim()) {
      const id = `${Date.now()}`;
      const nuevoPunto: Punto = {
        id,
        x,
        y,
        nombre: nombrePunto,
        categoriaId: categoriaSeleccionada || undefined,
        tolerancia: tolerancia,
        width: modoZona ? 100 : undefined,
        height: modoZona ? 60 : undefined,
        rotation: modoZona ? 0 : undefined,
      };

      // Añadir al principio de la lista (orden invertido)
      setPuntos([nuevoPunto, ...puntos]);
      setNombrePunto("");
      setCategoriaSeleccionada("");

      // Guardar en la base de datos
      const formData = new FormData();
      formData.append("intent", "create");
      formData.append("id", id);
      formData.append("nombre", nuevoPunto.nombre);
      if (categoriaSeleccionada) {
        formData.append("categoriaId", categoriaSeleccionada);
      }
      formData.append("x", x.toString());
      formData.append("y", y.toString());
      formData.append("tolerancia", tolerancia.toString());
      if (modoZona) {
        formData.append("width", "100");
        formData.append("height", "60");
        formData.append("rotation", "0");
      }
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handlePuntoDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    puntoId: string,
  ) => {
    setPuntoArrastrando(puntoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePuntoDragEnd = () => {
    setPuntoArrastrando(null);
  };

  const handleMapDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (puntoArrastrando) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleMapDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!puntoArrastrando) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * MAP_WIDTH);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * MAP_HEIGHT);

    actualizarPunto(puntoArrastrando, { x, y });
    setPuntoArrastrando(null);
  };

  const eliminarPunto = (id: string, nombre: string) => {
    setConfirmDelete({ id, nombre });
  };

  const confirmarEliminacion = () => {
    if (!confirmDelete) return;

    const { id } = confirmDelete;

    // Eliminar del estado local
    setPuntos(puntos.filter((p) => p.id !== id));
    if (puntoSeleccionado === id) {
      setPuntoSeleccionado(null);
    }

    // Eliminar de la base de datos si no es un ID generado temporalmente
    if (!id.includes("-")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("id", id);
      fetcher.submit(formData, { method: "post" });
    }

    setConfirmDelete(null);
  };

  const actualizarPunto = (id: string, cambios: Partial<Punto>) => {
    // Actualizar estado local
    setPuntos(
      puntos.map((p) => {
        if (p.id === id) {
          if ("width" in cambios && cambios.width === undefined) {
            const { width, height, rotation, ...resto } = p;
            return { ...resto, ...cambios };
          }
          return { ...p, ...cambios };
        }
        return p;
      }),
    );

    // Persistir cambios en la base de datos si es un punto de DB (no temporal)
    if (!id.includes("-")) {
      const formData = new FormData();
      formData.append("intent", "update");
      formData.append("id", id);

      // Añadir solo los campos que han cambiado
      Object.entries(cambios).forEach(([key, value]) => {
        if (key !== "id") {
          if (value === undefined) {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      fetcher.submit(formData, { method: "post" });
    }
  };

  useEffect(() => {
    const cordillerasAsPuntos = cordilleras.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      categoriaId: c.categoriaId ?? undefined,
      x: c.x,
      y: c.y,
      tolerancia: c.tolerancia,
      width: c.width || undefined,
      height: c.height || undefined,
      rotation: c.rotation || undefined,
    }));
    setPuntos(cordillerasAsPuntos);
    setMostrarElementoGeograficos(false);
  }, [cordilleras, categorias]);

  // Auto-scroll and expand selected point
  useEffect(() => {
    if (puntoSeleccionado && puntosRefs.current[puntoSeleccionado]) {
      const element = puntosRefs.current[puntoSeleccionado];
      if (element) {
        // Scroll the element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [puntoSeleccionado]);

  return (
    <div className="flex min-h-screen p-8 gap-8 bg-gray-100">
      {/* Panel lateral */}
      <div className="flex-1 flex flex-col gap-4 max-w-md">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="no-underline">
              <button className="px-3 py-2 bg-green-600 text-white border-none rounded-lg font-semibold cursor-pointer text-sm hover:bg-green-700 transition-colors">
                🏠 Volver al Inicio
              </button>
            </Link>
            <h2 className="text-2xl font-bold m-0 text-gray-800">
              Modo Desarrollo
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-0">
            Haz clic en el mapa para añadir puntos. Arrastra los puntos/zonas
            para reposicionarlos. Selecciona para editar.
          </p>
        </div>

        {/* Input para nombre */}
        <div className="bg-white p-6 rounded-lg shadow">
           <label className="block mb-2 font-semibold text-gray-800">
             Nombre de la cordillera:
           </label>
           <input
             type="text"
             value={nombrePunto}
             onChange={(e) => setNombrePunto(e.target.value)}
             placeholder="Ej: Pirineos"
             className="w-full p-2 border border-gray-300 rounded text-base bg-white text-gray-800"
           />

           <label className="block mt-4 mb-2 font-semibold text-gray-800">
             Categoría:
           </label>
           <select
             value={categoriaSeleccionada}
             onChange={(e) => setCategoriaSeleccionada(e.target.value)}
             className="w-full p-2 border border-gray-300 rounded text-base bg-white text-gray-800"
           >
             <option value="">Sin categoría</option>
             {categorias.map((categoria) => (
               <option key={categoria.id} value={categoria.id}>
                 {categoria.nombre}
               </option>
             ))}
           </select>

           <label className="block mt-4 mb-2 font-semibold text-gray-800">
             Tolerancia (píxeles):
           </label>
          <input
            type="number"
            value={tolerancia}
            onChange={(e) => setTolerancia(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded text-base bg-white text-gray-800"
          />

          <label className="flex items-center mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={modoZona}
              onChange={(e) => setModoZona(e.target.checked)}
              className="mr-2"
            />
            <span className="font-semibold text-gray-800">
              Crear como zona rectangular
            </span>
          </label>
        </div>

        {/* Lista de puntos capturados */}
        {puntos.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Puntos Capturados ({puntos.length})
            </h3>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {puntos.map((punto) => (
                <div
                  key={punto.id}
                  ref={(el) => { puntosRefs.current[punto.id] = el; }}
                  className={`p-3 rounded ${puntoSeleccionado === punto.id ? "bg-blue-50 border-2 border-blue-600" : "bg-gray-50"} text-sm cursor-pointer`}
                  onClick={() =>
                    setPuntoSeleccionado(
                      puntoSeleccionado === punto.id ? null : punto.id,
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">
                        {punto.nombre}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        x: {punto.x}, y: {punto.y}, tol: {punto.tolerancia}
                      </div>
                      {punto.categoriaId && (
                        <div className="text-green-600 text-xs mt-1">
                          📂 {categorias.find(c => c.id === punto.categoriaId)?.nombre || 'Categoría desconocida'}
                        </div>
                      )}
                      {punto.width !== undefined && (
                        <div className="text-blue-600 text-xs mt-1">
                          📦 {punto.width}x{punto.height} rot: {punto.rotation}°
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarPunto(punto.id, punto.nombre);
                      }}
                      className="px-2 py-1 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {puntoSeleccionado === punto.id && (
                    <div className="mt-3 pt-3 border-t border-gray-300 bg-gray-50 p-3 rounded">
                      <div className="mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (punto.width === undefined) {
                              actualizarPunto(punto.id, {
                                width: 100,
                                height: 60,
                                rotation: 0,
                              });
                            } else {
                              actualizarPunto(punto.id, {
                                width: undefined,
                                height: undefined,
                                rotation: undefined,
                              });
                            }
                          }}
                          className="w-full px-2 py-2 bg-gray-600 text-white border-none rounded text-xs cursor-pointer font-semibold hover:bg-gray-700 transition-colors"
                        >
                          {punto.width === undefined
                            ? "📦 Convertir a Zona"
                            : "🎯 Convertir a Punto"}
                        </button>
                      </div>

                      {punto.width !== undefined ? (
                        <>
                          <div className="mb-2">
                            <label className="text-sm font-semibold block mb-1 text-gray-800">
                              Ancho: {punto.width}px
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="300"
                              value={punto.width}
                              onChange={(e) =>
                                actualizarPunto(punto.id, {
                                  width: Number(e.target.value),
                                })
                              }
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="text-sm font-semibold block mb-1 text-gray-800">
                              Alto: {punto.height}px
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="300"
                              value={punto.height}
                              onChange={(e) =>
                                actualizarPunto(punto.id, {
                                  height: Number(e.target.value),
                                })
                              }
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="text-sm font-semibold block mb-1 text-gray-800">
                              Rotación: {punto.rotation}°
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={punto.rotation || 0}
                              onChange={(e) =>
                                actualizarPunto(punto.id, {
                                  rotation: Number(e.target.value),
                                })
                              }
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="mb-2">
                          <label className="text-sm font-semibold block mb-1 text-gray-800">
                            Tolerancia: {punto.tolerancia}px
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="150"
                            value={punto.tolerancia}
                            onChange={(e) =>
                              actualizarPunto(punto.id, {
                                tolerancia: Number(e.target.value),
                              })
                            }
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                       )}

                       {/* Selector de categoría */}
                       <div className="mb-2">
                         <label className="text-sm font-semibold block mb-1 text-gray-800">
                           Categoría:
                         </label>
                         <select
                           value={punto.categoriaId || ""}
                           onChange={(e) => {
                             actualizarPunto(punto.id, {
                               categoriaId: e.target.value || undefined,
                             });
                           }}
                           className="w-full p-1 border border-gray-300 rounded text-sm bg-white text-gray-800"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <option value="">Sin categoría</option>
                           {categorias.map((categoria) => (
                             <option key={categoria.id} value={categoria.id}>
                               {categoria.nombre}
                             </option>
                           ))}
                         </select>
                       </div>

                       {/* Botón para finalizar edición */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPuntoSeleccionado(null);
                          }}
                          className="w-full px-3 py-2 bg-green-600 text-white border-none rounded font-semibold cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          ✓ Finalizar Edición
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col gap-3">
          <button
            onClick={() => setMostrarElementoGeograficos(!mostrarElementoGeograficos)}
            className={`w-full px-4 py-2 ${mostrarElementoGeograficos ? "bg-green-600" : "bg-gray-600"} text-white border-none rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
          >
            {mostrarElementoGeograficos ? "Ocultar" : "Mostrar"} ElementoGeograficos Existentes
          </button>

          <button
            onClick={() => {
              const formData = new FormData();
              formData.append("intent", "toggleTestMode");
              formData.append("enabled", (!settings.testMode).toString());
              fetcher.submit(formData, { method: "post" });
            }}
            className={`w-full px-4 py-2 ${settings.testMode ? "bg-yellow-500" : "bg-gray-600"} text-white border-none rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
          >
            {settings.testMode ? "🧪 Modo Test ON" : "🧪 Activar Modo Test"}
          </button>
        </div>

        {/* Gestión de Categorías */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Gestión de Categorías
          </h3>

          {/* Crear nueva categoría */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-800">
              Nueva Categoría:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Ej: Cordilleras"
                className="flex-1 p-2 border border-gray-300 rounded text-base bg-white text-gray-800"
              />
              <button
                onClick={() => {
                  if (nuevaCategoria.trim()) {
                    const formData = new FormData();
                    formData.append("intent", "createCategoria");
                    formData.append("nombre", nuevaCategoria.trim());
                    fetcher.submit(formData, { method: "post" });
                    setNuevaCategoria("");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white border-none rounded font-semibold cursor-pointer hover:bg-green-700 transition-colors"
              >
                ➕ Crear
              </button>
            </div>
          </div>

          {/* Lista de categorías */}
          {categorias.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Categorías Existentes:</h4>
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  {categoriaEditando === categoria.id ? (
                    <>
                      <input
                        type="text"
                        value={categoriaEditandoNombre}
                        onChange={(e) => setCategoriaEditandoNombre(e.target.value)}
                        className="flex-1 p-1 border border-gray-300 rounded text-sm bg-white text-gray-800"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (categoriaEditandoNombre.trim()) {
                            const formData = new FormData();
                            formData.append("intent", "updateCategoria");
                            formData.append("id", categoria.id);
                            formData.append("nombre", categoriaEditandoNombre.trim());
                            fetcher.submit(formData, { method: "post" });
                          }
                          setCategoriaEditando(null);
                          setCategoriaEditandoNombre("");
                        }}
                        className="px-2 py-1 bg-green-600 text-white border-none rounded text-xs cursor-pointer hover:bg-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setCategoriaEditando(null);
                          setCategoriaEditandoNombre("");
                        }}
                        className="px-2 py-1 bg-gray-600 text-white border-none rounded text-xs cursor-pointer hover:bg-gray-700"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-800">{categoria.nombre}</span>
                      <button
                        onClick={() => {
                          setCategoriaEditando(categoria.id);
                          setCategoriaEditandoNombre(categoria.nombre);
                        }}
                        className="px-2 py-1 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
                            const formData = new FormData();
                            formData.append("intent", "deleteCategoria");
                            formData.append("id", categoria.id);
                            fetcher.submit(formData, { method: "post" });
                          }
                        }}
                        className="px-2 py-1 bg-red-600 text-white border-none rounded text-xs cursor-pointer hover:bg-red-700"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha: Mapa */}
      <div className="flex-[2]">
        {/* Mapa */}
        <div
          onClick={handleMapClick}
          onDragOver={handleMapDragOver}
          onDrop={handleMapDrop}
          className="relative w-full border-2 border-gray-800 bg-cyan-50 rounded-lg overflow-hidden shadow-lg"
          style={{
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            cursor: puntoArrastrando ? "grabbing" : "crosshair",
          }}
        >
          <img
            src="/mapa_relieve_espana_peq.jpg"
            alt="Mapa de España"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* ElementoGeograficos existentes */}
          {mostrarElementoGeograficos &&
            cordilleras.map((cordillera) => (
              <div key={`existing-${cordillera.id}`}>
                <div
                  className="absolute w-3 h-3 bg-red-600/60 rounded-full border-2 border-red-600 z-[5]"
                  style={{
                    left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                    top: `${(cordillera.y / MAP_HEIGHT) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div
                  className="absolute text-[10px] text-red-600 font-bold bg-white/95 px-1.5 py-0.5 rounded z-[6] whitespace-nowrap border border-red-600"
                  style={{
                    left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                    top: `${((cordillera.y - 20) / MAP_HEIGHT) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {cordillera.nombre}
                </div>
              </div>
            ))}

          {/* Puntos nuevos capturados */}
          {puntos.map((punto) => (
            <div key={`new-${punto.id}`}>
              {punto.width !== undefined && punto.height !== undefined ? (
                <div
                  draggable
                  onDragStart={(e) => handlePuntoDragStart(e, punto.id)}
                  onDragEnd={handlePuntoDragEnd}
                  className={`absolute border-2 shadow-md pointer-events-auto ${
                    puntoArrastrando === punto.id
                      ? "bg-blue-600/50 border-blue-600/70 z-[20] opacity-50 cursor-grabbing"
                      : puntoSeleccionado === punto.id
                        ? "bg-blue-600/30 border-blue-600 z-[15] cursor-grab"
                        : "bg-blue-600/15 border-blue-600/70 z-10 cursor-grab"
                  }`}
                  style={{
                    left: `${(punto.x / MAP_WIDTH) * 100}%`,
                    top: `${(punto.y / MAP_HEIGHT) * 100}%`,
                    width: `${(punto.width / MAP_WIDTH) * 100}%`,
                    height: `${(punto.height / MAP_HEIGHT) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${punto.rotation || 0}deg)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(
                      puntoSeleccionado === punto.id ? null : punto.id,
                    );
                  }}
                />
              ) : (
                <div
                  draggable
                  onDragStart={(e) => handlePuntoDragStart(e, punto.id)}
                  onDragEnd={handlePuntoDragEnd}
                  className={`absolute w-4 h-4 rounded-full border-2 border-blue-600 shadow-md pointer-events-auto ${
                    puntoArrastrando === punto.id
                      ? "bg-blue-600/50 z-[20] opacity-50 cursor-grabbing"
                      : puntoSeleccionado === punto.id
                        ? "bg-blue-600 border-blue-600 z-[15] cursor-grab"
                        : "bg-blue-600/70 z-10 cursor-grab"
                  }`}
                  style={{
                    left: `${(punto.x / MAP_WIDTH) * 100}%`,
                    top: `${(punto.y / MAP_HEIGHT) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    borderWidth: puntoSeleccionado === punto.id ? "3px" : "2px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(
                      puntoSeleccionado === punto.id ? null : punto.id,
                    );
                  }}
                />
              )}

              <div
                className={`absolute text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap border shadow-md pointer-events-none ${
                  puntoSeleccionado === punto.id
                    ? "bg-blue-600 text-white border-blue-800 z-[16]"
                    : "bg-white/95 text-blue-600 border-blue-600 z-[11]"
                }`}
                style={{
                  left: `${(punto.x / MAP_WIDTH) * 100}%`,
                  top: `${((punto.y - 20) / MAP_HEIGHT) * 100}%`,
                  transform: "translateX(-50%)",
                  borderWidth: puntoSeleccionado === punto.id ? "2px" : "1px",
                }}
              >
                {punto.nombre}
              </div>

              {punto.width === undefined && (
                <div
                  className="absolute border border-dashed border-blue-600/40 rounded-full z-[5] pointer-events-none"
                  style={{
                    left: `${(punto.x / MAP_WIDTH) * 100}%`,
                    top: `${(punto.y / MAP_HEIGHT) * 100}%`,
                    width: `${((punto.tolerancia * 2) / MAP_WIDTH) * 100}%`,
                    height: `${((punto.tolerancia * 2) / MAP_HEIGHT) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              ⚠️ Confirmar Eliminación
            </h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar{" "}
              <strong>"{confirmDelete.nombre}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 border-none rounded-lg font-semibold cursor-pointer hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex-1 px-4 py-3 bg-red-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
