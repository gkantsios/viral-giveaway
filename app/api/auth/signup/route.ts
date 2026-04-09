import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

// Simple in-memory user registry to check for duplicates
const userEmails = new Set<string>();

export async function POST(req: NextRequest) {
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
  userEmails.add(email);

  return NextResponse.json(
    { message: "Account created successfully. You can now sign in.", userId: user.id },
    { status: 201 }
  );
}
