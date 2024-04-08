import { auth } from "@/app/clerk/auth";
import { getAppById } from "@/app/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const { externalClientId } = auth();

  if (!externalClientId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const app = getAppById(externalClientId);

  if (!app) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = { message: `Hello World from ${app.name}` };

  return NextResponse.json({ data });
}
