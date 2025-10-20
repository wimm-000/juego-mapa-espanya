import { db } from "./index";
import { cordilleras, type Cordillera, type NewCordillera } from "./schema";
import { eq } from "drizzle-orm";

export async function getAllCordilleras(): Promise<Cordillera[]> {
  return await db.select().from(cordilleras);
}

export async function getCordilleraById(id: string): Promise<Cordillera | undefined> {
  const result = await db.select().from(cordilleras).where(eq(cordilleras.id, id));
  return result[0];
}

export async function createCordillera(data: NewCordillera): Promise<Cordillera> {
  const result = await db.insert(cordilleras).values(data).returning();
  return result[0];
}

export async function updateCordillera(id: string, data: Partial<NewCordillera>): Promise<Cordillera | undefined> {
  const result = await db.update(cordilleras).set(data).where(eq(cordilleras.id, id)).returning();
  return result[0];
}

export async function deleteCordillera(id: string): Promise<void> {
  await db.delete(cordilleras).where(eq(cordilleras.id, id));
}
