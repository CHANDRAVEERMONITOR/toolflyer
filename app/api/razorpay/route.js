import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Signature verify karenge security ke liye
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook Signature Verification Failed!");
      return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    }

    const data = JSON.parse(rawBody);

    // Jab payment capture ho jaye
    if (data.event === "payment.captured") {
      const payment = data.payload.payment.entity;
      const amountPaid = payment.amount / 100; // Paise ko Rupee mein badla
      const studentEmail = payment.email;

      console.log(`Payment Captured! Amount: ₹${amountPaid}, Email: ${studentEmail}`);

      // Fail-safe Query Matrix: Pehle billing email se dhoondhenge
      let { data: student, error } = await supabase
        .from("students")
        .select("id, wallet")
        .eq("email", studentEmail)
        .maybeSingle();

      // Fallback: Agar billing email match nahi hua (jaise dummy void@razorpay.com),
      // toh hum mobile number se dhoondhenge jo student ne payment popup me dala hoga!
      if (!student && payment.contact) {
        // Razorpay contact me +91 jodkar bhejta hai, hum aakhri ke 10 digit nikalenge
        const cleanMobile = payment.contact.replace("+91", "").trim();
        
        const { data: studentByMob } = await supabase
          .from("students")
          .select("id, wallet")
          .like("mob", `%${cleanMobile}%`)
          .maybeSingle();
          
        student = studentByMob;
      }

      // Agar student mil gaya, toh balance badha do
      if (student) {
        const currentWallet = Number(student.wallet) || 0;
        const updatedWallet = currentWallet + amountPaid;

        const { error: updateError } = await supabase
          .from("students")
          .update({ wallet: updatedWallet })
          .eq("id", student.id);

        if (updateError) console.error("Database Update Error:", updateError);
        else console.log(`Wallet automatically updated for student ID: ${student.id}`);
      } else {
        console.error(`Student not found in database for Email: ${studentEmail} or Phone: ${payment.contact}`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Internal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}