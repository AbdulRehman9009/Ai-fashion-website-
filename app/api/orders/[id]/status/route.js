import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { canTransition } from "@/lib/workflow";

export async function PATCH(req, { params }) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const target = body.status;
  if (!target) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const ok = canTransition(token.role, order.status, target);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  order.status = target;
  order.timeline.push({ byRole: token.role, event: target });
  await order.save();
  return NextResponse.json({ ok: true });
}

