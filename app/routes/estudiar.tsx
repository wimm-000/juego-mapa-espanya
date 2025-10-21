import type { Route } from "./+types/estudiar";
import { Link } from "react-router";
import { getAllCordilleras } from "../db/queries";
import { MAP_WIDTH, MAP_HEIGHT } from "../constants/map";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Estudiar" },
    { name: "description", content: "Pagina para estudiar los resultados" },
  ];
}

export async function loader() {
  const cordilleras = await getAllCordilleras();
  return { cordilleras };
}

export default function Estudiar({ loaderData }: Route.ComponentProps) {
  const { cordilleras } = loaderData;

  return (
    <div className="flex flex-col items-center min-h-screen gap-4 p-8">
      <Link
        to="/"
        className="self-start px-4 py-2 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors no-underline"
      >
        🏠 Home
      </Link>

      <h1 className="text-3xl font-bold">Estudiar Cordilleras de España</h1>

      <div
        className="relative w-full max-w-4xl border-2 border-gray-800 bg-blue-50 rounded-lg overflow-hidden shadow-lg"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
      >
        <img
          src="/mapa_relieve_espana_peq.jpg"
          alt="Mapa de España"
          className="w-full h-full object-contain"
        />

        {cordilleras.map((cordillera) => {
          const tieneZonaRectangular = cordillera.width !== null && 
                                      cordillera.width !== undefined && 
                                      cordillera.height !== null && 
                                      cordillera.height !== undefined;
          
          return (
            <div key={cordillera.id}>
              {tieneZonaRectangular ? (
                <>
                  <div
                    className="absolute bg-green-600/20 border-2 border-green-600/80 pointer-events-none"
                    style={{
                      left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                      top: `${(cordillera.y / MAP_HEIGHT) * 100}%`,
                      width: `${(cordillera.width! / MAP_WIDTH) * 100}%`,
                      height: `${(cordillera.height! / MAP_HEIGHT) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${cordillera.rotation || 0}deg)`,
                      zIndex: 5
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                    style={{
                      left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                      top: `${(cordillera.y / MAP_HEIGHT) * 100}%`,
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
                      left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                      top: `${(cordillera.y / MAP_HEIGHT) * 100}%`,
                      width: `${(cordillera.tolerancia * 2 / MAP_WIDTH) * 100}%`,
                      height: `${(cordillera.tolerancia * 2 / MAP_HEIGHT) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-green-600 rounded-full pointer-events-none"
                    style={{
                      left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                      top: `${(cordillera.y / MAP_HEIGHT) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 6
                    }}
                  />
                </>
              )}
              <div
                className="absolute text-[10px] text-green-600 font-bold bg-white/90 px-1.5 py-0.5 rounded border border-green-600 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(cordillera.x / MAP_WIDTH) * 100}%`,
                  top: `${((cordillera.y - 20) / MAP_HEIGHT) * 100}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 7
                }}
              >
                {cordillera.nombre}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
