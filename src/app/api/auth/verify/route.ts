import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const value = searchParams.get("token");
  if (!value || value.length > 100) return NextResponse.redirect(new URL("/verify?status=invalid", origin));
  const record = await db.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(value) }, include: { user: true } });
  if (!record || record.expiresAt < new Date()) return NextResponse.redirect(new URL("/verify?status=expired", origin));
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return NextResponse.redirect(new URL("/login?verified=1", origin));
}
