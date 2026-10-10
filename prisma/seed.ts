import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the first administrator.");
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await prisma.user.upsert({ where: { email }, update: { role: "ADMIN", passwordHash, emailVerified: new Date(), termsAcceptedAt: new Date() }, create: { email, fullName: "JIT COFFIE Admin", name: "JIT COFFIE Admin", passwordHash, emailVerified: new Date(), termsAcceptedAt: new Date(), role: "ADMIN", mobileNumber: `9${Date.now().toString().slice(-9)}`, address: "JIT COFFIE Administration", city: "Mumbai", state: "Maharashtra", pinCode: "400001", country: "India" } });
  console.log(`Administrator ${email} is ready.`);
}
main().finally(() => prisma.$disconnect());
