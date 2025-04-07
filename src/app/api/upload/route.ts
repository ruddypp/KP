import { NextResponse } from "next/server";

export async function POST(/*request: Request*/) {
  // const data = await request.formData();

  // ... Logika upload yang sebenarnya ...

  // Contoh respons
  return NextResponse.json({ message: "Upload endpoint reached" });
} 