# Database Integration - SQLite + Drizzle ORM

## 📋 Overview

The project has been integrated with SQLite database using Drizzle ORM for persistent storage of elementos_geograficos (geographic elements).

## 🗂️ File Structure

```
app/
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Database schema definition
│   ├── queries.ts        # Database query functions
│   └── seed.ts           # Database seeding script
drizzle.config.ts         # Drizzle Kit configuration
sqlite.db                 # SQLite database file (gitignored)
```

## 📊 Schema

### `elementos_geograficos` Table

| Column     | Type   | Nullable | Description                          |
|------------|--------|----------|--------------------------------------|
| id         | text   | ❌       | Primary key                          |
| nombre     | text   | ❌       | Name of the cordillera               |
| x          | real   | ❌       | X coordinate on map                  |
| y          | real   | ❌       | Y coordinate on map                  |
| tolerancia | real   | ❌       | Tolerance radius for placement       |
| width      | real   | ✅       | Width for rectangular zones          |
| height     | real   | ✅       | Height for rectangular zones         |
| rotation   | real   | ✅       | Rotation angle for rectangular zones |

## 🔧 Available Functions

### `queries.ts`

- `getAllElementosGeograficos()` - Get all cordilleras
- `getElementoGeograficoById(id)` - Get single cordillera by ID
- `createElementoGeografico(data)` - Create new cordillera
- `updateElementoGeografico(id, data)` - Update existing cordillera
- `deleteElementoGeografico(id)` - Delete cordillera

## 🚀 Usage in Routes

### Juego Route (`app/routes/juego.tsx`)

```typescript
import { getAllElementosGeograficos } from "../db/queries";
import type { ElementoGeografico } from "../db/schema";

export async function loader() {
  const cordilleras = await getAllElementosGeograficos();
  return { cordilleras };
}

export default function Juego({ loaderData }: Route.ComponentProps) {
  const { cordilleras } = loaderData;
  // ... component code
}
```

### Dev Route (`app/routes/dev.tsx`)

```typescript
import { getAllElementosGeograficos } from "../db/queries";
import type { ElementoGeografico } from "../db/schema";

export async function loader() {
  const cordilleras = await getAllElementosGeograficos();
  return { cordilleras };
}

export default function Dev({ loaderData }: Route.ComponentProps) {
  const { cordilleras } = loaderData;
  // ... component code
}
```

## 📦 NPM Scripts

| Script         | Description                                |
|----------------|--------------------------------------------|
| `db:generate`  | Generate migration files from schema       |
| `db:migrate`   | Run pending migrations                     |
| `db:push`      | Push schema changes to database (dev)      |
| `db:studio`    | Open Drizzle Studio (database GUI)         |
| `db:seed`      | Seed database with initial cordilleras     |

## 🌱 Initial Data

The database is seeded with 6 elementos_geograficos:

1. **Pirineos** - (490, 80) - tolerance: 60
2. **ElementoGeografico Cantábrica** - (150, 90) - tolerance: 60
3. **Sistema Ibérico** - (350, 200) - tolerance: 60
4. **Sierra Morena** - (220, 350) - tolerance: 60
5. **Sistemas Béticos** - (300, 430) - tolerance: 60
6. **asdf** (test zone) - (312, 151) - rectangular zone with rotation

## 🔄 Migration from Static Data

### Before
```typescript
// app/data/cordilleras.ts
export const cordilleras: ElementoGeografico[] = [
  { id: "1", nombre: "Pirineos", x: 490, y: 80, tolerancia: 60 },
  // ...
];
```

### After
```typescript
// app/routes/juego.tsx
export async function loader() {
  const cordilleras = await getAllElementosGeograficos();
  return { cordilleras };
}
```

## 🎯 Benefits

1. **Persistence** - Data is stored in SQLite database
2. **Type Safety** - Full TypeScript support with Drizzle
3. **Easy Queries** - Type-safe query builder
4. **Developer Tools** - Drizzle Studio for visual database management
5. **Migrations** - Schema version control
6. **Server-Side** - Data loading happens on the server (loaders)

## 📝 Next Steps

To extend the database functionality:

1. **Add Actions** - Create React Router actions to add/update cordilleras from the UI
2. **User Scores** - Add a scores table to track user performance
3. **Difficulty Levels** - Add difficulty settings per cordillera
4. **Statistics** - Track success/failure rates per cordillera

Example action:

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  await createElementoGeografico({
    id: crypto.randomUUID(),
    nombre: data.nombre as string,
    x: Number(data.x),
    y: Number(data.y),
    tolerancia: Number(data.tolerancia),
  });
  
  return redirect("/dev");
}
```

## 🛠️ Drizzle Studio

To visually manage your database:

```bash
npm run db:studio
```

This will open a web interface at `https://local.drizzle.studio` where you can:
- View all tables
- Edit data directly
- Run custom queries
- Explore relationships
