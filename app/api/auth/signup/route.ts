import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if email already exists in database
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully. You can now sign in.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";

    console.error("Signup error:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
    });

    // Provide more specific error messages for debugging
    if (
      errorMessage.includes("Connection refused") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("unable to connect") ||
      errorMessage.includes("SQLITE_CANTOPEN")
    ) {
      return NextResponse.json(
        { error: "Database connection failed. Initializing database..." },
        { status: 503 }
      );
    }

    if (
      errorMessage.includes("SQLITE_ERROR") ||
      errorMessage.includes("no such table")
    ) {
      return NextResponse.json(
        { error: "Database tables not initialized. Please try again in a moment." },
        { status: 503 }
      );
    }

    if (errorMessage.includes("Invalid") || errorMessage.includes("invalid")) {
      return NextResponse.json(
        { error: `Invalid request: ${errorMessage}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
