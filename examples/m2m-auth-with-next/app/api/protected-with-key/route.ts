import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const externalClientId = cookies().get("externalClientId")?.value;

  const data = { message: `Hello World from ${externalClientId}` };

  return NextResponse.json({ data });
}
