import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export async function createTRPCContext() {
  // next js header function to pass request info to better-auth
  const session = await auth.api.getSession({ headers: await headers() });
  return { db, session, headers: await headers() };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
