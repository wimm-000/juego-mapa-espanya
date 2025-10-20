import type { Route } from "./+types/juego";
import { useState } from "react";
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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      padding: '2rem',
      gap: '2rem'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Puntuación: {puntuacion}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setModoTest(!modoTest)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: modoTest ? '#ffc107' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {modoTest ? '🧪 Test ON' : '🧪 Test'}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reiniciar
            </button>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            Cordilleras:
          </h3>
          {cordillerasRestantes.map(cordillera => (
            <div
              key={cordillera.id}
              draggable
              onDragStart={(e) => handleDragStart(e, cordillera)}
              style={{
                padding: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '0.5rem',
                cursor: 'grab',
                fontWeight: '600'
              }}
            >
              {cordillera.nombre}
            </div>
          ))}
        </div>

        {cordillerasFalladas.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc3545' }}>
              Fallos:
            </h3>
            {cordillerasFalladas.map(cordillera => (
              <div
                key={cordillera.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '600'
                }}
              >
                {cordillera.nombre}
              </div>
            ))}
          </div>
        )}

        {cordillerasRestantes.length === 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}>
            ¡Completado! Puntuación final: {puntuacion}
          </div>
        )}
      </div>

      <div style={{ flex: 2, position: 'relative' }}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            position: 'relative',
            width: '100%',
            height: '600px',
            border: '2px solid #333',
            backgroundColor: '#e8f4f8'
          }}
        >
          <img
            src="/Blank_Spain_Map_(Provinces).svg.png"
            alt="Mapa de España"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'crosshair'
            }}
          />
          
          {/* Modo Test: Mostrar todas las zonas correctas */}
          {modoTest && cordilleras.map((cordillera) => (
            <div key={`test-${cordillera.id}`}>
              {/* Zona rectangular o punto circular */}
              {cordillera.width !== undefined && cordillera.height !== undefined ? (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: `${(cordillera.width / 612.91315) * 100}%`,
                      height: `${(cordillera.height / 543.61902) * 100}%`,
                      backgroundColor: 'rgba(40, 167, 69, 0.2)',
                      border: '2px solid rgba(40, 167, 69, 0.8)',
                      transform: `translate(-50%, -50%) rotate(${cordillera.rotation || 0}deg)`,
                      zIndex: 5,
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 6,
                      pointerEvents: 'none'
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: `${(cordillera.tolerancia * 2 / 612.91315) * 100}%`,
                      height: `${(cordillera.tolerancia * 2 / 543.61902) * 100}%`,
                      border: '2px solid rgba(40, 167, 69, 0.6)',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5,
                      backgroundColor: 'rgba(40, 167, 69, 0.1)',
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(cordillera.x / 612.91315) * 100}%`,
                      top: `${(cordillera.y / 543.61902) * 100}%`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 6,
                      pointerEvents: 'none'
                    }}
                  />
                </>
              )}
              <div
                style={{
                  position: 'absolute',
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${((cordillera.y - 20) / 543.61902) * 100}%`,
                  fontSize: '10px',
                  color: '#28a745',
                  fontWeight: 'bold',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  zIndex: 7,
                  whiteSpace: 'nowrap',
                  border: '1px solid #28a745',
                  pointerEvents: 'none'
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
                  style={{
                    position: 'absolute',
                    left: `${(colocada.x / 612.91315) * 100}%`,
                    top: `${(colocada.y / 543.61902) * 100}%`,
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#28a745',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${(colocada.x / 612.91315) * 100}%`,
                    top: `${((colocada.y - 12) / 543.61902) * 100}%`,
                    fontSize: '12px',
                    color: '#000',
                    fontWeight: 'bold',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    zIndex: 11,
                    whiteSpace: 'nowrap'
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
