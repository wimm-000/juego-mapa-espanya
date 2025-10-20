import type { Route } from "./+types/dev";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { cordilleras } from "../data/cordilleras";

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

export default function Dev() {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [nombrePunto, setNombrePunto] = useState("");
  const [mostrarCordilleras, setMostrarCordilleras] = useState(true);
  const [tolerancia, setTolerancia] = useState(30);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<string | null>(null);
  const [modoZona, setModoZona] = useState(false);

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
    if (puntoSeleccionado) return; // No agregar si estamos editando
    
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

  const eliminarPunto = (id: string) => {
    setPuntos(puntos.filter(p => p.id !== id));
    if (puntoSeleccionado === id) {
      setPuntoSeleccionado(null);
    }
  };

  const actualizarPunto = (id: string, cambios: Partial<Punto>) => {
    setPuntos(puntos.map(p => {
      if (p.id === id) {
        const actualizado = { ...p, ...cambios };
        // Si width o height se ponen en undefined, también eliminar rotation
        if (cambios.width === undefined || cambios.height === undefined) {
          delete actualizado.width;
          delete actualizado.height;
          delete actualizado.rotation;
        }
        return actualizado;
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              Modo Desarrollo
            </h2>
            <Link to="/">
              <button style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                🏠 Home
              </button>
            </Link>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: 0 }}>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
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
              fontSize: '1rem',
              backgroundColor: 'white',
              color: '#333'
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

          <label style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={modoZona}
              onChange={(e) => setModoZona(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontWeight: '600' }}>Crear como zona rectangular</span>
          </label>
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
                📋 Copiar Código
              </button>

              <button
                onClick={importarDesdeArchivo}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                💾 Exportar JSON
              </button>
              
              <button
                onClick={limpiarTodo}
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
                🗑️ Limpiar Todo
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
              {puntos.map((punto) => (
                <div
                  key={punto.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: puntoSeleccionado === punto.id ? '#e3f2fd' : '#f8f9fa',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    border: puntoSeleccionado === punto.id ? '2px solid #007bff' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>{punto.nombre}</div>
                      <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        x: {punto.x}, y: {punto.y}, tol: {punto.tolerancia}
                      </div>
                      {punto.width !== undefined && (
                        <div style={{ color: '#007bff', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          📦 {punto.width}x{punto.height} rot: {punto.rotation}°
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarPunto(punto.id);
                      }}
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

                  {/* Panel de edición cuando está seleccionado */}
                  {puntoSeleccionado === punto.id && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd', backgroundColor: '#f8f9fa', padding: '0.75rem', borderRadius: '0.25rem' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (punto.width === undefined) {
                              // Convertir a zona
                              actualizarPunto(punto.id, { width: 100, height: 60, rotation: 0 });
                            } else {
                              // Convertir a punto
                              actualizarPunto(punto.id, { width: undefined, height: undefined, rotation: undefined });
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {punto.width === undefined ? '📦 Convertir a Zona' : '🎯 Convertir a Punto'}
                        </button>
                      </div>

                      {punto.width !== undefined ? (
                        <>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: '#333' }}>
                              Ancho: {punto.width}px
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="300"
                              value={punto.width}
                              onChange={(e) => actualizarPunto(punto.id, { width: Number(e.target.value) })}
                              style={{ width: '100%' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: '#333' }}>
                              Alto: {punto.height}px
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="300"
                              value={punto.height}
                              onChange={(e) => actualizarPunto(punto.id, { height: Number(e.target.value) })}
                              style={{ width: '100%' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: '#333' }}>
                              Rotación: {punto.rotation}°
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={punto.rotation || 0}
                              onChange={(e) => actualizarPunto(punto.id, { rotation: Number(e.target.value) })}
                              style={{ width: '100%' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: '#333' }}>
                            Tolerancia: {punto.tolerancia}px
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="150"
                            value={punto.tolerancia}
                            onChange={(e) => actualizarPunto(punto.id, { tolerancia: Number(e.target.value) })}
                            style={{ width: '100%' }}
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
          {puntos.map((punto) => (
            <div key={`new-${punto.id}`}>
              {/* Zona rectangular o punto circular */}
              {punto.width !== undefined && punto.height !== undefined ? (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    width: `${(punto.width / 612.91315) * 100}%`,
                    height: `${(punto.height / 543.61902) * 100}%`,
                    backgroundColor: puntoSeleccionado === punto.id ? 'rgba(0, 123, 255, 0.3)' : 'rgba(0, 123, 255, 0.15)',
                    border: puntoSeleccionado === punto.id ? '3px solid rgba(0, 123, 255, 1)' : '2px solid rgba(0, 123, 255, 0.7)',
                    transform: `translate(-50%, -50%) rotate(${punto.rotation || 0}deg)`,
                    zIndex: puntoSeleccionado === punto.id ? 15 : 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id);
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    width: '16px',
                    height: '16px',
                    backgroundColor: puntoSeleccionado === punto.id ? 'rgba(0, 123, 255, 1)' : 'rgba(0, 123, 255, 0.7)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: puntoSeleccionado === punto.id ? 15 : 10,
                    border: puntoSeleccionado === punto.id ? '3px solid rgba(0, 123, 255, 1)' : '2px solid rgba(0, 123, 255, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPuntoSeleccionado(puntoSeleccionado === punto.id ? null : punto.id);
                  }}
                />
              )}
              
              {/* Etiqueta del nombre */}
              <div
                style={{
                  position: 'absolute',
                  left: `${(punto.x / 612.91315) * 100}%`,
                  top: `${((punto.y - 20) / 543.61902) * 100}%`,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  transform: 'translateX(-50%)',
                  backgroundColor: puntoSeleccionado === punto.id ? '#007bff' : 'rgba(255, 255, 255, 0.95)',
                  color: puntoSeleccionado === punto.id ? '#ffffff' : '#007bff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  zIndex: puntoSeleccionado === punto.id ? 16 : 11,
                  whiteSpace: 'nowrap',
                  border: puntoSeleccionado === punto.id ? '2px solid #0056b3' : '1px solid #007bff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  pointerEvents: 'none'
                }}
              >
                {punto.nombre}
              </div>

              {/* Círculo de tolerancia (solo si es punto, no zona) */}
              {punto.width === undefined && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(punto.x / 612.91315) * 100}%`,
                    top: `${(punto.y / 543.61902) * 100}%`,
                    width: `${(punto.tolerancia * 2 / 612.91315) * 100}%`,
                    height: `${(punto.tolerancia * 2 / 543.61902) * 100}%`,
                    border: '1px dashed rgba(0, 123, 255, 0.4)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
