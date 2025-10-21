# 🇪🇸 Juego de Cordilleras de España ⛰️

Una aplicación educativa interactiva para aprender la geografía de España mediante un juego de arrastrar y soltar las cordilleras en su ubicación correcta en el mapa.

## 🎮 Características del Juego

- **Modo Juego**: Arrastra las cordilleras al mapa y colócalas en su posición correcta
- **Modo Estudiar**: Visualiza todas las cordilleras con sus nombres y ubicaciones
- **Modo Desarrollo**: Herramienta para crear y editar zonas geográficas con:
  - Puntos circulares con tolerancia ajustable
  - Zonas rectangulares con dimensiones y rotación personalizables
  - Modo Test activable para verificar posiciones exactas
- **Sistema de Puntuación**: 100 puntos por cada cordillera colocada correctamente
- **Feedback Visual**: Confeti animado al completar el juego sin errores
- **Áreas de Ayuda**: Toggle para mostrar las zonas de ubicación sin revelar nombres

## 🛠️ Tecnologías

- **Framework**: React Router v7 con SSR
- **Database**: SQLite + Drizzle ORM
- **Styling**: TailwindCSS
- **TypeScript**: Tipado estático
- **Confetti**: canvas-confetti para animaciones

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Database Setup

Este proyecto usa SQLite con Drizzle ORM para almacenar las cordilleras y configuración. Para configurar la base de datos:

```bash
# Push schema to database
npm run db:push

# Seed the database with initial cordilleras data
npm run db:seed

# Open Drizzle Studio (database GUI)
npm run db:studio
```

#### Database Scripts

- `npm run db:generate` - Generar archivos de migración
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:push` - Push schema directamente a la BD (desarrollo)
- `npm run db:studio` - Abrir Drizzle Studio (interfaz gráfica)
- `npm run db:seed` - Poblar BD con cordilleras iniciales

## 📚 Estructura del Proyecto

```
app/
├── components/
│   └── MapaEspana.tsx       # Componente del mapa (no usado actualmente)
├── constants/
│   └── map.ts               # Constantes de dimensiones del mapa
├── db/
│   ├── schema.ts            # Schema de BD (cordilleras y settings)
│   ├── queries.ts           # Funciones de consulta
│   ├── seed.ts              # Datos iniciales de cordilleras
│   └── index.ts             # Configuración de Drizzle
├── routes/
│   ├── home.tsx             # Página principal
│   ├── juego.tsx            # Modo juego principal
│   ├── estudiar.tsx         # Modo estudio con todas las cordilleras
│   └── dev.tsx              # Herramienta de desarrollo
└── app.css                  # Estilos globales
```

## 🎯 Cómo Jugar

1. **Inicio**: Haz clic en "🎮 Jugar" desde la página principal
2. **Arrastrar**: Arrastra cada cordillera de la lista lateral al mapa
3. **Soltar**: Suelta la cordillera en su ubicación correcta
4. **Feedback**: Las cordilleras correctas se marcan en verde, las incorrectas aparecen en rojo
5. **Puntuación**: Ganas 100 puntos por cada acierto
6. **Ayuda**: Usa el botón "📍 Mostrar Áreas" para ver pistas visuales
7. **Completar**: Al terminar, verás tu puntuación final y confeti si no tuviste errores

## 🔧 Modo Desarrollo

El modo desarrollo permite crear y editar cordilleras:

1. **Crear Punto/Zona**: 
   - Ingresa el nombre de la cordillera
   - Ajusta la tolerancia (para puntos circulares)
   - Activa "zona rectangular" para crear áreas extensas
   - Haz clic en el mapa para colocar

2. **Editar**:
   - Arrastra puntos/zonas para reposicionar
   - Selecciona para ajustar tolerancia, dimensiones o rotación
   - Convierte entre punto circular y zona rectangular

3. **Modo Test**:
   - Activa desde el botón "🧪 Activar Modo Test"
   - El estado se guarda en la BD
   - Al jugar, verás todas las ubicaciones correctas con nombres

## 📊 Base de Datos

### Tabla: `cordilleras`
- `id`: Identificador único (timestamp)
- `nombre`: Nombre de la cordillera
- `x`, `y`: Coordenadas en el mapa
- `tolerancia`: Radio de tolerancia para puntos circulares
- `width`, `height`, `rotation`: Dimensiones y rotación para zonas rectangulares

### Tabla: `settings`
- `id`: "main"
- `testMode`: Boolean para activar/desactivar modo test

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## 🎨 Estilos

Este proyecto usa [Tailwind CSS](https://tailwindcss.com/) para todos los estilos. La paleta de colores incluye:
- 🔵 Azul para cordilleras no colocadas
- 🟢 Verde para aciertos
- 🔴 Rojo para fallos
- 🟡 Amarillo para modo test y áreas activas

## 📝 Notas de Desarrollo

- Las coordilleras se pueden actualizar editando `app/db/seed.ts` y ejecutando `npm run db:seed`
- El mapa base está en `/public/mapa_relieve_espana_peq.jpg`
- Las dimensiones del mapa se definen en `app/constants/map.ts` (800x500)
- El seed actual incluye 11 cordilleras de España

---

Construido con ❤️ usando React Router y Drizzle ORM.
