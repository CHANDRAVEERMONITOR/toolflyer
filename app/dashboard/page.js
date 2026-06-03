"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment ke liye extra states
  const [inputAmount, setInputAmount] = useState("");
  const [payStatus, setPayStatus] = useState("");

  useEffect(() => {
    // 1. Razorpay ka SDK script client-side par load karna zaroori hai
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const sessionData = localStorage.getItem("student_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const currentStudent = JSON.parse(sessionData);

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
        } else {
          setStudent(currentStudent);
        }
      } catch (err) {
        setStudent(currentStudent);
      } finally {
        setLoading(false);
      }
    }

    fetchFreshData();
  }, [router]);

  // ---- RAZORPAY FRONTEND GATEWAY MATRIX ----
  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!inputAmount || isNaN(inputAmount) || parseInt(inputAmount) <= 0) {
      alert("कृपया एक सही राशि दर्ज करें!");
      return;
    }

    setPayStatus("Order जनरेट हो रहा है...");

    try {
      // 1. Next.js API route se backend order_id create karna
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseInt(inputAmount) }),
      });

      const resData = await response.json();
      if (!resData.success) throw new Error(resData.error);

      // 2. Razorpay standard window options set karna
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Aapka key id automatically env se uthayega
        amount: resData.order.amount,
        currency: "INR",
        name: "ToolFlyer Portal",
        description: "वॉलेट फंड रीचार्ज (Wallet Top-Up)",
        order_id: resData.order.id,
        prefill: {
          name: student?.name || "",
          email: student?.email || "",
          contact: student?.mob || "",
        },
        theme: { color: "#059669" }, // Humara chamkadar emerald green color
        handler: function (response) {
          setPayStatus("भुगतान सत्यापित हो रहा है... कृपया रुकें।");
          // Webhook automatic background mein run karke database badha dega
          setTimeout(() => {
            window.location.reload(); // Page refresh karke naya balance dikhayenge
          }, 3000);
        },
        modal: {
          ondismiss: function () {
            setPayStatus("");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Error: " + err.message);
      setPayStatus("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("student_session");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#475569]">डैशबोर्ड लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black bg-gradient-to-r from-[#059669] to-[#0284c7] bg-clip-text text-transparent">ToolFlyer</span>
            <span className="bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold px-2 py-0.5 rounded-sm">स्टूडेंट पैनल</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg transition-all">
            लॉगआउट (Logout)
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow">
        
        {/* Welcome Banner */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0f172a]">स्वागत है, {student?.name}!</h1>
            <p className="text-xs text-[#475569] mt-0.5">रोल नंबर: {student?.roll_no} | फैkulty: {student?.faculty}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold px-3 py-1.5 rounded-full">
            ● ऑनलाइन सत्र सक्रिय (Active Session)
          </div>
        </div>

        {/* Matrix Stats Cards (Wallet with Automatic Add Money + Credits) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Wallet Control Card with Razorpay Input */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">आपका वॉलेट बैलेंस</p>
              <p className="text-4xl font-black text-[#0f172a] mt-2">₹ {student?.wallet || 0}</p>
              <p className="text-xs text-[#059669] font-medium mt-2">✓ वेरिफिकेशन शुल्क के लिए उपयोग करें</p>
            </div>

            {/* Quick Razorpay TopUp Matrix */}
            <form onSubmit={handleAddMoney} className="w-full sm:w-auto flex flex-col gap-2 border-t sm:border-t-0 sm:border-l border-[#e2e8f0] pt-4 sm:pt-0 sm:pl-6">
              <label className="text-[11px] font-bold text-[#475569]">ऑनलाइन वॉलेट लोड करें (Razorpay)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={inputAmount} 
                  onChange={(e) => setInputAmount(e.target.value)} 
                  placeholder="राशि ₹ दर्ज करें" 
                  className="bg-[#f8fafc] border border-[#e2e8f0] text-xs font-bold p-2.5 rounded-xl w-32 outline-hidden focus:border-[#059669]" 
                />
                <button type="submit" disabled={!!payStatus} className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50">
                  {payStatus ? "रुकें..." : "फंड जोड़ें 💳"}
                </button>
              </div>
              {payStatus && <p className="text-[10px] text-[#0284c7] font-bold animate-pulse mt-1">{payStatus}</p>}
            </form>
          </div>

          {/* Credit Earning Card */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-2 right-2 text-4xl opacity-10">🏅</div>
            <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">टोटल क्रेडिट अर्निंग</p>
            <p className="text-4xl font-black text-[#0284c7] mt-2">{student?.total_credit_earning || 0} Cr</p>
            <p className="text-xs text-[#475569] font-medium mt-2">परीक्षा स्कोर के आधार पर निर्धारित</p>
          </div>
        </div>

        {/* Action Center (Exam & Profile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Engine Box */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-2 flex items-center gap-2">
              <span>📝</span> ऑनलाइन परीक्षा केंद्र
            </h3>
            <p className="text-xs text-[#475569] mb-6">यह 20 मिनट की समय सीमा वाली बहुविकल्पीय (MCQ) परीक्षा है।</p>
            <Link href={`/test/${student?.id}`} className="inline-block w-full bg-[#059669] hover:bg-[#047857] text-white text-center font-bold py-3.5 px-4 rounded-xl shadow-md transition-all">
              ऑनलाइन MCQ टेस्ट शुरू करें 🚀
            </Link>
          </div>

          {/* Profile Details */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">👤 आपकी प्रोफाइल विवरण</h3>
            <div className="space-y-3 text-xs">
              <div className="border-b border-[#e2e8f0] pb-1.5">
                <span className="text-[#475569] block">कॉलेज:</span>
                <span className="font-bold text-[#0f172a]">{student?.college}</span>
              </div>
              <div className="border-b border-[#e2e8f0] pb-1.5">
                <span className="text-[#475569] block">यूनिवर्सिटी:</span>
                <span className="font-bold text-[#0f172a]">{student?.university}</span>
              </div>
              <div>
                <span className="text-[#475569] block">रजिस्ट्रेशन नंबर:</span>
                <span className="font-bold text-[#0f172a] font-sans">{student?.reg_no}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
      <footer className="bg-white border-t border-[#e2e8f0] py-4 text-center text-xs text-[#475569]">
        ToolFlyer Secure Student Dashboard © 2026
      </footer>
    </div>
  );
}