import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Missing Student ID" }, { status: 400 });
    }

    // 1. Student ka current data nikaalna
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (fetchError || !student) {
      return NextResponse.json({ success: false, error: "छात्र का रिकॉर्ड नहीं मिला!" }, { status: 404 });
    }

    const walletBalance = Number(student.wallet) || 0;
    const coursePrice = 299;

    // 2. Check karna ki wallet mein paryapt balance hai ya nahi
    if (walletBalance < coursePrice) {
      return NextResponse.json({ success: false, error: "Insufficient Balance" }, { status: 400 });
    }

    // 3. Wallet se ₹299 deduct karna aur course unlock karna
    const newWalletBalance = walletBalance - coursePrice;
    
    const { error: updateError } = await supabase
      .from("students")
      .update({ 
        wallet: newWalletBalance,
        is_enrolled: true 
      })
      .eq("id", studentId);

    if (updateError) throw new Error(updateError.message);

    // 4. Referral Matrix Trigger: Agar isko kisi ne refer kiya tha, toh refer karne wale ko eligible karo
    if (student.referred_by) {
      await supabase
        .from("students")
        .update({ referral_eligible: true })
        .eq("referral_code", student.referred_by);
    }

    return NextResponse.json({ success: true, message: "Course successfully unlocked via wallet!" });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}