import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

// In-memory user storage
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
}

const users = new Map<string, User>();
const userEmails = new Set<string>();

function createUser(email: string, passwordHash: string, name?: string): User {
  const id = crypto.randomUUID();
  const user: User = { id, email, passwordHash, name: name || null };
  users.set(id, user);
  userEmails.add(email);
  return user;
}

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

    if (userEmails.has(email)) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(email, passwordHash, name);

    return NextResponse.json(
      { message: "Account created successfully. You can now sign in.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
