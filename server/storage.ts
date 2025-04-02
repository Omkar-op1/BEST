import { users, vegetables, feedback, type User, type InsertUser, type Vegetable, type InsertVegetable, type Feedback, type InsertFeedback, type FeedbackStats } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vegetable methods
  getVegetables(): Promise<Vegetable[]>;
  getVegetable(id: number): Promise<Vegetable | undefined>;
  createVegetable(vegetable: InsertVegetable): Promise<Vegetable>;
  
  // Feedback methods
  getFeedback(id: number): Promise<Feedback | undefined>;
  getUserFeedback(userId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackStats(): Promise<FeedbackStats[]>;
  getFeedbackStatsByMealType(mealType: string): Promise<FeedbackStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vegetables: Map<number, Vegetable>;
  private feedbacks: Map<number, Feedback>;
  
  private currentUserId: number;
  private currentVegetableId: number;
  private currentFeedbackId: number;
  
  constructor() {
    this.users = new Map();
    this.vegetables = new Map();
    this.feedbacks = new Map();
    
    this.currentUserId = 1;
    this.currentVegetableId = 1;
    this.currentFeedbackId = 1;
    
    // Initialize with some vegetable data
    this.initializeVegetables();
  }
  
  private initializeVegetables() {
    const vegetablesData: InsertVegetable[] = [
      { name: 'Spinach Curry', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1576046563361-7e1108b8c8d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Mixed Vegetable', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Aloo Gobi', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Bitter Gourd', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1603507412979-e5ce16eef9b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Lady Finger', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1648172895175-03967e897192?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Brinjal Curry', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1613081571760-e99117d5ade4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { name: 'Paneer Butter Masala', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
    ];
    
    vegetablesData.forEach(veg => {
      this.createVegetable(veg);
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vegetable methods
  async getVegetables(): Promise<Vegetable[]> {
    return Array.from(this.vegetables.values());
  }
  
  async getVegetable(id: number): Promise<Vegetable | undefined> {
    return this.vegetables.get(id);
  }
  
  async createVegetable(insertVegetable: InsertVegetable): Promise<Vegetable> {
    const id = this.currentVegetableId++;
    const vegetable: Vegetable = { ...insertVegetable, id };
    this.vegetables.set(id, vegetable);
    return vegetable;
  }
  
  // Feedback methods
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }
  
  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(
      (feedback) => feedback.userId === userId,
    );
  }
  
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentFeedbackId++;
    const now = new Date();
    const feedback: Feedback = { ...insertFeedback, id, createdAt: now };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
  
  async getFeedbackStats(): Promise<FeedbackStats[]> {
    // Get all vegetables
    const veggies = Array.from(this.vegetables.values());
    const allFeedback = Array.from(this.feedbacks.values());
    
    // Calculate stats for each vegetable
    return veggies.map(vegetable => {
      const vegetableFeedback = allFeedback.filter(f => f.vegetableId === vegetable.id);
      const likes = vegetableFeedback.filter(f => f.isLiked).length;
      const dislikes = vegetableFeedback.filter(f => !f.isLiked).length;
      const total = likes + dislikes;
      const percentage = total > 0 ? Math.round((likes / total) * 100) : 0;
      
      return {
        vegetableId: vegetable.id,
        vegetableName: vegetable.name,
        likes,
        dislikes,
        percentage,
        mealType: vegetable.mealType
      };
    });
  }
  
  async getFeedbackStatsByMealType(mealType: string): Promise<FeedbackStats[]> {
    const allStats = await this.getFeedbackStats();
    return allStats.filter(stat => {
      const vegetable = this.vegetables.get(stat.vegetableId);
      return vegetable && vegetable.mealType === mealType;
    });
  }
}

export const storage = new MemStorage();
