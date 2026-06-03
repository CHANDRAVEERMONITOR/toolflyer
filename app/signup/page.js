"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  
  // Saari zaroori jankari ke liye states
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    college: "",
    university: "",
    roll_no: "",
    reg_no: "",
    dob: "",
    mob: "",
    email: "",
    faculty: "Science", // Default value
    year: "1st Year",   // Default value
    password: "",
    refer: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submit Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Pehle check karenge ki email ya mobile pehle se register toh nahi hai
      const { data: existingUser } = await supabase
        .from("students")
        .select("email, mob")
        .or(`email.eq.${formData.email},mob.eq.${formData.mob}`)
        .single();

      if (existingUser) {
        throw new Error("यह ईमेल या मोबाइल नंबर पहले से रजिस्टर्ड है!");
      }

      // 2. Supabase table 'students' mein poora data insert karna
      // wallet aur total_credit_earning default 0 se shuru honge
      const { error } = await supabase.from("students").insert([
        {
          name: formData.name,
          father_name: formData.father_name,
          college: formData.college,
          university: formData.university,
          roll_no: formData.roll_no,
          reg_no: formData.reg_no,
          dob: formData.dob,
          mob: formData.mob,
          email: formData.email,
          faculty: formData.faculty,
          year: formData.year,
          password: formData.password, // Authentication handle karne ke liye plain password verification
          refer: formData.refer || null,
          wallet: 0,
          total_credit_earning: 0
        }
      ]);

      if (error) throw error;

      setMessage({ type: "success", text: "अकाउंट सफलतापूर्वक बन गया! लॉगिन पेज पर जा रहे हैं..." });
      
      // 2 second baad automatic login page par bhej denge
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setMessage({ type: "error", text: err.message || "कुछ गड़बड़ हुई, कृपया दोबारा प्रयास करें।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white border border-[#e2e8f0] p-6 sm:p-8 rounded-2xl shadow-xl my-6">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-[#059669] to-[#0284c7] bg-clip-text text-transparent">
            ToolFlyer Portal
          </Link>
          <h2 className="text-xl font-bold mt-3 text-[#0f172a]">छात्र पंजीकरण (Student Registration)</h2>
          <p className="text-xs text-[#475569] mt-1">सर्टिफिकेट और परीक्षा के लिए कृपया अपनी सही जानकारी भरें</p>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold text-center ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">विद्यार्थी का नाम (Full Name) *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="अपना पूरा नाम लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">पिता का नाम (Father's Name) *</label>
              <input type="text" name="father_name" required value={formData.father_name} onChange={handleChange} placeholder="पिता का नाम लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">कॉलेज का नाम (College Name) *</label>
              <input type="text" name="college" required value={formData.college} onChange={handleChange} placeholder="अपने कॉलेज का नाम लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">यूनिवर्सिटी (University) *</label>
              <input type="text" name="university" required value={formData.university} onChange={handleChange} placeholder="यूनिवर्सिटी का नाम लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Roll No */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">रोल नंबर (Roll No) *</label>
              <input type="text" name="roll_no" required value={formData.roll_no} onChange={handleChange} placeholder="Exam Roll Number लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Registration No */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">रजिस्ट्रेशन नंबर (Registration No) *</label>
              <input type="text" name="reg_no" required value={formData.reg_no} onChange={handleChange} placeholder="Registration Number लिखें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">जन्म तिथि (Date of Birth) *</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5 font-sans">मोबाइल नंबर (Mobile) *</label>
              <input type="tel" name="mob" required maxLength="10" value={formData.mob} onChange={handleChange} placeholder="10 अंकों का मोबाइल नंबर" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">ईमेल एड्रेस (Email) *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="example@gmail.com" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">पासवर्ड (Password) *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="लॉगिन के लिए पासवर्ड बनाएं" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
            </div>

            {/* Faculty (Arts, Commerce, Science) */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">फैकल्टी (Faculty) *</label>
              <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]">
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
                <option value="Science">Science</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">वर्ष (Year) *</label>
              <select name="year" value={formData.year} onChange={handleChange} className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          {/* Refer Code */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">रेफरल कोड (Refer Code) - वैकल्पिक</label>
            <input type="text" name="refer" value={formData.refer} onChange={handleChange} placeholder="यदि कोई रेफरल कोड है तो दर्ज करें" className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] p-3 rounded-xl text-sm outline-hidden transition-all text-[#0f172a]" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-[#059669] hover:bg-[#047857] text-white text-base font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4">
            {loading ? "रजिस्ट्रेशन हो रहा है..." : "अकाउंट सुरक्षित बनाएं"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm text-[#475569]">
          पहले से अकाउंट है?{" "}
          <Link href="/login" className="text-[#0284c7] font-bold hover:underline">
            यहाँ लॉगिन करें
          </Link>
        </div>

      </div>
    </div>
  );
}