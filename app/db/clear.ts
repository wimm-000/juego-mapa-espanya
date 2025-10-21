import { db } from "./index";
import { elementosGeograficos } from "./schema";

async function clear() {
  console.log("🗑️  Clearing database...");
  
  // Eliminar todos los registros
  await db.delete(elementosGeograficos);
  
  console.log("✅ Database cleared successfully!");
  process.exit(0);
}

clear().catch((error) => {
  console.error("❌ Error clearing database:", error);
  process.exit(1);
});
