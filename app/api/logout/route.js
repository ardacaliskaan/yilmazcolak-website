// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const res = NextResponse.json({ message: "Çıkış başarılı" });
  const isHttps = new URL(request.url).protocol === "https:";

  res.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",     // <- önemli
    maxAge: 0,     // hemen sil
  });

  return res;
}
