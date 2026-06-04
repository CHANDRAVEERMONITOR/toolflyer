import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { studentId, courseId, submission } = await request.json(); // submission: { questionId: 'A', ... }

    if (!studentId || !courseId || !submission) {
      return NextResponse.json({ success: false, error: "डेटा अधूरा है!" }, { status: 400 });
    }

    // Database se sahi answers get karna check karne ke liye
    const { data: realQuestions } = await supabase
      .from("questions")
      .select("id, correct_option")
      .eq("course_id", courseId);

    let correctCount = 0;
    realQuestions.forEach(q => {
      if (submission[q.id] && submission[q.id] === q.correct_option) {
        correctCount++;
      }
    });

    const totalQuestions = 20;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    const isPassed = scorePercentage >= 65; // Dynamic 65% strict evaluation barrier

    const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single();
    const newAttempts = (student?.test_attempts || 0) + 1;

    if (isPassed) {
      // Create a unique certificate string layout format
      const generatedCertNo = `TF-${courseId.slice(0,4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await supabase
        .from("students")
        .update({
          test_qualified: true,
          certificate_no: generatedCertNo,
          test_attempts: newAttempts
        })
        .eq("id", studentId);
    } else {
      await supabase
        .from("students")
        .update({
          test_qualified: false,
          test_attempts: newAttempts
        })
        .eq("id", studentId);
    }

    return NextResponse.json({ 
      success: true, 
      passed: isPassed, 
      score: scorePercentage, 
      correct: correctCount 
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}