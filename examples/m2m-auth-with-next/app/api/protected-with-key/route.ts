import { auth } from "@/app/clerk/auth";
import { getAppById } from "@/app/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const { consumerId } = auth();

  const app = getAppById(consumerId);

  if (!app) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = { message: `Hello World from ${app.name}` };

  return NextResponse.json({ data });
}
