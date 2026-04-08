import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  prize: z.string().min(1).max(500).optional(),
  rules: z.string().max(5000).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

async function getOwnedGiveaway(id: string, userId: string) {
  return db.giveaway.findFirst({ where: { id, userId } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giveaway = await getOwnedGiveaway(params.id, session.user.id);
  if (!giveaway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(giveaway);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giveaway = await getOwnedGiveaway(params.id, session.user.id);
  if (!giveaway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (giveaway.status === "ENDED") {
    return NextResponse.json(
      { error: "Cannot edit an ended giveaway" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { startDate, endDate, ...rest } = parsed.data;
  const updated = await db.giveaway.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(startDate !== undefined && {
        startDate: startDate ? new Date(startDate) : null,
      }),
      ...(endDate !== undefined && {
        endDate: endDate ? new Date(endDate) : null,
      }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giveaway = await getOwnedGiveaway(params.id, session.user.id);
  if (!giveaway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.giveaway.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
