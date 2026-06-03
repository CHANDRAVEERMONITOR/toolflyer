"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 💡 Next.js mein useSearchParams ko secure chalane ke liye Suspense component lagana zaroori hai
function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const studentId = searchParams.get("id");
  const score = searchParams.get("score") || "0";
  const total = searchParams.get("total") || "5";
  const credits = searchParams.get("credits") || "0";

  const [student, setStudent] = useState(null);

  useEffect(() => {
    const sessionData = localStorage.getItem("student_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }
    setStudent(JSON.parse(sessionData));
  }, [router]);

  // Percentage Matrix Calculation
  const percentage = Math.round((parseInt(score) / parseInt(total)) * 100);
  const isPassed = percentage >= 40; // 40% passing criteria

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-[#e2e8f0] p-6 sm:p-8 rounded-2xl shadow-xl text-center">
        
        {/* Exam Status Badge */}
        <div className="inline-flex items-center justify-center mb-6">
          {isPassed ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-4 py-1.5 rounded-full">
              🎉 परीक्षा उत्तीर्ण (PASSED)
            </span>
          ) : (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-1.5 rounded-full">
              ⚠️ अनुत्तीर्ण (FAILED) - दोबारा प्रयास करें
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black text-[#0f172a] mb-2">आपका परीक्षा परिणाम</h1>
        <p className="text-xs text-[#475569] font-medium mb-8 font-sans">विद्यार्थी आईडी: {studentId}</p>

        {/* Score Breakdown Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-xl">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#475569]">कुल प्रश्न</span>
            <span className="text-xl font-black text-[#0f172a] font-sans">{total}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#475569]">सही उत्तर</span>
            <span className="text-xl font-black text-emerald-600 font-sans">{score}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#475569]">प्रतिशत Score</span>
            <span className={`text-xl font-black font-sans ${isPassed ? "text-emerald-600" : "text-rose-600"}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Credit Earning Matrix Display */}
        <div className="bg-[#0284c7]/5 border border-[#0284c7]/20 p-5 rounded-xl mb-8">
          <p className="text-xs font-bold text-[#475569] mb-1">इस परीक्षा से अर्जित कुल क्रेडिट:</p>
          <p className="text-3xl font-black text-[#0284c7] font-sans">{credits} Credits</p>
        </div>

        {/* Call To Action Buttons */}
        <div className="space-y-3">
          {isPassed ? (
            <Link
              href={`/certificate/claim?id=${studentId}`}
              className="block w-full bg-[#059669] hover:bg-[#047857] text-white text-center font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              वेरिफाइड सर्टिफिकेट क्लेम करें 🏅
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="block w-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-center font-bold py-3.5 px-4 rounded-xl shadow-md transition-all"
            >
              डैशबोर्ड पर जाकर फिर से टेस्ट दें
            </Link>
          )}

          <Link
            href="/dashboard"
            className="block w-full bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] text-center font-bold py-3 px-4 rounded-xl text-xs transition-all"
          >
            डैशबोर्ड पर वापस जाएं
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-[#475569] mt-6 leading-relaxed">
          * डिजिटल सर्टिफिकेट जनरेट करने और वेरिफिकेशन रिकॉर्ड को लाइव करने के लिए नियमानुसार प्रक्रिया पूरी करना आवश्यक है।
        </p>

      </div>
    </div>
  );
}

// Main component wrap with Suspense
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#475569]">मार्कशीट तैयार हो रही है...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}