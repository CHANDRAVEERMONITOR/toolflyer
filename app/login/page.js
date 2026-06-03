"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  // Login ke liye states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Login Form Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Supabase ke 'students' table mein check karenge ki yeh email aur password match hota hai ya nahi
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.trim())
        .eq("password", password)
        .single();

      if (error || !student) {
        throw new Error("गलत ईमेल या पासवर्ड! कृपया दोबारा जांचें।");
      }

      // 2. Browser ke LocalStorage mein student ki details save kar dena taaki session bana rahe
      localStorage.setItem("student_session", JSON.stringify(student));

      setMessage({ type: "success", text: "लॉगिन सफल! डैशबोर्ड पर जा रहे हैं..." });
      
      // Successful login ke baad student dashboard par bhej denge
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err) {
      setMessage({ type: "error", text: err.message || "लॉगिन करने में असमर्थ, कृपया पुनः प्रयास करें।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] p-6 sm:p-8 rounded-2xl shadow-xl">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-[#059669] to-[#0284c7] bg-clip-text text-transparent">
            ToolFlyer Portal
          </Link>
          <h2 className="text-xl font-bold mt-3 text-[#0f172a]">स्टूडेंट लॉगिन (Student Login)</h2>
          <p className="text-xs text-[#475569] mt-1">अपने क्रेडेंशियल्स के साथ पोर्टल में प्रवेश करें</p>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold text-center ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">ईमेल एड्रेस (Email Address) *</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@gmail.com" 
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" 
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">पासवर्ड (Password) *</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="अपना पासवर्ड दर्ज करें" 
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#059669] hover:bg-[#047857] text-white text-base font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "सत्यापन हो रहा है..." : "लॉगिन करें"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm text-[#475569]">
          नया अकाउंट बनाना है?{" "}
          <Link href="/signup" className="text-[#0284c7] font-bold hover:underline">
            यहाँ रजिस्टर करें
          </Link>
        </div>

      </div>
    </div>
  );
}