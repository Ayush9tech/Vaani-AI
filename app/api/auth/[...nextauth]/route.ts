import { getAuth } from "@/lib/auth";

export async function GET(req: any, ctx: any) {
  const auth = getAuth();
  return auth.handlers.GET(req, ctx);
}

export async function POST(req: any, ctx: any) {
  const auth = getAuth();
  return auth.handlers.POST(req, ctx);
}
