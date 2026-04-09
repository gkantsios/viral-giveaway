"use server";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// In-memory user storage for testing
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
}

const users = new Map<string, User>();

// Helper function to find user by email
function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = findUserByEmail(email);
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});

// Export functions for user management
export function createUser(email: string, passwordHash: string, name?: string): User {
  const id = crypto.randomUUID();
  const user: User = { id, email, passwordHash, name: name || null };
  users.set(id, user);
  return user;
}
