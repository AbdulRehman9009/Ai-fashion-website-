import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User, { Roles } from "@/models/User";
import Profile from "@/models/Profile";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "TAILOR", "DELIVERY", "SHOPKEEPER", "ADMIN"]).default("USER"),
  name: z.string().optional(),
});

export async function POST(req) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { email, password, role, name } = parse.data;
  await connectDB();
  const exists = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (exists) {
    return NextResponse.json({ error: "Email in use" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Transaction-like sequence (optimistic)
  const user = await User.create({ email: email.toLowerCase().trim(), passwordHash, role });
  await Profile.create({ user: user._id, name: name || "" });
  
  return NextResponse.json({ id: String(user._id), email: user.email, role: user.role }, { status: 201 });
}

