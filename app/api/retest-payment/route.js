import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { studentId } = await request.json();
    const { data: student } = await supabase.from("students").select("wallet").eq("id", studentId).single();

    const currentWallet = Number(student?.wallet) || 0;
    if (currentWallet < 49) {
      return NextResponse.json({ success: false, error: "retest शुल्क के लिए आपके पास पर्याप्त ₹49 नहीं हैं! कृपया फंड जोड़ें।" }, { status: 400 });
    }

    // ₹49 deduct computational block
    await supabase.from("students").update({ wallet: currentWallet - 49 }).eq("id", studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}