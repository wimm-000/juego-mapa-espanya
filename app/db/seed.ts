import { db } from "./index";
import { elementosGeograficos, categorias } from "./schema";

const categoriasData = [
  { id: "cat-montanas", nombre: "Montañas" },
  { id: "cat-sistemas", nombre: "Sistemas Montañosos" },
  { id: "cat-volcanes", nombre: "Volcanes" },
  { id: "cat-mesetas", nombre: "Mesetas" },
];

const initialData = [
  { id: "1760995484540", nombre: "Macizo galaico", categoriaId: "cat-montanas", x: 199, y: 62, tolerancia: 29 },
  { id: "1760995712714", nombre: "Roque de los Muchachos", categoriaId: "cat-volcanes", x: 18, y: 451, tolerancia: 19 },
  { id: "1760995746578", nombre: "Teide", categoriaId: "cat-volcanes", x: 65, y: 472, tolerancia: 16 },
  { id: "1760995893079", nombre: "Montes de Leon", categoriaId: "cat-montanas", x: 250, y: 67, tolerancia: 30, width: 60, height: 20, rotation: -89 },
  { id: "1760995988153", nombre: "Cordillera Cantabrica", categoriaId: "cat-sistemas", x: 331, y: 50, tolerancia: 30, width: 114, height: 29, rotation: 0 },
  { id: "1760996065607", nombre: "Montes vascos", categoriaId: "cat-montanas", x: 442, y: 49, tolerancia: 30, width: 53, height: 36, rotation: 0 },
  { id: "1760996107976", nombre: "Pirineos", categoriaId: "cat-sistemas", x: 582, y: 69, tolerancia: 30, width: 194, height: 40, rotation: 0 },
  { id: "1760996329239", nombre: "Submeseta Norte", categoriaId: "cat-mesetas", x: 318, y: 114, tolerancia: 47, width: 100, height: 60, rotation: 0 },
  { id: "1760996425273", nombre: "Sistema central", categoriaId: "cat-sistemas", x: 332, y: 184, tolerancia: 30, width: 136, height: 29, rotation: -23 },
  { id: "1760996535369", nombre: "Sistema Iberico", categoriaId: "cat-sistemas", x: 442, y: 151, tolerancia: 30, width: 139, height: 55, rotation: 58 },
  { id: "1760998211128", nombre: "Cordilleras Costero Catalanas", categoriaId: "cat-sistemas", x: 610, y: 144, tolerancia: 30, width: 146, height: 38, rotation: -31 }
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Limpiar tablas existentes
  await db.delete(elementosGeograficos);
  await db.delete(categorias);

  // Insertar categorías primero
  await db.insert(categorias).values(categoriasData);

  // Insertar datos iniciales de elementos geográficos
  await db.insert(elementosGeograficos).values(initialData);

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
