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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '1rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 0
      }}>
        Coloca en el Mapa de España
      </h1>
      
      <p style={{
        fontSize: '1.25rem',
        textAlign: 'center',
        color: '#666',
        maxWidth: '600px',
        margin: 0
      }}>
        Aprende la geografía de España colocando las principales cordilleras en su ubicación correcta
      </p>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link to="/juego">
          <button style={{
            fontSize: '1.5rem',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}>
            🎮 Jugar
          </button>
        </Link>

        <Link to="/dev">
          <button style={{
            fontSize: '1.5rem',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            border: '2px solid #6c757d',
            backgroundColor: 'transparent',
            color: '#6c757d',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            🛠️ Modo Desarrollo
          </button>
        </Link>
      </div>
    </div>
  );
}
