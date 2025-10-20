import { db } from "./index";
import { cordilleras } from "./schema";

const initialData = [
  { id: "1", nombre: "Pirineos", x: 490, y: 80, tolerancia: 60 },
  { id: "2", nombre: "Cordillera Cantábrica", x: 150, y: 90, tolerancia: 60 },
  { id: "3", nombre: "Sistema Ibérico", x: 350, y: 200, tolerancia: 60 },
  { id: "4", nombre: "Sierra Morena", x: 220, y: 350, tolerancia: 60 },
  { id: "5", nombre: "Sistemas Béticos", x: 300, y: 430, tolerancia: 60 },
  {
    id: "6",
    nombre: "asdf",
    x: 312,
    y: 151,
    tolerancia: 43,
    width: 128,
    height: 37,
    rotation: -25
  }
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Limpiar tabla existente
  await db.delete(cordilleras);
  
  // Insertar datos iniciales
  await db.insert(cordilleras).values(initialData);
  
  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
