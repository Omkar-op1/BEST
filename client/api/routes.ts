import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extendedUserSchema, insertFeedbackSchema, type LoginData } from "@shared/schema";
import { z } from "zod";
import { ValidationError } from "zod-validation-error";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "best-app-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || user.password !== password) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = extendedUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const validationError = new ValidationError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Vegetable Routes
  app.get("/api/vegetables", async (req, res) => {
    try {
      const vegetables = await storage.getVegetables();
      res.json(vegetables);
    } catch (err) {
      res.status(500).json({ message: "Error fetching vegetables" });
    }
  });

  // Feedback Routes
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userId
      });
      
      const newFeedback = await storage.createFeedback(feedbackData);
      res.status(201).json(newFeedback);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const validationError = new ValidationError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating feedback" });
    }
  });

  app.get("/api/feedback/stats", async (req, res) => {
    try {
      const mealType = req.query.mealType as string;
      
      let stats;
      if (mealType && (mealType === 'lunch' || mealType === 'dinner')) {
        stats = await storage.getFeedbackStatsByMealType(mealType);
      } else {
        stats = await storage.getFeedbackStats();
      }
      
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Error fetching feedback stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
