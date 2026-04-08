import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  prize: z.string().min(1).max(500),
  rules: z.string().max(5000).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giveaways = await db.giveaway.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return NextResponse.json(giveaways);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, prize, rules, startDate, endDate } = parsed.data;

  // Generate unique slug
  let slug = slugify(title);
  let suffix = 0;
  while (await db.giveaway.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${slugify(title)}-${suffix}`;
  }

  const giveaway = await db.giveaway.create({
    data: {
      userId: session.user.id,
      title,
      description: description ?? null,
      prize,
      slug,
      rules: rules ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(giveaway, { status: 201 });
}
