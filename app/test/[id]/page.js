"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 💡 Mock Questions Matrix: Jab aap real sawal denge, bas is list ko badal dena hai!
const mockQuestions = [
  {
    id: 1,
    question: "कंप्यूटर का मस्तिष्क (Brain of Computer) किसे कहा जाता है?",
    options: ["RAM", "ALU", "CPU", "Hard Disk"],
    answer: "CPU"
  },
  {
    id: 2,
    question: "इंटरनेट पर वेबसाइट का पता लगाने वाले सिस्टम को क्या कहते हैं?",
    options: ["URL", "HTML", "HTTP", "FTP"],
    answer: "URL"
  },
  {
    id: 3,
    question: "Next.js मुख्य रूप से किस लाइब्रेरी पर आधारित एक फ्रेमवर्क है?",
    options: ["Angular", "React", "Vue", "Svelte"],
    answer: "React"
  },
  {
    id: 4,
    question: "डेटाबेस में जानकारी सुरक्षित रूप से स्टोर करने के लिए हम किसका उपयोग कर रहे हैं?",
    options: ["Firebase", "MongoDB", "Supabase", "MySQL"],
    answer: "Supabase"
  },
  {
    id: 5,
    question: "WWW का पूर्ण रूप (Full Form) क्या होता है?",
    options: ["World Wide Web", "World Web Wide", "Word Wide Web", "World Wide Word"],
    answer: "World Wide Web"
  }
];

export default function TestPage({ params }) {
  const router = useRouter();
  // Next.js App Router mein dynamic id nikalne ka sahi tarika
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.id;

  const [student, setStudent] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 Minutes = 1200 Seconds
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Session aur Student Verify karna
  useEffect(() => {
    const sessionData = localStorage.getItem("student_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }
    setStudent(JSON.parse(sessionData));
  }, [router]);

  // 2. 20-Minute Ulti Ginti (Timer) Matrix
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest(); // Time khatam hote hi automatic submit
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Timer format karne ka function (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Option select karne ka handler
  const handleSelectOption = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: option });
  };

  // Test Submit Handler
  const handleSubmitTest = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    // Score calculate karna
    let correctCount = 0;
    mockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    // Per correct answer = 10 Credits (Aap apne hisab se badal sakte hain)
    const earnedCredits = correctCount * 10;

    try {
      // Supabase mein student ke total credits ko update karna
      const { error } = await supabase
        .from("students")
        .update({ total_credit_earning: earnedCredits })
        .eq("id", studentId);

      if (error) throw error;

      // Result screen par score lekar jana
      router.push(`/result?id=${studentId}&score=${correctCount}&total=${mockQuestions.length}&credits=${earnedCredits}`);
    } catch (err) {
      alert("स्कोर सुरक्षित करने में दिक्कत हुई, लेकिन आपका टेस्ट सबमिट हो गया है।");
      router.push(`/result?id=${studentId}&score=${correctCount}&total=${mockQuestions.length}&credits=${earnedCredits}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between">
      {/* Test Top Bar */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 sticky top-0 z-50 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-[#0f172a]">ऑनलाइन परीक्षा (MCQ Test)</h2>
          <p className="text-xs text-[#475569]">छात्र: {student?.name}</p>
        </div>
        
        {/* Timer Box */}
        <div className={`px-4 py-2 rounded-xl text-sm font-mono font-bold flex items-center gap-2 ${
          timeLeft < 120 ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse" : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          <span>⏱️ समय शेष:</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Question Box */}
      <main className="max-w-3xl mx-auto w-full px-4 py-12 flex-grow">
        <div className="bg-white border border-[#e2e8f0] p-6 sm:p-8 rounded-2xl shadow-sm">
          
          {/* Question Number Indicator */}
          <div className="flex justify-between items-center mb-6 border-b border-[#e2e8f0] pb-3">
            <span className="text-xs font-bold text-[#0284c7] bg-[#0284c7]/10 px-3 py-1 rounded-full">
              प्रश्न {currentIdx + 1} / {mockQuestions.length}
            </span>
            <span className="text-xs text-[#475569]">प्रत्येक सही उत्तर पर 10 क्रेडिट मिलेंगे</span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold text-[#0f172a] mb-6 leading-relaxed">
            {mockQuestions[currentIdx].question}
          </h3>

          {/* Options Grid */}
          <div className="space-y-3">
            {mockQuestions[currentIdx].options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIdx] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl text-sm font-semibold transition-all border ${
                    isSelected 
                      ? "bg-[#059669]/10 border-[#059669] text-[#059669]" 
                      : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#e2e8f0]/50 text-[#0f172a]"
                  }`}
                >
                  <span className="inline-block w-6 h-6 text-center leading-6 rounded-full bg-white border mr-3 text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-10 pt-4 border-t border-[#e2e8f0]">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="bg-white border border-[#e2e8f0] text-xs font-bold px-4 py-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-[#f8fafc]"
            >
              ⬅ पिछला प्रश्न
            </button>

            {currentIdx < mockQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev - 1 + 2)}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
              >
                अगला प्रश्न ➡
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitted}
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md transition-all"
              >
                {isSubmitted ? "सबमिट हो रहा है..." : "परीक्षा समाप्त करें 🏁"}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 text-center text-xs text-[#475569]">
        सुरक्षित परीक्षा सत्र जारी है ● पन्ने को रीफ्रेश न करें
      </footer>
    </div>
  );
}