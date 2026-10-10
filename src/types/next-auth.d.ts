import "next-auth";
declare module "next-auth" {
  interface Session { user: { id: string } & NonNullable<DefaultSession["user"]> }
}
import { DefaultSession } from "next-auth";
