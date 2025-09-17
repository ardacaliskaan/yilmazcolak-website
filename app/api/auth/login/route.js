// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

// export const dynamic = "force-dynamic"; // isterseniz açabilirsiniz

export async function POST(request) {
  try {
    await dbConnect();

    // Gövdeyi güvenli oku
    const body = await request.json().catch(() => ({}));
    const rawEmail = String(body?.email ?? "").trim();
    const rawPass  = String(body?.password ?? "");

    if (!rawEmail || !rawPass) {
      return NextResponse.json(
        { message: "E-posta Ve Şifre Zorunludur" },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase();

    // Şifre alanını seçerek çek
    const user = await User.findOne({ email, isActive: true })
      .select("+password +role +permissions");

    if (!user || !(await user.comparePassword(rawPass))) {
      return NextResponse.json(
        { message: "Geçersiz Email Veya Şifre" },
        { status: 401 }
      );
    }

    // Son giriş zamanı (fire-and-forget)
    void User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).exec();

    // JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
    });

    // Yanıt
    const response = NextResponse.json({
      message: "Giriş Başarılı",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });

    // Cookie (3 saat) — protokole göre secure
    const isHttps = new URL(request.url).protocol === "https:";
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 3, // 3 saat
    });

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ message: "Sunucu Hatası" }, { status: 500 });
  }
}
