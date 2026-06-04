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
      const amountPaid = payment.amount / 100;
      
      // Notes/Metadata se Student ID nikalna (100% Accuray Fail-Safe)
      const studentId = payment.notes?.student_id;
      const paymentType = payment.notes?.payment_type || "wallet_topup"; 

      if (studentId) {
        if (paymentType === "course_enroll") {
          // 1. Agar ₹299 ka course purchase hai
          const { data: currentStudent } = await supabase
            .from("students")
            .select("referred_by")
            .eq("id", studentId)
            .single();

          // Course unlock status true karna
          await supabase
            .from("students")
            .update({ is_enrolled: true })
            .eq("id", studentId);

          // Referral Matrix: Agar is student ko kisi ne refer kiya tha, toh refer karne wale ka withdraw status eligible karo
          if (currentStudent?.referred_by) {
            await supabase
              .from("students")
              .update({ referral_eligible: true })
              .eq("referral_code", currentStudent.referred_by);
          }

        } else {
          // 2. Normal wallet fund top-up
          const { data: student } = await supabase
            .from("students")
            .select("wallet")
            .eq("id", studentId)
            .single();

          if (student) {
            const currentWallet = Number(student.wallet) || 0;
            await supabase
              .from("students")
              .update({ wallet: currentWallet + amountPaid })
              .eq("id", studentId);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}