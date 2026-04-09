import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check if user has a valid session token
    const token = request.cookies.get("next-auth.session-token");

    if (!token?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, return an empty list since we don't have database integration
    // In production, this would query:
    // const giveaways = await db.giveaway.findMany({
    //   where: { userId: session.user.id },
    //   include: { _count: { select: { entries: true } } },
    //   orderBy: { createdAt: 'desc' }
    // });

    return NextResponse.json([]);
  } catch (error) {
    console.error("Failed to fetch giveaways:", error);
    return NextResponse.json(
      { error: "Failed to fetch giveaways" },
      { status: 500 }
    );
  }
}
