import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coloca en el Mapa de España" },
    { name: "description", content: "Juego de geografía de España" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-7xl mb-4">🏔️ 🇪🇸 ⛰️</div>

      <h1 className="text-5xl font-bold text-center m-0">
        Coloca en el Mapa de España
      </h1>

      <p className="text-xl text-center text-gray-600 max-w-2xl m-0">
        ¡Aprende la geografía de España de forma divertida! 🎯
        <br />
        Coloca las principales cordilleras en su ubicación correcta
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link to="/juego">
          <button className="text-2xl px-8 py-4 rounded-lg border-none bg-blue-600 text-white cursor-pointer font-semibold shadow-md hover:bg-blue-700 transition-colors">
            🎮 Jugar
          </button>
        </Link>

        <Link to="/estudiar">
          <button className="text-2xl px-8 py-4 rounded-lg border-none bg-green-600 text-white cursor-pointer font-semibold shadow-md hover:bg-green-700 transition-colors">
            📚 Estudiar
          </button>
        </Link>
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link to="/dev">
          <button className="text-2xl w-full flex-grow px-8 py-4 rounded-lg border-2 border-gray-500 bg-transparent text-gray-500 cursor-pointer font-semibold hover:bg-gray-500 hover:text-white transition-colors">
            🛠️ Modo Desarrollo
          </button>
        </Link>
      </div>
    </div>
  );
}
