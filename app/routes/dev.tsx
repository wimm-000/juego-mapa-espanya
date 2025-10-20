import type { Route } from "./+types/dev";
import { useState } from "react";
import { cordilleras } from "../data/cordilleras";

interface Punto {
  x: number;
  y: number;
  nombre: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Modo Desarrollo - Coordenadas del Mapa" },
    { name: "description", content: "Herramienta para obtener coordenadas del mapa" },
  ];
}

export default function Dev() {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [nombrePunto, setNombrePunto] = useState("");
  const [mostrarCordilleras, setMostrarCordilleras] = useState(true);
  const [tolerancia, setTolerancia] = useState(30);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 612.91315);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 543.61902);
    
    if (nombrePunto.trim()) {
      setPuntos([...puntos, { x, y, nombre: nombrePunto }]);
      setNombrePunto("");
    }
  };

  const eliminarPunto = (index: number) => {
    setPuntos(puntos.filter((_, i) => i !== index));
  };

  const copiarCodigo = () => {
    const codigo = puntos.map(p => 
      `{
    id: "${p.nombre.toLowerCase().replace(/\s+/g, '-')}",
    nombre: "${p.nombre}",
    x: ${p.x},
    y: ${p.y},
    tolerancia: ${tolerancia}
  }`
    ).join(',\n  ');
    
    navigator.clipboard.writeText(`[\n  ${codigo}\n]`);
    alert('Código copiado al portapapeles!');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      padding: '2rem',
      gap: '2rem',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Panel lateral */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Modo Desarrollo
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            Haz clic en el mapa para obtener coordenadas. Escribe un nombre antes de hacer clic.
          </p>
        </div>

        {/* Input para nombre */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Nombre de la cordillera:
          </label>
          <input
            type="text"
            value={nombrePunto}
            onChange={(e) => setNombrePunto(e.target.value)}
            placeholder="Ej: Pirineos"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
          
          <label style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
            Tolerancia (píxeles):
          </label>
          <input
            type="number"
            value={tolerancia}
            onChange={(e) => setTolerancia(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Controles */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setMostrarCordilleras(!mostrarCordilleras)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: mostrarCordilleras ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            {mostrarCordilleras ? 'Ocultar' : 'Mostrar'} Cordilleras Existentes
          </button>
          
          {puntos.length > 0 && (
            <>
              <button
                onClick={copiarCodigo}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                Copiar Código
              </button>
              
              <button
                onClick={() => setPuntos([])}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Limpiar Todo
              </button>
            </>
          )}
        </div>

        {/* Lista de puntos capturados */}
        {puntos.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Puntos Capturados ({puntos.length})
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {puntos.map((punto, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{punto.nombre}</div>
                    <div style={{ color: '#666', fontSize: '0.75rem' }}>
                      x: {punto.x}, y: {punto.y}
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarPunto(index)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Código generado */}
        {puntos.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Código Generado
            </h3>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
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

      {/* Mapa */}
      <div style={{ flex: 2, position: 'relative' }}>
        <div
          onClick={handleMapClick}
          style={{
            position: 'relative',
            width: '100%',
            height: '800px',
            border: '2px solid #333',
            backgroundColor: '#e8f4f8',
            cursor: 'crosshair',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <img
            src="/Blank_Spain_Map_(Provinces).svg.png"
            alt="Mapa de España"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
          
          {/* Cordilleras existentes */}
          {mostrarCordilleras && cordilleras.map((cordillera) => (
            <div key={`existing-${cordillera.id}`}>
              <div
                style={{
                  position: 'absolute',
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${(cordillera.y / 543.61902) * 100}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'rgba(220, 53, 69, 0.6)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                  border: '2px solid rgba(220, 53, 69, 1)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${(cordillera.x / 612.91315) * 100}%`,
                  top: `${((cordillera.y - 20) / 543.61902) * 100}%`,
                  fontSize: '10px',
                  color: '#dc3545',
                  fontWeight: 'bold',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  zIndex: 6,
                  whiteSpace: 'nowrap',
                  border: '1px solid #dc3545'
                }}
              >
                {cordillera.nombre}
              </div>
            </div>
          ))}
          
          {/* Puntos nuevos capturados */}
          {puntos.map((punto, index) => (
            <div key={`new-${index}`}>
              <div
                style={{
                  position: 'absolute',
                  left: `${(punto.x / 612.91315) * 100}%`,
                  top: `${(punto.y / 543.61902) * 100}%`,
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'rgba(0, 123, 255, 0.7)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  border: '2px solid rgba(0, 123, 255, 1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${(punto.x / 612.91315) * 100}%`,
                  top: `${((punto.y - 20) / 543.61902) * 100}%`,
                  fontSize: '11px',
                  color: '#007bff',
                  fontWeight: 'bold',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  zIndex: 11,
                  whiteSpace: 'nowrap',
                  border: '1px solid #007bff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {punto.nombre}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
