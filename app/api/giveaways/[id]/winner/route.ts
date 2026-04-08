import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWinnerEmail } from "@/lib/email";

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

  if (giveaway.winnerId) {
    return NextResponse.json({ error: "Winner already selected" }, { status: 400 });
  }

  // Weighted random selection: each entry gets totalEntries tickets
  const entries = await db.entry.findMany({
    where: { giveawayId: params.id, emailVerified: true },
  });

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No verified entries to pick from" },
      { status: 400 }
    );
  }

  // Build ticket pool
  const tickets: string[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.totalEntries; i++) {
      tickets.push(entry.id);
    }
  }

  const winnerEntryId = tickets[Math.floor(Math.random() * tickets.length)];
  const winnerEntry = entries.find((e) => e.id === winnerEntryId)!;

  const updated = await db.giveaway.update({
    where: { id: params.id },
    data: { winnerId: winnerEntryId, status: "ENDED" },
    include: { winner: true },
  });

  // Notify winner
  await sendWinnerEmail(winnerEntry.email, giveaway.title, giveaway.prize);

  return NextResponse.json(updated);
}
