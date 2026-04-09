import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

// Use global in-memory user storage (shared with auth route)
declare global {
  var authUsers: Map<string, {
    id: string;
    email: string;
    passwordHash: string;
    name: string | null;
  }>;
  var authEmails: Set<string>;
}

if (!global.authUsers) global.authUsers = new Map();
if (!global.authEmails) global.authEmails = new Set();

function createUser(email: string, passwordHash: string, name?: string) {
  const id = crypto.randomUUID();
  const user = { id, email, passwordHash, name: name || null };
  global.authUsers.set(id, user);
  global.authEmails.add(email);
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

    if (global.authEmails.has(email)) {
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
