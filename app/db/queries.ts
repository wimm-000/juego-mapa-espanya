import { db } from "./index";
import { cordilleras, settings, type Cordillera, type NewCordillera, type Settings, type NewSettings } from "./schema";
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

export async function getSettings(): Promise<Settings> {
  const result = await db.select().from(settings).where(eq(settings.id, "main"));
  if (result.length === 0) {
    const newSettings = await db.insert(settings).values({ id: "main", testMode: false }).returning();
    return newSettings[0];
  }
  return result[0];
}

export async function updateTestMode(enabled: boolean): Promise<Settings> {
  const result = await db.update(settings).set({ testMode: enabled }).where(eq(settings.id, "main")).returning();
  return result[0];
}
