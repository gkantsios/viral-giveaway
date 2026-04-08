import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { EspProvider } from "@prisma/client";

const addSchema = z.object({
  provider: z.enum(["MAILCHIMP", "CONVERTKIT", "ACTIVECAMPAIGN"]),
  accessToken: z.string().min(1),
  listId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db.espConnection.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      listId: true,
      createdAt: true,
      updatedAt: true,
      // Never expose accessToken in list
    },
  });

  return NextResponse.json(connections);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { provider, accessToken, listId } = parsed.data;

  const connection = await db.espConnection.upsert({
    where: {
      userId_provider: { userId: session.user.id, provider: provider as EspProvider },
    },
    create: {
      userId: session.user.id,
      provider: provider as EspProvider,
      accessToken,
      listId: listId ?? null,
    },
    update: {
      accessToken,
      listId: listId ?? null,
    },
    select: { id: true, provider: true, listId: true, createdAt: true },
  });

  return NextResponse.json(connection, { status: 201 });
}
