import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db, usersTable, reportsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

// Signup
router.post("/auth/signup", async (req, res) => {
  try {
    const parsed = signupSchema.parse(req.body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsed.email));

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        name: parsed.name,
        email: parsed.email,
        passwordHash,
      })
      .returning();

    (req.session as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ecoPoints: user.ecoPoints,
        reportsCount: 0,
        joinedAt: user.joinedAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsed.email));

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(
      parsed.password,
      user.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    (req.session as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ecoPoints: user.ecoPoints,
        reportsCount: 0,
        joinedAt: user.joinedAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Logout
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      message: "Logged out",
    });
  });
});


// Current User
router.get("/auth/me", async (req, res) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sessionUser.id));

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  const [reportStats] = await db
  .select({
    reportsCount: count(),
  })
  .from(reportsTable)
  .where(eq(reportsTable.reporterId, user.id));

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ecoPoints: user.ecoPoints,
    reportsCount: reportStats.reportsCount,
    joinedAt: user.joinedAt.toISOString(),
  });
});

router.patch("/auth/profile", async (req, res) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const parsed = updateProfileSchema.parse(req.body);

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name: parsed.name,
      })
      .where(eq(usersTable.id, sessionUser.id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update session
    sessionUser.name = updatedUser.name;

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        ecoPoints: updatedUser.ecoPoints,
        reportsCount: 0,
        joinedAt: updatedUser.joinedAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(400).json(err);
  }
});
export default router;