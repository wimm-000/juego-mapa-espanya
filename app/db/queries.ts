import { db } from "./index";
import { elementosGeograficos, categorias, settings, type ElementoGeografico, type NewElementoGeografico, type Categoria, type NewCategoria, type Settings, type NewSettings } from "./schema";
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

// Category functions
export async function getAllCategorias(): Promise<Categoria[]> {
  return await db.select().from(categorias);
}

export async function getCategoriaById(id: string): Promise<Categoria | undefined> {
  const result = await db.select().from(categorias).where(eq(categorias.id, id));
  return result[0];
}

export async function createCategoria(data: NewCategoria): Promise<Categoria> {
  const result = await db.insert(categorias).values(data).returning();
  return result[0];
}

export async function updateCategoria(id: string, data: Partial<NewCategoria>): Promise<Categoria | undefined> {
  const result = await db.update(categorias).set(data).where(eq(categorias.id, id)).returning();
  return result[0];
}

export async function deleteCategoria(id: string): Promise<void> {
  await db.delete(categorias).where(eq(categorias.id, id));
}

// Get geographic features with their categories
export async function getAllElementosGeograficosWithCategorias(): Promise<(ElementoGeografico & { categoria?: Categoria | null })[]> {
  const result = await db
    .select({
      id: elementosGeograficos.id,
      nombre: elementosGeograficos.nombre,
      categoriaId: elementosGeograficos.categoriaId,
      x: elementosGeograficos.x,
      y: elementosGeograficos.y,
      tolerancia: elementosGeograficos.tolerancia,
      width: elementosGeograficos.width,
      height: elementosGeograficos.height,
      rotation: elementosGeograficos.rotation,
      categoria: categorias,
    })
    .from(elementosGeograficos)
    .leftJoin(categorias, eq(elementosGeograficos.categoriaId, categorias.id));

  return result;
}
