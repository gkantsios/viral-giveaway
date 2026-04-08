import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
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

  const search = req.nextUrl.searchParams;
  const page = parseInt(search.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(search.get("limit") ?? "50", 10), 200);
  const skip = (page - 1) * limit;
  const q = search.get("q");

  const [entries, total] = await Promise.all([
    db.entry.findMany({
      where: {
        giveawayId: params.id,
        ...(q ? { email: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.entry.count({
      where: {
        giveawayId: params.id,
        ...(q ? { email: { contains: q, mode: "insensitive" } } : {}),
      },
    }),
  ]);

  // CSV export
  if (search.get("format") === "csv") {
    const header = "email,totalEntries,emailVerified,createdAt,referralCode\n";
    const rows = entries
      .map(
        (e) =>
          `${e.email},${e.totalEntries},${e.emailVerified},${e.createdAt.toISOString()},${e.referralCode}`
      )
      .join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="entries-${params.id}.csv"`,
      },
    });
  }

  return NextResponse.json({ entries, total, page, limit });
}
