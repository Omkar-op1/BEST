import { MongoClient, Collection, Db } from "mongodb";
import { 
  type User, 
  type InsertUser, 
  type Vegetable, 
  type InsertVegetable, 
  type Feedback, 
  type InsertFeedback, 
  type FeedbackStats 
} from "@shared/schema";
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

export class MongoDBStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(private uri: string) {
    this.client = new MongoClient(this.uri);
  }

  async connect() {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db("vegetableApp");
      await this.createIndexes();
      await this.initializeVegetables();
    }
  }

  async disconnect() {
    await this.client.close();
    this.db = null;
  }

  private async createIndexes() {
    if (!this.db) throw new Error("Database not connected");
    
    await this.usersCollection.createIndex({ email: 1 }, { unique: true });
    await this.usersCollection.createIndex({ username: 1 }, { unique: true });
    await this.feedbackCollection.createIndex({ userId: 1 });
    await this.feedbackCollection.createIndex({ vegetableId: 1 });
    await this.feedbackCollection.createIndex({ mealType: 1 });
    await this.vegetablesCollection.createIndex({ mealType: 1 });
  }

  private async initializeVegetables() {
    const count = await this.vegetablesCollection.countDocuments();
    if (count === 0) {
      const vegetablesData: InsertVegetable[] = [
        { name: 'Spinach Curry', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1576046563361-7e1108b8c8d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        // ... (rest of your vegetable data)
      ];
      
      await this.vegetablesCollection.insertMany(
        vegetablesData.map((veg, index) => ({ ...veg, id: index + 1 }))
      );
    }
  }

  private get usersCollection(): Collection<User> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<User>("users");
  }

  private get vegetablesCollection(): Collection<Vegetable> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<Vegetable>("vegetables");
  }

  private get feedbackCollection(): Collection<Feedback> {
    if (!this.db) throw new Error("Database not connected");
    return this.db.collection<Feedback>("feedback");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersCollection.findOne({ id }) || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersCollection.findOne({ username }) || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersCollection.findOne({ email }) || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const lastUser = await this.usersCollection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .next();
    const newId = lastUser?.id ? lastUser.id + 1 : 1;

    const user = { ...insertUser, id: newId };
    await this.usersCollection.insertOne(user);
    return user;
  }

  // Vegetable methods
  async getVegetables(): Promise<Vegetable[]> {
    return this.vegetablesCollection.find().toArray();
  }

  async getVegetable(id: number): Promise<Vegetable | undefined> {
    return this.vegetablesCollection.findOne({ id }) || undefined;
  }

  async createVegetable(insertVegetable: InsertVegetable): Promise<Vegetable> {
    const lastVegetable = await this.vegetablesCollection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .next();
    const newId = lastVegetable?.id ? lastVegetable.id + 1 : 1;

    const vegetable = { 
      ...insertVegetable, 
      id: newId,
      imageUrl: insertVegetable.imageUrl ?? null 
    };
    await this.vegetablesCollection.insertOne(vegetable);
    return vegetable;
  }

  // Feedback methods
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbackCollection.findOne({ id }) || undefined;
  }

  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return this.feedbackCollection.find({ userId }).toArray();
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const lastFeedback = await this.feedbackCollection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .next();
    const newId = lastFeedback?.id ? lastFeedback.id + 1 : 1;

    const now = new Date();
    const feedback = { ...insertFeedback, id: newId, createdAt: now };
    await this.feedbackCollection.insertOne(feedback);
    return feedback;
  }

  async getFeedbackStats(): Promise<FeedbackStats[]> {
    return this.vegetablesCollection.aggregate<FeedbackStats>([
      {
        $lookup: {
          from: "feedback",
          localField: "id",
          foreignField: "vegetableId",
          as: "feedback"
        }
      },
      {
        $project: {
          vegetableId: "$id",
          vegetableName: "$name",
          mealType: "$mealType",
          likes: {
            $size: {
              $filter: {
                input: "$feedback",
                as: "f",
                cond: { $eq: ["$$f.isLiked", true] }
              }
            }
          },
          dislikes: {
            $size: {
              $filter: {
                input: "$feedback",
                as: "f",
                cond: { $eq: ["$$f.isLiked", false] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total: { $add: ["$likes", "$dislikes"] }
        }
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$likes", "$total"] }, 100] }, 0] }
            ]
          }
        }
      }
    ]).toArray();
  }

  async getFeedbackStatsByMealType(mealType: string): Promise<FeedbackStats[]> {
    const allStats = await this.getFeedbackStats();
    return allStats.filter(stat => stat.mealType === mealType);
  }
}

// Initialize MongoDB storage
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://BEST:f4._Y_H8eW5q3Pd@cluster0.sp2zg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const storage = new MongoDBStorage(mongoUri);

// Connect to MongoDB when the app starts
storage.connect().catch(err => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await storage.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await storage.disconnect();
  process.exit(0);
});