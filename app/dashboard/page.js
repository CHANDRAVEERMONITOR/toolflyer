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
  
  // Mark as Watched Tracker State
  const [watchedLectures, setWatchedLectures] = useState({
    lec1: false,
    lec2: false,
    lec3: false,
  });

  useEffect(() => {
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
          
          // Agar localstorage mein pehle se watched lectures ka data hai toh load karein
          const savedProgress = localStorage.getItem(`progress_${data.id}`);
          if (savedProgress) {
            setWatchedLectures(JSON.parse(savedProgress));
          }
        }
      } catch (err) {
        console.error("Session Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFreshData();
  }, [router]);

  // Mark as Watched Toggle Handler
  const toggleWatched = (lectureId) => {
    const updatedProgress = {
      ...watchedLectures,
      [lectureId]: !watchedLectures[lectureId]
    };
    setWatchedLectures(updatedProgress);
    localStorage.setItem(`progress_${student.id}`, JSON.stringify(updatedProgress));
  };

  const handleCourseEnrollment = async () => {
    const currentWallet = Number(student?.wallet) || 0;
    if (currentWallet >= 299) {
      setPayStatus("वॉलेट से भुगतान प्रोसेस हो रहा है...");
      try {
        const response = await fetch("/api/course-buy-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: student.id }),
        });
        const resData = await response.json();
        if (!resData.success) throw new Error(resData.error);
        
        alert("🎉 आपके वॉलेट से ₹299 कट गए हैं और कोर्स अनलॉक हो गया है!");
        window.location.reload();
      } catch (err) {
        alert("Wallet Error: " + err.message);
        setPayStatus("");
      }
    } else {
      triggerPayment(299, "course_enroll");
    }
  };

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
        body: JSON.stringify({ amount: Number(amount), studentId: student?.id || "", paymentType: type }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.error || "Server connection error!");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: resData.order.amount,
        currency: "INR",
        name: "ToolFlyer Portal",
        description: type === "course_enroll" ? "Video Content & Test Enrollment" : "वॉलेट फंड टॉप-अप",
        order_id: resData.order.id,
        prefill: { name: student?.name || "", email: student?.email || "", contact: student?.mob || "" },
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
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex justify-between items-center shadow-xs">
        <span className="text-xl font-black text-emerald-600">ToolFlyer स्टूडेंट पैनल</span>
        <button onClick={() => { localStorage.removeItem("student_session"); router.push("/login"); }} className="bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs">लॉगआऊट (Logout)</button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-grow">
        {/* Profile & Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border rounded-2xl shadow-xs md:col-span-2">
            <h1 className="text-2xl font-black">स्वागत है, {student?.name}</h1>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
              <div>रोल नंबर: <span className="font-mono font-bold text-slate-800">{student?.roll_no}</span></div>
              <div>फैकल्टी: <span className="font-bold text-slate-800">{student?.faculty}</span></div>
              <div>पंजीकरण संख्या: <span className="font-mono font-bold text-slate-800">{student?.reg_no}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 border rounded-2xl shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">आपका वॉलेट बैलेंस</span>
              <span className="text-3xl font-black text-slate-900">₹ {student?.wallet || 0}</span>
            </div>
            <div className="mt-4 pt-4 border-t flex gap-2">
              <input type="number" placeholder="राशि ₹" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} className="w-24 border bg-slate-50 p-2 rounded-xl text-xs font-bold outline-hidden focus:border-emerald-500" />
              <button onClick={() => triggerPayment(inputAmount, "wallet_topup")} className="flex-grow bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs">फंड जोड़ें 💳</button>
            </div>
          </div>
        </div>

        {/* Course Playlist Content Block */}
        <div className="bg-white p-6 border rounded-2xl mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold">📚 डिजिटल मार्केटिंग प्रीमियम वीडियो कोर्स (Playlist)</h3>
              <p className="text-xs text-slate-500">
                {student?.wallet >= 299 && !student?.is_enrolled ? "💡 आपके वॉलेट में बैलेंस उपलब्ध है, सीधा वॉलेट से अनलॉक करें!" : "सभी व्याख्यान ध्यान से देखें।"}
              </p>
            </div>
            {!student?.is_enrolled && (
              <button onClick={handleCourseEnrollment} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm">
                {payStatus ? "प्रोसेसिंग..." : student?.wallet >= 299 ? "वॉLET से अभी खरीदें 🔓" : "₹299 देकर इनरोल करें 💳"}
              </button>
            )}
          </div>

          {student?.is_enrolled ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Secure Protected Playlist Section (Left side spans 2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black relative">
                  
                  {/* Super Secure Transparent Shield Layer - Stops right clicks & double click redirect */}
                  <div 
                    className="absolute inset-0 z-10 bg-transparent" 
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ pointerEvents: 'none' }} // Allows playing but blocks full container control abuse
                  ></div>

                  <iframe 
                    className="w-full h-full relative z-0"
                    src="https://www.youtube.com/embed/videoseries?list=PLXwTOG3-tRwiJmAyVJ47SVvv-dUIy2S0I&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
                    title="ToolFlyer Premium Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-[11px] text-amber-600 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  ⚠️ सुरक्षा निर्देश: वीडियो प्लेयर से डायरेक्ट यूट्यूब पर जाना प्रतिबंधित है। प्लेलिस्ट वीडियो क्रमबद्ध रूप से चलेंगे।
                </p>
              </div>

              {/* Mark as Watched Task Manager (Right side spans 1 col) */}
              <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">📋 व्याख्यान सूची और प्रोग्रेस</h4>
                  <div className="space-y-2">
                    
                    {/* Lecture Item 1 */}
                    <div className="bg-white p-3 border rounded-xl flex items-center justify-between text-xs">
                      <span className={watchedLectures.lec1 ? "line-through text-slate-400 font-medium" : "font-bold"}>1. डिजिटल मार्केटिंग परिचय</span>
                      <button onClick={() => toggleWatched("lec1")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${watchedLectures.lec1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {watchedLectures.lec1 ? "देखा गया ✓" : "Mark Read"}
                      </button>
                    </div>

                    {/* Lecture Item 2 */}
                    <div className="bg-white p-3 border rounded-xl flex items-center justify-between text-xs">
                      <span className={watchedLectures.lec2 ? "line-through text-slate-400 font-medium" : "font-bold"}>2. सोशल मीडिया स्ट्रेटेजी</span>
                      <button onClick={() => toggleWatched("lec2")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${watchedLectures.lec2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {watchedLectures.lec2 ? "देखा गया ✓" : "Mark Read"}
                      </button>
                    </div>

                    {/* Lecture Item 3 */}
                    <div className="bg-white p-3 border rounded-xl flex items-center justify-between text-xs">
                      <span className={watchedLectures.lec3 ? "line-through text-slate-400 font-medium" : "font-bold"}>3. लीड जनरेशन मॉड्यूल</span>
                      <button onClick={() => toggleWatched("lec3")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${watchedLectures.lec3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {watchedLectures.lec3 ? "देखा गया ✓" : "Mark Read"}
                      </button>
                    </div>

                  </div>
                </div>
                
                {/* Visual Progress percentage summary calculation */}
                <div className="pt-4 border-t mt-4 text-xs font-bold text-slate-600">
                  कुल प्रोग्रेस: {Object.values(watchedLectures).filter(Boolean).length * 33}% पूरा हुआ
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 border border-dashed rounded-xl">
              <span className="text-3xl block">🔒</span>
              <h4 className="text-sm font-bold text-slate-700 mt-2">डिजिटल मार्केटिंग कोर्स सामग्री लॉक है!</h4>
              <p className="text-xs text-slate-400 mt-1">कोर्स प्लेलिस्ट और परीक्षा प्रणाली को सक्रिय करने के लिए ₹299 का भुगतान आवश्यक है।</p>
            </div>
          )}
        </div>

        {/* SECTION 3: Test Engine & PDF Certification */}
        {student?.is_enrolled && (
          <div className="bg-white p-6 border rounded-2xl shadow-xs">
            <h3 className="text-lg font-bold mb-1">📝 ऑनलाइन परीक्षा केंद्र</h3>
            {student?.test_qualified ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">🎉 परीक्षा उत्तीर्ण!</h4>
                  <p className="text-xs text-emerald-700 mt-1">सर्टिफिकेट नंबर: <span className="font-mono font-bold bg-white px-1.5 py-0.5 border rounded">{student?.certificate_no}</span></p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/certificate/view?id=${student.id}`} className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl">प्रमाण पत्र 🎓</Link>
                  <Link href={`/report/view?id=${student.id}`} className="bg-sky-600 text-white text-xs font-bold px-4 py-3 rounded-xl">3-5 पेज रिपोर्ट कार्ड 📊</Link>
                </div>
              </div>
            ) : (
              <Link href={`/test/${student?.id}`} className="block w-full bg-emerald-600 text-white text-center font-bold py-3.5 px-4 rounded-xl shadow-xs">ऑनलाइन MCQ टेस्ट शुरू करें 🚀</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}