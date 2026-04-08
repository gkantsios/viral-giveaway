import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { isGiveawayActive } from "@/lib/utils";
import crypto from "crypto";

const enterSchema = z.object({
  email: z.string().email(),
  referralCode: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const giveaway = await db.giveaway.findUnique({
    where: { slug: params.slug },
  });

  if (!giveaway || !isGiveawayActive(giveaway)) {
    return NextResponse.json(
      { error: "Giveaway not found or not active" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const parsed = enterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, referralCode } = parsed.data;

  // Check for existing entry
  const existing = await db.entry.findUnique({
    where: { giveawayId_email: { giveawayId: giveaway.id, email } },
  });
  if (existing) {
    return NextResponse.json({
      message: "Already entered",
      referralCode: existing.referralCode,
    });
  }

  // Resolve referral
  let referredById: string | null = null;
  if (referralCode) {
    const referrer = await db.entry.findUnique({
      where: { referralCode },
    });
    if (referrer && referrer.giveawayId === giveaway.id) {
      referredById = referrer.id;
    }
  }

  // Create entry
  const entry = await db.entry.create({
    data: {
      giveawayId: giveaway.id,
      email,
      referredById,
    },
  });

  // Grant bonus entry to referrer
  if (referredById) {
    await db.entry.update({
      where: { id: referredById },
      data: {
        bonusEntries: { increment: 1 },
        totalEntries: { increment: 1 },
      },
    });
  }

  // Send verification email
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.verificationToken.create({
    data: {
      identifier: `entry:${entry.id}`,
      token,
      expires,
    },
  });

  // In production, send email here. For now just return token for testing.
  // await sendEntryVerificationEmail(email, token, giveaway.slug);

  return NextResponse.json(
    {
      message: "Entered! Check your email to verify.",
      referralCode: entry.referralCode,
    },
    { status: 201 }
  );
}
