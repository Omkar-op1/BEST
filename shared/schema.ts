import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  prnNumber: text("prn_number").notNull(),
  email: text("email").notNull().unique(),
});

export const vegetables = pgTable("vegetables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(), // lunch or dinner
  imageUrl: text("image_url"),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vegetableId: integer("vegetable_id").notNull(),
  isLiked: boolean("is_liked").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  prnNumber: true,
  email: true,
});

export const insertVegetableSchema = createInsertSchema(vegetables).pick({
  name: true,
  mealType: true,
  imageUrl: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  userId: true,
  vegetableId: true,
  isLiked: true,
});

// Extended schemas with validation
export const extendedUserSchema = insertUserSchema.extend({
  email: z.string().email().refine(
    (email) => email.endsWith('@bitwardha.ac.in'),
    {
      message: "Email must end with @bitwardha.ac.in",
    }
  ),
  password: z.string().min(8, "Password must be at least 8 characters")
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ExtendedUser = z.infer<typeof extendedUserSchema>;

export type Vegetable = typeof vegetables.$inferSelect;
export type InsertVegetable = z.infer<typeof insertVegetableSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface FeedbackStats {
  vegetableId: number;
  vegetableName: string;
  likes: number;
  dislikes: number;
  percentage: number;
  mealType: string;
}
