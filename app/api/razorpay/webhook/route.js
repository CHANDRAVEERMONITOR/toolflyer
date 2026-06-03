import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    }

    const data = JSON.parse(rawBody);

    if (data.event === "payment.captured") {
      const payment = data.payload.payment.entity;
      const amountPaid = payment.amount / 100; // Paise ko wapas Rupees mein badla
      const studentEmail = payment.email; 

      // Database Matrix: Student ke purane wallet mein naya amount add karna
      const { data: student } = await supabase
        .from("students")
        .select("id, wallet")
        .eq("email", studentEmail)
        .single();

      if (student) {
        const currentWallet = student.wallet || 0;
        const updatedWallet = currentWallet + amountPaid;

        await supabase
          .from("students")
          .update({ wallet: updatedWallet })
          .eq("id", student.id);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}