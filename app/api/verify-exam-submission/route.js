import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { studentId, score, totalQuestions } = await request.json();
    
    // Percentage calculation
    const percentage = (score / totalQuestions) * 100;
    const isPassed = percentage >= 65; // 🎯 65% Passing Criteria

    // Student ka current status checking
    const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single();
    
    let updatedPayload = {
      attempt_count: (student?.attempt_count || 0) + 1
    };

    if (isPassed) {
      // Pass hone par bina paise mange unique certificate number generate karna
      updatedPayload.test_qualified = true;
      updatedPayload.certificate_no = `TF-${Date.now().toString().slice(-6)}`;
    } else {
      // Fail hone par conditional checking block
      updatedPayload.test_qualified = false;
    }

    // Database state lock update
    await supabase.from("students").update(updatedPayload).eq("id", studentId);

    return NextResponse.json({ 
      success: true, 
      isPassed, 
      percentage: Math.round(percentage),
      attempts: updatedPayload.attempt_count
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}