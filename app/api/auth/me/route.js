// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Cookie’den token al
    const token = cookies().get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Token doğrula (jsonwebtoken üzerinden)
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // DB bağlantısı
    await dbConnect();

    // Kullanıcıyı getir
    const user = await User.findById(payload.userId).lean();
    if (!user || user.isActive === false) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Başarılı yanıt
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
