import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giveaway = await db.giveaway.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!giveaway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (giveaway.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only draft giveaways can be published" },
      { status: 400 }
    );
  }

  const updated = await db.giveaway.update({
    where: { id: params.id },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json(updated);
}
