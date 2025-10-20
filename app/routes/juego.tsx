import type { Route } from "./+types/juego";
import { useState } from "react";
import { Link } from "react-router";
import { cordilleras, type Cordillera } from "../data/cordilleras";

interface CordilleraColocada {
  cordilleraId: string;
  x: number;
  y: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Juego - Coloca en el Mapa de España" },
    { name: "description", content: "Juego de geografía de España" },
  ];
}

export default function Juego() {
  const [puntuacion, setPuntuacion] = useState(0);
  const [cordillerasColocadas, setCordillerasColocadas] = useState<CordilleraColocada[]>([]);
  const [cordillerasRestantes, setCordillerasRestantes] = useState<Cordillera[]>(cordilleras);
  const [cordillerasFalladas, setCordillerasFalladas] = useState<Cordillera[]>([]);
  const [draggedCordillera, setDraggedCordillera] = useState<Cordillera | null>(null);
  const [modoTest, setModoTest] = useState(false);

  const handleReset = () => {
    setPuntuacion(0);
    setCordillerasColocadas([]);
    setCordillerasRestantes(cordilleras);
    setCordillerasFalladas([]);
    setDraggedCordillera(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cordillera: Cordillera) => {
    setDraggedCordillera(cordillera);
    
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#007bff';
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    e.dataTransfer.setDragImage(canvas, 20, 20);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedCordillera) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 612.91315;
    const y = ((e.clientY - rect.top) / rect.height) * 543.61902;

    let esCorrecto = false;

    // Si es una zona rectangular
    if (draggedCordillera.width !== undefined && draggedCordillera.height !== undefined) {
      // Calcular el punto relativo al centro de la zona
      const dx = x - draggedCordillera.x;
      const dy = y - draggedCordillera.y;
      
      // Convertir la rotación de grados a radianes (negativo porque CSS rotación es en sentido horario)
      const rotation = -(draggedCordillera.rotation || 0) * Math.PI / 180;
      
      // Rotar el punto al sistema de coordenadas del rectángulo no rotado
      const rotatedX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const rotatedY = dx * Math.sin(rotation) + dy * Math.cos(rotation);
      
      // Verificar si está dentro del rectángulo
      esCorrecto = Math.abs(rotatedX) <= draggedCordillera.width / 2 && 
                   Math.abs(rotatedY) <= draggedCordillera.height / 2;
    } else {
      // Si es un punto circular, usar tolerancia
      const distancia = Math.sqrt(
        Math.pow(x - draggedCordillera.x, 2) + Math.pow(y - draggedCordillera.y, 2)
      );
      esCorrecto = distancia <= draggedCordillera.tolerancia;
    }

    if (esCorrecto) {
      setPuntuacion(puntuacion + 100);
      setCordillerasColocadas([
        ...cordillerasColocadas,
        { cordilleraId: draggedCordillera.id, x: draggedCordillera.x, y: draggedCordillera.y }
      ]);
      setCordillerasRestantes(
        cordillerasRestantes.filter(c => c.id !== draggedCordillera.id)
      );
    } else {
      setCordillerasFalladas([...cordillerasFalladas, draggedCordillera]);
      setCordillerasRestantes(
        cordillerasRestantes.filter(c => c.id !== draggedCordillera.id)
      );
    }

    setDraggedCordillera(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen p-8 gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Puntuación: {puntuacion}
          </h2>
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors no-underline"
            >
              🏠 Home
            </Link>
            <button
              onClick={() => setModoTest(!modoTest)}
              className={`px-4 py-2 ${modoTest ? 'bg-yellow-500' : 'bg-gray-500'} text-white border-none rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
            >
              {modoTest ? '🧪 Test ON' : '🧪 Test'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-gray-600 transition-colors"
            >
              Reiniciar
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">
            Cordilleras:
          </h3>
          {cordillerasRestantes.map(cordillera => (
            <div
              key={cordillera.id}
              draggable
              onDragStart={(e) => handleDragStart(e, cordillera)}
              className="p-4 bg-blue-600 text-white rounded-lg cursor-grab font-semibold hover:bg-blue-700 transition-colors active:cursor-grabbing"
            >
              {cordillera.nombre}
            </div>
          ))}
        </div>

        {cordillerasFalladas.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xl font-semibold text-red-600">
              Fallos:
            </h3>
            {cordillerasFalladas.map(cordillera => (
              <div
                key={cordillera.id}
                className="p-4 bg-red-600 text-white rounded-lg font-semibold"
              >
                {cordillera.nombre}
              </div>
            ))}
          </div>
        )}

        {cordillerasRestantes.length === 0 && (
          <div className="p-4 bg-green-600 text-white rounded-lg text-center font-bold mt-4">
            ¡Completado! Puntuación final: {puntuacion}
          </div>
        )}
      </div>

      <div className="flex-[2] relative">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative w-full h-[600px] border-2 border-gray-800 bg-blue-50 rounded-lg overflow-hidden shadow-lg"
        >
          <img
            src="/Blank_Spain_Map_(Provinces).svg.png"
            alt="Mapa de España"
            className="w-full h-full object-contain cursor-crosshair"
          />
          
          {/* Modo Test: Mostrar todas las zonas correctas */}
          {modoTest && cordilleras.map((cordillera) => (
            <div key={`test-${cordillera.id}`}>
              {/* Zona rectangular o punto circular */}
              {cordillera.width !== undefined && cordillera.height !== undefined ? (
                <>
                  <div
                    className="absolute bg-green-600/20 border-2 border-green-600/80 pointer-events-none"
                    style={{
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: `${(cordillera.width / 612.91315) * 100}%`,
                      height: `${(cordillera.height / 543.61902) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${cordillera.rotation || 0}deg)`,
                      zIndex: 5
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                    style={{
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 6
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    className="absolute border-2 border-green-600/60 rounded-full bg-green-600/10 pointer-events-none"
                    style={{
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: `${(cordillera.tolerancia * 2 / 612.91315) * 100}%`,
                      height: `${(cordillera.tolerancia * 2 / 543.61902) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                    style={{
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 6
                    }}
                  />
                </>
              )}
              <div
                className="absolute text-[10px] text-green-600 font-bold bg-white/90 px-1.5 py-0.5 rounded border border-green-600 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${((cordillera.y - 20) / 543.61902) * 100}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 7
                }}
              >
                {cordillera.nombre}
              </div>
            </div>
          ))}

          {cordillerasColocadas.map((colocada) => {
            const cordillera = cordilleras.find(c => c.id === colocada.cordilleraId);
            return (
              <div key={colocada.cordilleraId}>
                <div
                  className="absolute w-4 h-4 bg-green-600 rounded-full"
                  style={{
                    left: `${(colocada.x / 612.91315) * 100}%`,
                    top: `${(colocada.y / 543.61902) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                />
                <div
                  className="absolute text-xs text-black font-bold bg-white/80 px-1 py-0.5 rounded whitespace-nowrap"
                  style={{
                    left: `${(colocada.x / 612.91315) * 100}%`,
                    top: `${((colocada.y - 12) / 543.61902) * 100}%`,
                    transform: 'translateX(-50%)',
                    zIndex: 11
                  }}
                >
                  {cordillera?.nombre}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
