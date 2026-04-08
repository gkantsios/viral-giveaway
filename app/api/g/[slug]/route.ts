import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const giveaway = await db.giveaway.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      description: true,
      prize: true,
      slug: true,
      rules: true,
      status: true,
      startDate: true,
      endDate: true,
      _count: { select: { entries: true } },
    },
  });

  if (!giveaway || giveaway.status === "DRAFT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(giveaway);
}
