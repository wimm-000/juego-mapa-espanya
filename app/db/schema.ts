import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categorias = sqliteTable("categorias", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
});

export const elementosGeograficos = sqliteTable("elementos_geograficos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  categoriaId: text("categoria_id").references(() => categorias.id),
  x: real("x").notNull(),
  y: real("y").notNull(),
  tolerancia: real("tolerancia").notNull(),
  width: real("width"),
  height: real("height"),
  rotation: real("rotation"),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  testMode: integer("testMode", { mode: "boolean" }).notNull().default(false),
});

export type Categoria = typeof categorias.$inferSelect;
export type NewCategoria = typeof categorias.$inferInsert;
export type ElementoGeografico = typeof elementosGeograficos.$inferSelect;
export type NewElementoGeografico = typeof elementosGeograficos.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
