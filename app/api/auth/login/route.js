// app/api/auth/login/route.js - DataCloneError Düzeltilmiş
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    console.log('Login request received');
    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const rawEmail = String(body?.email ?? "").trim();
    const rawPass = String(body?.password ?? "");

    if (!rawEmail || !rawPass) {
      return NextResponse.json(
        { message: "E-posta ve şifre zorunludur" },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase();
    console.log('Login attempt for:', email);

    const user = await User.findOne({ email, isActive: true })
      .select("+password +role +permissions");

    if (!user || !(await user.comparePassword(rawPass))) {
      console.log('Invalid credentials for:', email);
      return NextResponse.json(
        { message: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    // Son giriş zamanı
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).exec();

    // Permissions'ı serialize et (MongoDB ObjectId'leri kaldır)
    const serializedPermissions = user.permissions ? user.permissions.map(perm => ({
      module: String(perm.module),
      actions: Array.isArray(perm.actions) ? perm.actions.map(action => String(action)) : []
    })) : [];

    console.log('Serialized permissions:', serializedPermissions);

    // JWT token oluştur - sadece plain object'ler
    const token = await signToken({
      userId: String(user._id), // ObjectId'yi string'e çevir
      email: String(user.email),
      role: String(user.role),
      name: String(user.name),
      permissions: serializedPermissions, // Serialize edilmiş permissions
    });

    console.log('Login successful for:', user.email);

    const response = NextResponse.json({
      message: "Giriş başarılı",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions, // Frontend için original permissions
      },
    });

    // Cookie set et
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}