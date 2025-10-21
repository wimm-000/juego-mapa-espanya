import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const cordilleras = sqliteTable("cordilleras", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
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

export type Cordillera = typeof cordilleras.$inferSelect;
export type NewCordillera = typeof cordilleras.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
