import type { Route } from "./+types/juego";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { ElementoGeografico } from "../db/schema";
import { getAllElementosGeograficos, getSettings, getAllCategorias } from "../db/queries";
import confetti from "canvas-confetti";
import { MAP_WIDTH, MAP_HEIGHT } from "../constants/map";

interface ElementoGeograficoColocado {
  elementoGeograficoId: string;
  x: number;
  y: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Juego - Coloca en el Mapa de España" },
    { name: "description", content: "Juego de geografía de España" },
  ];
}

export async function loader() {
  const elementosGeograficos = await getAllElementosGeograficos();
  const categorias = await getAllCategorias();
  const settings = await getSettings();
  return { elementosGeograficos, categorias, testMode: settings.testMode };
}

export default function Juego({ loaderData }: Route.ComponentProps) {
  const { elementosGeograficos, categorias, testMode } = loaderData;
  const [puntuacion, setPuntuacion] = useState(0);
  const [elementosGeograficosColocados, setElementosGeograficosColocados] = useState<
    ElementoGeograficoColocado[]
  >([]);
  const [elementosGeograficosRestantes, setElementosGeograficosRestantes] = useState<ElementoGeografico[]>(
    () => {
      const shuffled = [...elementosGeograficos];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  );
  const [elementosGeograficosFallados, setElementosGeograficosFallados] = useState<ElementoGeografico[]>(
    [],
  );
  const [draggedElementoGeografico, setDraggedElementoGeografico] = useState<ElementoGeografico | null>(
    null,
  );
  const [mostrarAreas, setMostrarAreas] = useState(false);
  const [mostrarFelicitaciones, setMostrarFelicitaciones] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");

  // Detectar cuando se completan todos los elementos geograficos
  useEffect(() => {
    if (elementosGeograficosRestantes.length === 0 && elementosGeograficosColocados.length > 0) {
      setMostrarFelicitaciones(true);

      // Lanzar confeti SOLO si no hay fallos (puntuación perfecta)
      const puntuacionPerfecta = elementosGeograficosFallados.length === 0;

      if (puntuacionPerfecta) {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, [elementosGeograficosRestantes, elementosGeograficosColocados, elementosGeograficosFallados]);

  // Update game elements when category filter changes
  useEffect(() => {
    let filtered = elementosGeograficos;
    if (categoriaFiltro) {
      filtered = elementosGeograficos.filter(el => el.categoriaId === categoriaFiltro);
    }
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setElementosGeograficosRestantes(shuffled);
    setElementosGeograficosColocados([]);
    setElementosGeograficosFallados([]);
    setPuntuacion(0);
    setMostrarFelicitaciones(false);
  }, [categoriaFiltro, elementosGeograficos]);

  const handleReset = () => {
    setPuntuacion(0);
    setElementosGeograficosColocados([]);
    let filtered = elementosGeograficos;
    if (categoriaFiltro) {
      filtered = elementosGeograficos.filter(el => el.categoriaId === categoriaFiltro);
    }
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setElementosGeograficosRestantes(shuffled);
    setElementosGeograficosFallados([]);
    setDraggedElementoGeografico(null);
    setMostrarFelicitaciones(false);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    elementoGeografico: ElementoGeografico,
  ) => {
    setDraggedElementoGeografico(elementoGeografico);
    setDragPosition({ x: e.clientX, y: e.clientY });

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
    }

    e.dataTransfer.setDragImage(canvas, 0, 0);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.clientX !== 0 && e.clientY !== 0) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedElementoGeografico) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    let esCorrecto = false;

    // Si es una zona rectangular
    if (
      draggedElementoGeografico.width !== null &&
      draggedElementoGeografico.width !== undefined &&
      draggedElementoGeografico.height !== null &&
      draggedElementoGeografico.height !== undefined
    ) {
      // Calcular el punto relativo al centro de la zona
      const dx = x - draggedElementoGeografico.x;
      const dy = y - draggedElementoGeografico.y;

      // Convertir la rotación de grados a radianes (negativo porque CSS rotación es en sentido horario)
      const rotation = (-(draggedElementoGeografico.rotation || 0) * Math.PI) / 180;

      // Rotar el punto al sistema de coordenadas del rectángulo no rotado
      const rotatedX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const rotatedY = dx * Math.sin(rotation) + dy * Math.cos(rotation);

      // Verificar si está dentro del rectángulo
      esCorrecto =
        Math.abs(rotatedX) <= draggedElementoGeografico.width / 2 &&
        Math.abs(rotatedY) <= draggedElementoGeografico.height / 2;
    } else {
      // Si es un punto circular, usar tolerancia
      const distancia = Math.sqrt(
        Math.pow(x - draggedElementoGeografico.x, 2) +
          Math.pow(y - draggedElementoGeografico.y, 2),
      );
      esCorrecto = distancia <= draggedElementoGeografico.tolerancia;
    }

    if (esCorrecto) {
      setPuntuacion(puntuacion + 100);
      setElementosGeograficosColocados([
        ...elementosGeograficosColocados,
        {
          elementoGeograficoId: draggedElementoGeografico.id,
          x: draggedElementoGeografico.x,
          y: draggedElementoGeografico.y,
        },
      ]);
      setElementosGeograficosRestantes(
        elementosGeograficosRestantes.filter((c) => c.id !== draggedElementoGeografico.id),
      );
    } else {
      setElementosGeograficosFallados([...elementosGeograficosFallados, draggedElementoGeografico]);
      setElementosGeograficosRestantes(
        elementosGeograficosRestantes.filter((c) => c.id !== draggedElementoGeografico.id),
      );
    }

    setDraggedElementoGeografico(null);
    setDragPosition(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, elementoGeografico: ElementoGeografico) => {
    setDraggedElementoGeografico(elementoGeografico);
    setTouchActive(true);
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchActive) {
      const touch = e.touches[0];
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggedElementoGeografico || !touchActive) return;

    const touch = e.changedTouches[0];
    const mapElement = document.getElementById("game-map");
    if (!mapElement) return;

    const rect = mapElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const y = ((touch.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    let esCorrecto = false;

    if (
      draggedElementoGeografico.width !== null &&
      draggedElementoGeografico.width !== undefined &&
      draggedElementoGeografico.height !== null &&
      draggedElementoGeografico.height !== undefined
    ) {
      const dx = x - draggedElementoGeografico.x;
      const dy = y - draggedElementoGeografico.y;
      const rotation = (-(draggedElementoGeografico.rotation || 0) * Math.PI) / 180;
      const rotatedX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const rotatedY = dx * Math.sin(rotation) + dy * Math.cos(rotation);
      esCorrecto =
        Math.abs(rotatedX) <= draggedElementoGeografico.width / 2 &&
        Math.abs(rotatedY) <= draggedElementoGeografico.height / 2;
    } else {
      const distancia = Math.sqrt(
        Math.pow(x - draggedElementoGeografico.x, 2) +
          Math.pow(y - draggedElementoGeografico.y, 2),
      );
      esCorrecto = distancia <= draggedElementoGeografico.tolerancia;
    }

    if (esCorrecto) {
      setPuntuacion(puntuacion + 100);
      setElementosGeograficosColocados([
        ...elementosGeograficosColocados,
        {
          elementoGeograficoId: draggedElementoGeografico.id,
          x: draggedElementoGeografico.x,
          y: draggedElementoGeografico.y,
        },
      ]);
      setElementosGeograficosRestantes(
        elementosGeograficosRestantes.filter((c) => c.id !== draggedElementoGeografico.id),
      );
    } else {
      setElementosGeograficosFallados([...elementosGeograficosFallados, draggedElementoGeografico]);
      setElementosGeograficosRestantes(
        elementosGeograficosRestantes.filter((c) => c.id !== draggedElementoGeografico.id),
      );
    }

    setDraggedElementoGeografico(null);
    setTouchActive(false);
    setDragPosition(null);
  };

  return (
    <div className="flex min-h-screen p-8 gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors no-underline"
          >
            🏠 Volver al inicio
          </Link>
          <button
            onClick={() => setMostrarAreas(!mostrarAreas)}
            className={`px-4 py-2 ${mostrarAreas ? "bg-yellow-500" : "bg-gray-500"} text-white border-none rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
          >
            {mostrarAreas ? "💀 Activar modo dificil" : "🚩 Activar modo facil"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-gray-600 transition-colors"
          >
            Reiniciar
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold">Filtrar por categoría:</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">ElementoGeograficos:</h3>
          <div className="grid grid-cols-2 gap-2">
            {elementosGeograficosRestantes.map((elementoGeografico) => (
              <div
                key={elementoGeografico.id}
                draggable
                onDragStart={(e) => handleDragStart(e, elementoGeografico)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, elementoGeografico)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="p-4 bg-gray-500 text-white rounded-lg cursor-grab font-semibold hover:bg-gray-600 transition-colors active:cursor-grabbing touch-none"
              >
                {elementoGeografico.nombre}
              </div>
            ))}
          </div>
        </div>

        {elementosGeograficosFallados.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xl font-semibold text-red-600">Fallos:</h3>
            {elementosGeograficosFallados.map((elementoGeografico) => (
              <div
                key={elementoGeografico.id}
                className="p-4 bg-red-600 text-white rounded-lg font-semibold"
              >
                {elementoGeografico.nombre}
              </div>
            ))}
          </div>
        )}

        {elementosGeograficosRestantes.length === 0 && (
          <div className="p-4 bg-green-600 text-white rounded-lg text-center font-bold mt-4">
            ¡Completado! Puntuación final: {puntuacion}
          </div>
        )}
      </div>

      <div className="flex-[2] relative">
        {/* Puntuación en esquina superior derecha */}
        <div className="absolute top-4 right-4 z-50 bg-white px-6 py-3 rounded-lg shadow-lg border-2 border-gray-800">
          <h2 className="text-2xl font-bold text-gray-800">
            Puntuación: {puntuacion}
          </h2>
        </div>

        <div
          id="game-map"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative w-full border-2 border-gray-800 bg-blue-50 rounded-lg overflow-hidden shadow-lg"
          style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
        >
          <img
            src="/mapa_relieve_espana_peq.jpg"
            alt="Mapa de España"
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Modo Mostrar Áreas: Mostrar solo las zonas sin texto */}
          {mostrarAreas &&
            elementosGeograficos
              .filter((elementoGeografico) => !categoriaFiltro || elementoGeografico.categoriaId === categoriaFiltro)
              .map((elementoGeografico) => {
              const tieneZonaRectangular =
                elementoGeografico.width !== null &&
                elementoGeografico.width !== undefined &&
                elementoGeografico.height !== null &&
                elementoGeografico.height !== undefined;

              return (
                <div key={`area-${elementoGeografico.id}`}>
                  {tieneZonaRectangular ? (
                    <div
                      className="absolute bg-red-600/20 border-2 border-red-600/80 pointer-events-none"
                      style={{
                        left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                        top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                        width: `${(elementoGeografico.width! / MAP_WIDTH) * 100}%`,
                        height: `${(elementoGeografico.height! / MAP_HEIGHT) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${elementoGeografico.rotation || 0}deg)`,
                        zIndex: 5,
                      }}
                    />
                  ) : (
                    <div
                      className="absolute border-2 border-red-600/60 rounded-full bg-red-600/10 pointer-events-none"
                      style={{
                        left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                        top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                        width: `${((elementoGeografico.tolerancia * 2) / MAP_WIDTH) * 100}%`,
                        height: `${((elementoGeografico.tolerancia * 2) / MAP_HEIGHT) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 5,
                      }}
                    />
                  )}
                </div>
              );
            })}

          {testMode &&
            elementosGeograficos
              .filter((elementoGeografico) => !categoriaFiltro || elementoGeografico.categoriaId === categoriaFiltro)
              .map((elementoGeografico) => {
              const tieneZonaRectangular =
                elementoGeografico.width !== null &&
                elementoGeografico.width !== undefined &&
                elementoGeografico.height !== null &&
                elementoGeografico.height !== undefined;

              return (
                <div key={`test-${elementoGeografico.id}`}>
                  {tieneZonaRectangular ? (
                    <>
                      <div
                        className="absolute bg-green-600/20 border-2 border-green-600/80 pointer-events-none"
                        style={{
                          left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                          top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                          width: `${(elementoGeografico.width! / MAP_WIDTH) * 100}%`,
                          height: `${(elementoGeografico.height! / MAP_HEIGHT) * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${elementoGeografico.rotation || 0}deg)`,
                          zIndex: 5,
                        }}
                      />
                      <div
                        className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                        style={{
                          left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                          top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 6,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className="absolute border-2 border-green-600/60 rounded-full bg-green-600/10 pointer-events-none"
                        style={{
                          left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                          top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                          width: `${((elementoGeografico.tolerancia * 2) / MAP_WIDTH) * 100}%`,
                          height: `${((elementoGeografico.tolerancia * 2) / MAP_HEIGHT) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 5,
                        }}
                      />
                      <div
                        className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                        style={{
                          left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                          top: `${(elementoGeografico.y / MAP_HEIGHT) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 6,
                        }}
                      />
                    </>
                  )}
                  <div
                    className="absolute text-[10px] text-green-600 font-bold bg-white/90 px-1.5 py-0.5 rounded border border-green-600 whitespace-nowrap pointer-events-none"
                    style={{
                      left: `${(elementoGeografico.x / MAP_WIDTH) * 100}%`,
                      top: `${((elementoGeografico.y - 20) / MAP_HEIGHT) * 100}%`,
                      transform: "translateX(-50%)",
                      zIndex: 7,
                    }}
                  >
                    {elementoGeografico.nombre}
                  </div>
                </div>
              );
            })}

          {elementosGeograficosColocados.map((colocada) => {
            const elementoGeografico = elementosGeograficos.find(
              (c) => c.id === colocada.elementoGeograficoId,
            );
            if (!elementoGeografico) return null;

            const tieneZonaRectangular =
              elementoGeografico.width !== null &&
              elementoGeografico.width !== undefined &&
              elementoGeografico.height !== null &&
              elementoGeografico.height !== undefined;

            return (
              <div key={colocada.elementoGeograficoId}>
                {/* Mostrar zona rectangular si aplica */}
                {tieneZonaRectangular ? (
                  <div
                    className="absolute bg-green-600/10 border-2 border-green-600/60 pointer-events-none"
                    style={{
                      left: `${(colocada.x / MAP_WIDTH) * 100}%`,
                      top: `${(colocada.y / MAP_HEIGHT) * 100}%`,
                      width: `${(elementoGeografico.width! / MAP_WIDTH) * 100}%`,
                      height: `${(elementoGeografico.height! / MAP_HEIGHT) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${elementoGeografico.rotation || 0}deg)`,
                      zIndex: 8,
                    }}
                  />
                ) : (
                  /* Mostrar círculo de tolerancia para puntos circulares */
                  <div
                    className="absolute border-2 border-dashed border-green-600/40 rounded-full bg-green-600/5 pointer-events-none"
                    style={{
                      left: `${(colocada.x / MAP_WIDTH) * 100}%`,
                      top: `${(colocada.y / MAP_HEIGHT) * 100}%`,
                      width: `${((elementoGeografico.tolerancia * 2) / MAP_WIDTH) * 100}%`,
                      height: `${((elementoGeografico.tolerancia * 2) / MAP_HEIGHT) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 8,
                    }}
                  />
                )}

                {/* Punto central */}
                <div
                  className="absolute w-4 h-4 bg-green-600 rounded-full"
                  style={{
                    left: `${(colocada.x / MAP_WIDTH) * 100}%`,
                    top: `${(colocada.y / MAP_HEIGHT) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                />

                {/* Etiqueta con nombre */}
                <div
                  className="absolute text-xs text-black font-bold bg-white/80 px-1 py-0.5 rounded whitespace-nowrap"
                  style={{
                    left: `${(colocada.x / MAP_WIDTH) * 100}%`,
                    top: `${((colocada.y - 12) / MAP_HEIGHT) * 100}%`,
                    transform: "translateX(-50%)",
                    zIndex: 11,
                  }}
                >
                  {elementoGeografico.nombre}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elemento visual flotante durante drag */}
      {draggedElementoGeografico && dragPosition && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-2xl font-semibold border-2 border-white">
            {draggedElementoGeografico.nombre}
          </div>
        </div>
      )}

      {/* Modal de felicitaciones */}
      {mostrarFelicitaciones && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setMostrarFelicitaciones(false)}
        >
          <div
            className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {elementosGeograficosFallados.length === 0 ? (
              <>
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  ¡Perfecto!
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Has acertado todas las elementosGeograficos sin fallos
                </p>
                <p className="text-3xl font-bold text-green-600 mb-8">
                  Puntuación: {puntuacion}
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  ¡Completado!
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  Has terminado el juego
                </p>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  Puntuación: {puntuacion}
                </p>
                <p className="text-sm text-red-600 mb-6">
                  Fallos: {elementosGeograficosFallados.length}
                </p>
              </>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setMostrarFelicitaciones(false)}
                className="px-6 py-3 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setMostrarFelicitaciones(false);
                  handleReset();
                }}
                className="px-6 py-3 bg-green-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-green-700 transition-colors"
              >
                Jugar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
