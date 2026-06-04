"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputAmount, setInputAmount] = useState("");
  const [payStatus, setPayStatus] = useState("");

  useEffect(() => {
    // Razorpay checkout script inject karna frontend par
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // LocalStorage se student session verify karna
    const sessionData = localStorage.getItem("student_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }
    const currentStudent = JSON.parse(sessionData);

    // Database se fresh status data fetch karna (Real-time updates)
    async function fetchFreshData() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", currentStudent.id)
          .single();

        if (!error && data) {
          setStudent(data);
          localStorage.setItem("student_session", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Session Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFreshData();
  }, [router]);

  // Bulletproof Razorpay Checkout Order Generator Function
  const triggerPayment = async (amount, type) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("कृपया एक सही राशि दर्ज करें!");
      return;
    }
    
    setPayStatus(type === "course_enroll" ? "Course इनरोलमेंट शुरू हो रहा है..." : "ऑर्डर जनरेट हो रहा है...");
    
    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Number(amount), 
          studentId: student?.id || "", 
          paymentType: type 
        }),
      });

      const resData = await response.json();
      
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Backend server connection error!");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: resData.order.amount,
        currency: "INR",
        name: "ToolFlyer Portal",
        description: type === "course_enroll" ? "Video Content & Test Enrollment" : "वॉलेट फंड टॉप-अप",
        order_id: resData.order.id,
        prefill: {
          name: student?.name || "",
          email: student?.email || "",
          contact: student?.mob || "",
        },
        theme: { color: "#059669" },
        handler: function () {
          setPayStatus("सत्यापन चल रहा है... कृपया रुकें।");
          setTimeout(() => { window.location.reload(); }, 3500);
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Error: " + err.message);
      setPayStatus("");
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-sm">डैशबोर्ड लोड हो रहा है...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      
      {/* Header Container */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex justify-between items-center shadow-xs">
        <span className="text-xl font-black text-emerald-600">ToolFlyer स्टूडेंट पैनल</span>
        <button 
          onClick={() => { localStorage.removeItem("student_session"); router.push("/login"); }} 
          className="bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition-all hover:bg-rose-100"
        >
          लॉगआऊट (Logout)
        </button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-grow">
        
        {/* Top Student Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Profile Details */}
          <div className="bg-white p-6 border rounded-2xl shadow-xs md:col-span-2">
            <h1 className="text-2xl font-black">स्वागत है, {student?.name}</h1>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
              <div>रोल नंबर: <span className="font-mono font-bold text-slate-800">{student?.roll_no}</span></div>
              <div>फैकल्टी: <span className="font-bold text-slate-800">{student?.faculty}</span></div>
              <div>पंजीकरण संख्या: <span className="font-mono font-bold text-slate-800">{student?.reg_no}</span></div>
              <div>वर्ष: <span className="font-bold text-slate-800">{student?.year}</span></div>
            </div>
          </div>

          {/* Wallet Fund Box */}
          <div className="bg-white p-6 border rounded-2xl shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">आपका वॉलेट बैलेंस</span>
              <span className="text-3xl font-black text-slate-900">₹ {student?.wallet || 0}</span>
              <p className="text-[11px] text-emerald-600 mt-1">✓ वेरिफिकेशन शुल्क के लिए उपयोग करें</p>
            </div>
            
            {/* Wallet Load Submodule */}
            <div className="mt-4 pt-4 border-t flex gap-2">
              <input 
                type="number" 
                placeholder="राशि ₹" 
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="w-24 border bg-slate-50 p-2 rounded-xl text-xs font-bold outline-hidden focus:border-emerald-500"
              />
              <button 
                onClick={() => triggerPayment(inputAmount, "wallet_topup")}
                className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
              >
                {payStatus && inputAmount ? "रुकें..." : "फंड जोड़ें 💳"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: Locked & Protective Referral Dashboard Node */}
        <div className="bg-white p-6 border rounded-2xl mb-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-700">🔗 आपका रेफ़रल और अर्निंग डैशबोर्ड</h3>
            <p className="text-xs text-slate-400 mt-0.5">दोस्तों को आमंत्रित करें और प्रत्येक सफल रेफ़रल पर ₹99 प्राप्त करें।</p>
            <p className="text-xs text-slate-500 mt-2">
              आपका रेफ़रल कोड: <span className="font-mono bg-slate-100 font-bold px-2 py-0.5 rounded text-emerald-600">{student?.referral_code || "N/A"}</span>
            </p>
          </div>
          <div className="text-right border-t md:border-t-0 pt-4 md:pt-0 flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 block mb-1">कुल क्रेडिट अर्निंग</span>
            <span className="text-2xl font-black text-emerald-600 mb-2">₹ {student?.referral_wallet || 0}</span>
            <button 
              disabled={!student?.referral_eligible || (student?.referral_wallet || 0) <= 0}
              className={`text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-xs ${
                student?.referral_eligible && (student?.referral_wallet || 0) > 0 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {student?.referral_eligible ? "वॉलेट में ट्रांसफर करें 🔓" : "विथड्रॉ पेंडing 🔒"}
            </button>
          </div>
        </div>

        {/* SECTION 2: Course Content Management & Video Locker Sub-router */}
        <div className="bg-white p-6 border rounded-2xl mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold">📚 प्रीमियम वीडियो कोर्स सामग्री (₹299)</h3>
              <p className="text-xs text-slate-500">प्रमाणन परीक्षा और डिजिटल टूल मापन सीखने का पूरा ट्यूटोरियल।</p>
            </div>
            {!student?.is_enrolled && (
              <button 
                onClick={() => triggerPayment(299, "course_enroll")} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm whitespace-nowrap"
              >
                {payStatus.includes("Course") ? "प्रोसेसिंग..." : "अभी इनरोल करें 💳"}
              </button>
            )}
          </div>

          {student?.is_enrolled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Live Video Content Player Simulation */}
              <div className="aspect-video bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shadow-inner border border-slate-800">
                <div className="absolute top-3 left-3 bg-red-600 text-[10px] px-2 py-0.5 rounded font-sans tracking-widest animate-pulse">PREMIUM ACCESS</div>
                <span className="text-xs text-slate-300">▶ व्याख्यान 1: डिजिटल भूमि मापन और कट्टा-धुर गणना नियम</span>
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <span>🔓</span> व्याख्यान 1: कोर फंडामेंटल्स थ्योरी (सक्रिय)
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <span>🔓</span> व्याख्यान 2: खतियान एवं वंशावली सत्यापन प्रक्रिया
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 border border-dashed rounded-xl">
              <span className="text-3xl block">🔒</span>
              <h4 className="text-sm font-bold text-slate-700 mt-2">वीडियो व्याख्यान लॉक हैं!</h4>
              <p className="text-xs text-slate-400 mt-1">कोर्स सामग्री और ऑनलाइन परीक्षा प्रणाली को सक्रिय करने के लिए ₹299 का भुगतान आवश्यक है।</p>
            </div>
          )}
        </div>

        {/* SECTION 3: Dynamic Test Engine & Dynamic PDF Certification Node */}
        {student?.is_enrolled && (
          <div className="bg-white p-6 border rounded-2xl shadow-xs">
            <h3 className="text-lg font-bold mb-1">📝 ऑनलाइन परीक्षा केंद्र</h3>
            <p className="text-xs text-slate-500 mb-6">यह 20 मिनट की समय सीमा वाली बहुविकल्पीय (MCQ) परीक्षा है।</p>

            {student?.test_qualified ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">🎉 बधाई हो! आपने सफलतापूर्वक परीक्षा उत्तीर्ण की है।</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    सर्टिफिकेट नंबर: <span className="font-mono font-bold bg-white px-1.5 py-0.5 border rounded">{student?.certificate_no || "GENERATED"}</span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link 
                    href={`/certificate/view?id=${student.id}`} 
                    className="flex-grow sm:flex-none text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xs transition-all"
                  >
                    प्रमाण पत्र (View File) 🎓
                  </Link>
                  <Link 
                    href={`/report/view?id=${student.id}`} 
                    className="flex-grow sm:flex-none text-center bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xs transition-all"
                  >
                    3-5 पेज रिपोर्ट कार्ड 📊
                  </Link>
                </div>
              </div>
            ) : (
              <Link 
                href={`/test/${student?.id}`} 
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all"
              >
                ऑनलाइन MCQ टेस्ट शुरू करें 🚀
              </Link>
            )}
          </div>
        )}
      </main>
      
      {/* System Footer Copyright Node */}
      <footer className="text-center py-6 text-[11px] text-slate-400 bg-white border-t mt-12">
        ToolFlyer Secure Student Dashboard © 2026 • All Rights Reserved
      </footer>
    </div>
  );
}