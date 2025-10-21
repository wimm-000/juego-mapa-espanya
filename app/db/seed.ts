import { db } from "./index";
import { elementosGeograficos } from "./schema";

const initialData = [
  { id: "1760995484540", nombre: "Macizo galaico", x: 199, y: 62, tolerancia: 29 },
  { id: "1760995712714", nombre: "Roque de los Muchachos", x: 18, y: 451, tolerancia: 19 },
  { id: "1760995746578", nombre: "Teide", x: 65, y: 472, tolerancia: 16 },
  { id: "1760995893079", nombre: "Montes de Leon", x: 250, y: 67, tolerancia: 30, width: 60, height: 20, rotation: -89 },
  { id: "1760995988153", nombre: "Cordillera Cantabrica", x: 331, y: 50, tolerancia: 30, width: 114, height: 29, rotation: 0 },
  { id: "1760996065607", nombre: "Montes vascos", x: 442, y: 49, tolerancia: 30, width: 53, height: 36, rotation: 0 },
  { id: "1760996107976", nombre: "Pirineos", x: 582, y: 69, tolerancia: 30, width: 194, height: 40, rotation: 0 },
  { id: "1760996329239", nombre: "Submeseta Norte", x: 318, y: 114, tolerancia: 47, width: 100, height: 60, rotation: 0 },
  { id: "1760996425273", nombre: "Sistema central", x: 332, y: 184, tolerancia: 30, width: 136, height: 29, rotation: -23 },
  { id: "1760996535369", nombre: "Sistema Iberico", x: 442, y: 151, tolerancia: 30, width: 139, height: 55, rotation: 58 },
  { id: "1760998211128", nombre: "Cordilleras Costero Catalanas", x: 610, y: 144, tolerancia: 30, width: 146, height: 38, rotation: -31 }
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Limpiar tabla existente
  await db.delete(elementosGeograficos);

  // Insertar datos iniciales
  await db.insert(elementosGeograficos).values(initialData);
  
  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
