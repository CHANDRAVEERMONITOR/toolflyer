"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function CertificateClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // 1. Session and Security Check
    const sessionData = localStorage.getItem("student_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    async function verifyStudentData() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId || JSON.parse(sessionData).id)
          .single();

        if (!error && data) {
          setStudent(data);
        } else {
          setStudent(JSON.parse(sessionData));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    verifyStudentData();
  }, [studentId, router]);

  // ₹299 Wallet Payment & Certificate Generation Logic
  const handleClaimCertificate = async () => {
    if (!student) return;
    setPayLoading(true);
    setMessage({ type: "", text: "" });

    // Rule Check: Wallet mein kam se kam ₹299 hona chahiye
    const currentWallet = student.wallet || 0;
    if (currentWallet < 299) {
      setMessage({ 
        type: "error", 
        text: `आपके वॉलेट में पर्याप्त बैलेंस नहीं है! वर्तमान बैलेंस: ₹${currentWallet}। सर्टिफिकेट वेरिफिकेशन शुल्क ₹299 है। कृपया एडमिन से वॉलेट रिचार्ज करवाएं।` 
      });
      setPayLoading(false);
      return;
    }

    try {
      const updatedWallet = currentWallet - 299;
      // Unique Certificate ID automatic generate karna
      const certificateId = `TF-${student.faculty.substring(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Supabase mein wallet update karna aur certificate lock karna
      const { error } = await supabase
        .from("students")
        .update({ 
          wallet: updatedWallet,
          // Baad mein tracking ke liye hum metadata ya certificates table jod sakte hain, abhi safe check ke liye local aur update response check kar rahe hain
        })
        .eq("id", student.id);

      if (error) throw error;

      // Local storage data sync
      const updatedStudent = { ...student, wallet: updatedWallet };
      localStorage.setItem("student_session", JSON.stringify(updatedStudent));
      setStudent(updatedStudent);

      setMessage({ 
        type: "success", 
        text: `भुगतान सफल! ₹299 काट लिए गए हैं। आपका सर्टिफिकेट आईडी ${certificateId} जनरेट हो गया है।` 
      });

      // 2 Second baad direct live download ya public verification link par bhej denge
      setTimeout(() => {
        alert(`बधाई हो! आपका सर्टिफिकेट डाउनलोड के लिए तैयार है। ID: ${certificateId}`);
        router.push("/dashboard");
      }, 2500);

    } catch (err) {
      setMessage({ type: "error", text: "भुगतान प्रक्रिया में त्रुटि हुई, कृपया दोबारा प्रयास करें।" });
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#475569]">सर्टिफिकेट विवरण लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Live Certificate Digital Frame Preview */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <p className="text-xs font-bold text-[#475569] mb-3 text-center lg:text-left">📜 डिजिटल सर्टिफिकेट प्रीव्यू (निरीक्षण प्रारूप)</p>
          
          {/* Certificate Border Box (Chamkadar Premium Design) */}
          <div className="bg-white border-8 border-double border-[#d97706] p-6 sm:p-10 rounded-xs shadow-2xl relative text-center aspect-[4/3] flex flex-col justify-between overflow-hidden">
            {/* Watermark Logo Back */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <span className="text-9xl font-black">TF</span>
            </div>

            {/* Top Certificate Branding */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-[#d97706] font-serif uppercase">ToolFlyer Certificate</h2>
              <p className="text-[10px] sm:text-xs font-bold text-[#059669] tracking-widest uppercase mt-1">Verified Online Skill Examination</p>
              <div className="w-24 h-0.5 bg-[#e2e8f0] mx-auto mt-3"></div>
            </div>

            {/* Certificate Core Text */}
            <div className="my-4 space-y-3">
              <p className="text-xs italic text-[#475569]">प्रमाणित किया जाता है कि छात्र/छात्रा</p>
              <p className="text-xl sm:text-2xl font-black text-[#0f172a] underline decoration-wavy decoration-[#0284c7] px-2">
                {student?.name}
              </p>
              <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                पिता: <span className="font-bold text-[#0f172a]">{student?.father_name}</span>, कॉलेज: <span className="font-bold text-[#0f172a]">{student?.college}</span> ({student?.university}) ने रोल नंबर <span className="font-bold text-[#0f172a] font-sans">{student?.roll_no}</span> के साथ ऑनलाइन योग्यता परीक्षा सफलतापूर्वक उत्तीर्ण की है।
              </p>
            </div>

            {/* Bottom Signature & Verification Info */}
            <div className="flex justify-between items-end border-t border-[#e2e8f0] pt-4 text-left">
              <div>
                <p className="text-[9px] font-mono text-[#888888]">दिनांक (Issue Date):</p>
                <p className="text-[10px] font-bold text-[#0f172a]">03-06-2026</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[10px] font-bold text-[#888888] rounded-sm mx-auto mb-1">
                  QR CODE
                </div>
                <p className="text-[8px] font-bold text-[#475569]">PUBLIC VERIFIED</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] italic text-[#888888] mb-4">Authorized Signatory</p>
                <div className="w-20 border-b border-[#0f172a] ml-auto"></div>
                <p className="text-[9px] font-bold text-[#0f172a] mt-1 font-sans">TOOLFLYER EDTECH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rule Verification Action Box */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xl flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-base font-black text-[#0f172a] mb-2 flex items-center gap-1.5">
              <span>🔒</span> डिजिटल वेरिफिकेशन गेटवे
            </h3>
            <p className="text-xs text-[#475569] mb-4">
              सर्टिफिकेट को सार्वजनिक रूप से लाइव करने और वेरिफिकेशन आईडी जनरेट करने के लिए ₹299 का शुल्क देय है।
            </p>

            <div className="space-y-3 bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-[#475569]">वेरिफिकेशन शुल्क:</span>
                <span className="font-bold text-[#0f172a]">₹ 299.00</span>
              </div>
              <div className="flex justify-between border-b border-[#e2e8f0] pb-2">
                <span className="text-[#475569]">सर्टिफिकेट वैलिडिटी:</span>
                <span className="font-bold text-emerald-600">Lifetime (आजीवन)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#475569]">आपका वर्तमान वॉलेट:</span>
                <span className={`font-black ${student?.wallet >= 299 ? "text-emerald-600" : "text-rose-600"}`}>
                  Base: ₹ {student?.wallet || 0}
                </span>
              </div>
            </div>

            {/* Status Feedback Messages inside box */}
            {message.text && (
              <div className={`p-3.5 mb-4 rounded-xl text-xs font-semibold text-center ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                {message.text}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClaimCertificate}
              disabled={payLoading}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {payLoading ? "प्रक्रिया जारी है..." : "₹299 का भुगतान करें और क्लेम करें 💳"}
            </button>

            <Link
              href="/dashboard"
              className="block w-full bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-center text-xs font-bold py-2.5 px-4 rounded-xl text-[#475569] transition-all"
            >
              डैशबोर्ड पर वापस जाएं
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CertificateClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#475569]">गेटवे लोड हो रहा है...</p>
      </div>
    }>
      <CertificateClaimContent />
    </Suspense>
  );
}