import { db } from "./index";
import { elementosGeograficos, settings, type ElementoGeografico, type NewElementoGeografico, type Settings, type NewSettings } from "./schema";
import { eq } from "drizzle-orm";

export async function getAllElementosGeograficos(): Promise<ElementoGeografico[]> {
  return await db.select().from(elementosGeograficos);
}

export async function getElementoGeograficoById(id: string): Promise<ElementoGeografico | undefined> {
  const result = await db.select().from(elementosGeograficos).where(eq(elementosGeograficos.id, id));
  return result[0];
}

export async function createElementoGeografico(data: NewElementoGeografico): Promise<ElementoGeografico> {
  const result = await db.insert(elementosGeograficos).values(data).returning();
  return result[0];
}

export async function updateElementoGeografico(id: string, data: Partial<NewElementoGeografico>): Promise<ElementoGeografico | undefined> {
  const result = await db.update(elementosGeograficos).set(data).where(eq(elementosGeograficos.id, id)).returning();
  return result[0];
}

export async function deleteElementoGeografico(id: string): Promise<void> {
  await db.delete(elementosGeograficos).where(eq(elementosGeograficos.id, id));
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
