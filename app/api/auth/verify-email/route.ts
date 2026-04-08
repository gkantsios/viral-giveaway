import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { email: record.identifier },
    data: { emailVerified: true },
  });

  await db.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
