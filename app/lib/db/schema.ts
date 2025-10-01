import { pgTable, serial, varchar, text, integer, decimal, timestamp, pgEnum, boolean, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum para el nivel de riesgo
export const riskLevelEnum = pgEnum('risk_level', ['Bajo', 'Medio', 'Alto']);

// Enum para roles de usuario
export const userRoleEnum = pgEnum('user_role', ['admin', 'investor']);

// Tabla de usuarios (autenticación + inversores)
export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 64 }).unique().notNull(),
  password: varchar('password', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  role: userRoleEnum('role').default('investor'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla de productores
export const producers = pgTable('producers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 50 }),
  location: varchar('location', { length: 255 }),
  experience: integer('experience').notNull(), // Años de experiencia
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nota: Los inversores ahora usan la tabla users existente

// Tabla de campañas (limpia, sin datos redundantes)
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  crop: varchar('crop', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }).notNull(),
  closingDate: timestamp('closing_date').notNull(), // Fecha límite para reservas
  expectedReturn: decimal('expected_return', { precision: 5, scale: 2 }).notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  iconUrl: varchar('icon_url', { length: 500 }),
  mapsLink: varchar('maps_link', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Campos para simulador de inversión
  costPerPlant: decimal('cost_per_plant', { precision: 10, scale: 2 }).notNull(),
  plantsPerM2: integer('plants_per_m2').notNull(),
  minPlants: integer('min_plants').notNull(),
  maxPlants: integer('max_plants').notNull(),
  marketPrice: decimal('market_price', { precision: 10, scale: 2 }).notNull().default('0'),
  
  // Foreign key al productor
  producerId: integer('producer_id').references(() => producers.id).notNull(),
});

// Tabla de inversiones (relación muchos a muchos entre users y campañas)
export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  plantCount: integer('plant_count').notNull(), // Cantidad de plantas reservadas
  isPaid: boolean('is_paid').default(false), // Indica si la inversión está pagada
  investedAt: timestamp('invested_at').defaultNow().notNull(),
  
  // Foreign keys
  campaignId: integer('campaign_id').references(() => campaigns.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
});

// Tabla de cronograma de campañas (flexible)
export const campaignTimeline = pgTable('campaign_timeline', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id).notNull(),
  title: varchar('title', { length: 255 }).notNull().default('Cronograma de la Campaña'),
  events: jsonb('events').notNull().default('[]'), // Array de eventos: [{title, date, description}]
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Definir relaciones para Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  investments: many(investments),
}));

export const producersRelations = relations(producers, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  producer: one(producers, {
    fields: [campaigns.producerId],
    references: [producers.id],
  }),
  investments: many(investments),
  timeline: one(campaignTimeline, {
    fields: [campaigns.id],
    references: [campaignTimeline.campaignId],
  }),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [investments.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
}));

export const campaignTimelineRelations = relations(campaignTimeline, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignTimeline.campaignId],
    references: [campaigns.id],
  }),
}));

// Tipos TypeScript inferidos del esquema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Producer = typeof producers.$inferSelect;
export type NewProducer = typeof producers.$inferInsert;

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;

export type CampaignTimeline = typeof campaignTimeline.$inferSelect;
export type NewCampaignTimeline = typeof campaignTimeline.$inferInsert;