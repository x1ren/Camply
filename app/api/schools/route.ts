import { NextResponse } from "next/server";
import { schools } from "../data/schools";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const district = searchParams.get("district");

  let result = schools;

  if (name) {
    result = result.filter((s) =>
      s.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  if (type) {
    result = result.filter((s) => s.type.toLowerCase() === type.toLowerCase());
  }

  if (district) {
    result = result.filter((s) =>
      s.district.toLowerCase().includes(district.toLowerCase()),
    );
  }

  return NextResponse.json(result);
}
