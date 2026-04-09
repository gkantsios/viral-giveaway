import { NextResponse, type NextRequest } from "next/server";

// In-memory storage for giveaways (demo/testing only)
declare global {
  var giveaways: Map<string, { id: string; userId: string; title: string; description: string | null; status: string; createdAt: string }>;
}

if (!global.giveaways) {
  global.giveaways = new Map();
}

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

    // Return all giveaways (in production, would filter by user)
    const giveawaysList = Array.from(global.giveaways.values());
    return NextResponse.json(giveawaysList);
  } catch (error) {
    console.error("Failed to fetch giveaways:", error);
    return NextResponse.json(
      { error: "Failed to fetch giveaways" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user has a valid session token
    const token = request.cookies.get("next-auth.session-token");

    if (!token?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, status } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate a simple ID
    const id = Math.random().toString(36).substring(7);
    const giveaway = {
      id,
      userId: token.value, // Store token as placeholder for user ID
      title: title.trim(),
      description: description || null,
      status: status || "draft",
      createdAt: new Date().toISOString(),
    };

    global.giveaways.set(id, giveaway);

    return NextResponse.json(giveaway, { status: 201 });
  } catch (error) {
    console.error("Failed to create giveaway:", error);
    return NextResponse.json(
      { error: "Failed to create giveaway" },
      { status: 500 }
    );
  }
}
