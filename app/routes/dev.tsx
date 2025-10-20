import type { Route } from "./+types/dev";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getAllCordilleras } from "../db/queries";
import type { Cordillera } from "../db/schema";

interface Punto {
  id: string;
  x: number;
  y: number;
  nombre: string;
  tolerancia: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Modo Desarrollo - Coordenadas del Mapa" },
    { name: "description", content: "Herramienta para obtener coordenadas del mapa" },
  ];
}

export async function loader() {
  const cordilleras = await getAllCordilleras();
  return { cordilleras };
}

export default function Dev({ loaderData }: Route.ComponentProps) {
  const { cordilleras } = loaderData;
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [nombrePunto, setNombrePunto] = useState("");
  const [mostrarCordilleras, setMostrarCordilleras] = useState(true);
  const [tolerancia, setTolerancia] = useState(30);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<string | null>(null);
  const [modoZona, setModoZona] = useState(false);
  const [puntoArrastrando, setPuntoArrastrando] = useState<string | null>(null);

  // Cargar puntos desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('dev-cordilleras');
    if (saved) {
      try {
        setPuntos(JSON.parse(saved));
      } catch (e) {
        console.error('Error al cargar puntos guardados:', e);
      }
    }
  }, []);

  // Guardar puntos en localStorage cuando cambien
  useEffect(() => {
    if (puntos.length > 0) {
      localStorage.setItem('dev-cordilleras', JSON.stringify(puntos));
    }
  }, [puntos]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (puntoSeleccionado || puntoArrastrando) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 612.91315);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 543.61902);
    
    if (nombrePunto.trim()) {
      const nuevoPunto: Punto = {
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        nombre: nombrePunto,
        tolerancia: tolerancia,
        width: modoZona ? 100 : undefined,
        height: modoZona ? 60 : undefined,
        rotation: modoZona ? 0 : undefined
      };
      setPuntos([...puntos, nuevoPunto]);
      setNombrePunto("");
    }
  };

  const handlePuntoDragStart = (e: React.DragEvent<HTMLDivElement>, puntoId: string) => {
    setPuntoArrastrando(puntoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePuntoDragEnd = () => {
    setPuntoArrastrando(null);
  };

  const handleMapDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (puntoArrastrando) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleMapDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!puntoArrastrando) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 612.91315);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 543.61902);

    actualizarPunto(puntoArrastrando, { x, y });
    setPuntoArrastrando(null);
  };

  const eliminarPunto = (id: string) => {
    setPuntos(puntos.filter(p => p.id !== id));
    if (puntoSeleccionado === id) {
      setPuntoSeleccionado(null);
    }
  };

  const actualizarPunto = (id: string, cambios: Partial<Punto>) => {
    setPuntos(puntos.map(p => {
      if (p.id === id) {
        if ('width' in cambios && cambios.width === undefined) {
          const { width, height, rotation, ...resto } = p;
          return { ...resto, ...cambios };
        }
        return { ...p, ...cambios };
      }
      return p;
    }));
  };

  const copiarCodigo = () => {
    const codigo = puntos.map(p => {
      const base = `{
    id: "${p.id}",
    nombre: "${p.nombre}",
    x: ${p.x},
    y: ${p.y},
    tolerancia: ${p.tolerancia}`;
      
      if (p.width !== undefined && p.height !== undefined) {
        return base + `,
    width: ${p.width},
    height: ${p.height},
    rotation: ${p.rotation || 0}
  }`;
      }
      return base + '\n  }';
    }).join(',\n  ');
    
    navigator.clipboard.writeText(`[\n  ${codigo}\n]`);
    alert('✅ Código copiado al portapapeles!');
  };

  const limpiarTodo = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los puntos?')) {
      setPuntos([]);
      setPuntoSeleccionado(null);
      localStorage.removeItem('dev-cordilleras');
    }
  };

  const importarDesdeArchivo = () => {
    const saved = localStorage.getItem('dev-cordilleras');
    if (saved) {
      const texto = JSON.stringify(JSON.parse(saved), null, 2);
      navigator.clipboard.writeText(texto);
      alert('✅ Datos exportados al portapapeles en formato JSON!');
    }
  };

  return (
    <div className="flex min-h-screen p-8 gap-8 bg-gray-100">
      {/* Panel lateral */}
      <div className="flex-1 flex flex-col gap-4 max-w-md">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold m-0 text-gray-800">
              Modo Desarrollo
            </h2>
            <Link to="/" className="no-underline">
              <button className="px-3 py-2 bg-green-600 text-white border-none rounded-lg font-semibold cursor-pointer text-sm hover:bg-green-700 transition-colors">
                🏠 Home
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-0">
            Haz clic en el mapa para añadir puntos. Arrastra los puntos/zonas para reposicionarlos. Selecciona para editar.
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
            <span className="font-semibold text-gray-800">Crear como zona rectangular</span>
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
                  className={`p-3 rounded ${puntoSeleccionado === punto.id ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50'} text-sm cursor-pointer`}
                  onClick={() => setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{punto.nombre}</div>
                      <div className="text-gray-600 text-xs mt-1">
                        x: {punto.x}, y: {punto.y}, tol: {punto.tolerancia}
                      </div>
                      {punto.width !== undefined && (
                        <div className="text-blue-600 text-xs mt-1">
                          📦 {punto.width}x{punto.height} rot: {punto.rotation}°
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarPunto(punto.id);
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
                              actualizarPunto(punto.id, { width: 100, height: 60, rotation: 0 });
                            } else {
                              actualizarPunto(punto.id, { width: undefined, height: undefined, rotation: undefined });
                            }
                          }}
                          className="w-full px-2 py-2 bg-gray-600 text-white border-none rounded text-xs cursor-pointer font-semibold hover:bg-gray-700 transition-colors"
                        >
                          {punto.width === undefined ? '📦 Convertir a Zona' : '🎯 Convertir a Punto'}
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
                              onChange={(e) => actualizarPunto(punto.id, { width: Number(e.target.value) })}
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
                              onChange={(e) => actualizarPunto(punto.id, { height: Number(e.target.value) })}
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
                              onChange={(e) => actualizarPunto(punto.id, { rotation: Number(e.target.value) })}
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
                            onChange={(e) => actualizarPunto(punto.id, { tolerancia: Number(e.target.value) })}
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={() => setMostrarCordilleras(!mostrarCordilleras)}
            className={`w-full px-4 py-2 ${mostrarCordilleras ? 'bg-green-600' : 'bg-gray-600'} text-white border-none rounded-lg font-semibold cursor-pointer mb-2 hover:opacity-90 transition-opacity`}
          >
            {mostrarCordilleras ? 'Ocultar' : 'Mostrar'} Cordilleras Existentes
          </button>
          
          {puntos.length > 0 && (
            <>
              <button
                onClick={copiarCodigo}
                className="w-full px-4 py-2 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer mb-2 hover:bg-blue-700 transition-colors"
              >
                📋 Copiar Código
              </button>

              <button
                onClick={importarDesdeArchivo}
                className="w-full px-4 py-2 bg-cyan-600 text-white border-none rounded-lg font-semibold cursor-pointer mb-2 hover:bg-cyan-700 transition-colors"
              >
                💾 Exportar JSON
              </button>
              
              <button
                onClick={limpiarTodo}
                className="w-full px-4 py-2 bg-red-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-red-700 transition-colors"
              >
                🗑️ Limpiar Todo
              </button>
            </>
          )}
        </div>
      </div>

      {/* Columna derecha: Mapa + Código */}
      <div className="flex-[2] flex flex-col gap-4">
        {/* Mapa */}
        <div
          onClick={handleMapClick}
          onDragOver={handleMapDragOver}
          onDrop={handleMapDrop}
          className="relative w-full h-[800px] border-2 border-gray-800 bg-cyan-50 rounded-lg overflow-hidden shadow-lg"
          style={{
            cursor: puntoArrastrando ? 'grabbing' : 'crosshair'
          }}
        >
          <img
            src="/Blank_Spain_Map_(Provinces).svg.png"
            alt="Mapa de España"
            className="w-full h-full object-contain pointer-events-none"
          />
          
          {/* Cordilleras existentes */}
          {mostrarCordilleras && cordilleras.map((cordillera) => (
            <div key={`existing-${cordillera.id}`}>
              <div
                className="absolute w-3 h-3 bg-red-600/60 rounded-full border-2 border-red-600 z-[5]"
                style={{
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${(cordillera.y / 543.61902) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              <div
                className="absolute text-[10px] text-red-600 font-bold bg-white/95 px-1.5 py-0.5 rounded z-[6] whitespace-nowrap border border-red-600"
                style={{
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${((cordillera.y - 20) / 543.61902) * 100}%`,
                  transform: 'translateX(-50%)'
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
                      ? 'bg-blue-600/50 border-blue-600/70 z-[20] opacity-50 cursor-grabbing' 
                      : puntoSeleccionado === punto.id 
                        ? 'bg-blue-600/30 border-blue-600 z-[15] cursor-grab'
                        : 'bg-blue-600/15 border-blue-600/70 z-10 cursor-grab'
                  }`}
                  style={{
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    width: `${(punto.width / 612.91315) * 100}%`,
                    height: `${(punto.height / 543.61902) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${punto.rotation || 0}deg)`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id);
                  }}
                />
              ) : (
                <div
                  draggable
                  onDragStart={(e) => handlePuntoDragStart(e, punto.id)}
                  onDragEnd={handlePuntoDragEnd}
                  className={`absolute w-4 h-4 rounded-full border-2 border-blue-600 shadow-md pointer-events-auto ${
                    puntoArrastrando === punto.id
                      ? 'bg-blue-600/50 z-[20] opacity-50 cursor-grabbing'
                      : puntoSeleccionado === punto.id
                        ? 'bg-blue-600 border-blue-600 z-[15] cursor-grab'
                        : 'bg-blue-600/70 z-10 cursor-grab'
                  }`}
                  style={{
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    borderWidth: puntoSeleccionado === punto.id ? '3px' : '2px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id);
                  }}
                />
              )}
              
              <div
                className={`absolute text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap border shadow-md pointer-events-none ${
                  puntoSeleccionado === punto.id 
                    ? 'bg-blue-600 text-white border-blue-800 z-[16]' 
                    : 'bg-white/95 text-blue-600 border-blue-600 z-[11]'
                }`}
                style={{
                  left: `${(punto.x / 612.91315) * 100}%`,
                  top: `${((punto.y - 20) / 543.61902) * 100}%`,
                  transform: 'translateX(-50%)',
                  borderWidth: puntoSeleccionado === punto.id ? '2px' : '1px'
                }}
              >
                {punto.nombre}
              </div>

              {punto.width === undefined && (
                <div
                  className="absolute border border-dashed border-blue-600/40 rounded-full z-[5] pointer-events-none"
                  style={{
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    width: `${(punto.tolerancia * 2 / 612.91315) * 100}%`,
                    height: `${(punto.tolerancia * 2 / 543.61902) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Código generado */}
        {puntos.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Código Generado
            </h3>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-72 text-gray-800">
              {`[\n  ${puntos.map(p => 
                `{
    id: "${p.nombre.toLowerCase().replace(/\s+/g, '-')}",
    nombre: "${p.nombre}",
    x: ${p.x},
    y: ${p.y},
    tolerancia: ${tolerancia}
  }`
              ).join(',\n  ')}\n]`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
