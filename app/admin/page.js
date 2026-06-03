"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPanelPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Wallet aur Credit Edit karne ke liye states
  const [editingId, setEditingId] = useState(null);
  const [newWallet, setNewWallet] = useState(0);
  const [newCredits, setNewCredits] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Check Admin Session on Load
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_active");
    if (adminSession === "true") {
      setIsAdminLoggedIn(true);
      fetchStudents();
    }
  }, []);

  // 2. Admin Login Verification
  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Humne .env.local mein jo password set kiya tha, usse match karenge
    if (adminPass === "toolflyer2025") {
      localStorage.setItem("admin_active", "true");
      setIsAdminLoggedIn(true);
      fetchStudents();
    } else {
      alert("गलत एडमिन पासवर्ड! कृपया सही पासवर्ड डालें।");
    }
  };

  // 3. Fetch All Students From Supabase Matrix
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Student Wallet/Credits Inline Logic
  const handleUpdateStudent = async (id) => {
    setMessage({ type: "", text: "" });
    try {
      const { error } = await supabase
        .from("students")
        .update({
          wallet: parseInt(newWallet),
          total_credit_earning: parseInt(newCredits)
        })
        .eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "स्टूडेंट का रिकॉर्ड सफलतापूर्वक अपडेट हो गया!" });
      setEditingId(null);
      fetchStudents(); // Table refresh
    } catch (err) {
      setMessage({ type: "error", text: "अपडेट करने में त्रुटि हुई: " + err.message });
    }
  };

  const startEditing = (student) => {
    setEditingId(student.id);
    setNewWallet(student.wallet || 0);
    setNewCredits(student.total_credit_earning || 0);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_active");
    setIsAdminLoggedIn(false);
  };

  // ---- RENDER SCREEN 1: LOGIN BOX ----
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#e2e8f0] p-8 rounded-2xl shadow-xl text-center">
          <span className="text-3xl font-black bg-gradient-to-r from-[#d97706] to-[#0284c7] bg-clip-text text-transparent">
            ToolFlyer Admin
          </span>
          <h2 className="text-lg font-bold mt-3 text-[#0f172a]">कंट्रोल सेंटर लॉगिन</h2>
          
          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <input
              type="password"
              required
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="सुरक्षित एडमिन पासवर्ड दर्ज करें"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#d97706] p-3 rounded-xl text-sm text-center outline-hidden font-sans"
            />
            <button type="submit" className="w-full bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-bold py-3 rounded-xl shadow-md transition-all">
              कंट्रोल पैनल खोलें 🔑
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- RENDER SCREEN 2: MAIN ADMIN DASHBOARD ----
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black text-[#d97706]">ToolFlyer Admin</span>
          <span className="bg-[#d97706]/10 text-[#d97706] text-[10px] font-bold px-2 py-0.5 rounded-sm">SUPERPOWERS</span>
        </div>
        <button onClick={handleAdminLogout} className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg transition-all">
          एडमिन लॉगआउट 🚪
        </button>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0f172a]">पंजीकृत छात्र सूची (All Students List)</h1>
            <p className="text-xs text-[#475569] mt-0.5">यहाँ से आप छात्रों का वॉलेट रिचार्ज और क्रेडिट एडिट कर सकते हैं।</p>
          </div>
          <button onClick={fetchStudents} className="bg-white border border-[#e2e8f0] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#f8fafc] transition-all">
            🔄 रिफ्रेश डेटा
          </button>
        </div>

        {/* Global Feedback Message */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold text-center ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Students Management Table Matrix */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-bold text-[#475569] uppercase">
                  <th className="p-4">छात्र विवरण</th>
                  <th className="p-4">रोल / रजि. नंबर</th>
                  <th className="p-4">कॉलेज और फैकल्टी</th>
                  <th className="p-4">वॉलेट (Wallet)</th>
                  <th className="p-4">क्रेडिट्स (Credits)</th>
                  <th className="p-4 text-center">एक्शन (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-[#475569]">डेटाबेस से रिकॉर्ड लोड हो रहे हैं...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-[#475569]">अभी तक कोई छात्र पंजीकृत नहीं हुआ है।</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                      {/* Student Info */}
                      <td className="p-4">
                        <p className="font-bold text-sm text-[#0f172a]">{student.name}</p>
                        <p className="text-[#475569] text-[11px] mt-0.5">पिता: {student.father_name}</p>
                        <p className="text-[#888888] text-[10px] font-sans">Mob: {student.mob} | Email: {student.email}</p>
                      </td>
                      
                      {/* Roll & Reg */}
                      <td className="p-4 font-sans text-[#0f172a]">
                        <p><span className="text-[#475569]">Roll:</span> {student.roll_no}</p>
                        <p className="text-[11px] text-[#475569] mt-0.5"><span className="text-[#888888]">Reg:</span> {student.reg_no}</p>
                      </td>

                      {/* College & Faculty */}
                      <td className="p-4">
                        <p className="text-[#0f172a]">{student.college}</p>
                        <p className="text-xs font-bold text-[#0284c7] mt-1">{student.faculty} ({student.year})</p>
                      </td>

                      {/* Wallet Balance (Editable) */}
                      <td className="p-4 text-sm font-sans">
                        {editingId === student.id ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-[#475569]">₹</span>
                            <input
                              type="number"
                              value={newWallet}
                              onChange={(e) => setNewWallet(e.target.value)}
                              className="w-20 border border-[#e2e8f0] p-1.5 rounded-md font-bold text-center text-[#0f172a] bg-[#f8fafc]"
                            />
                          </div>
                        ) : (
                          <span className="font-black text-emerald-600">₹ {student.wallet || 0}</span>
                        )}
                      </td>

                      {/* Credit Earnings (Editable) */}
                      <td className="p-4 text-sm font-sans">
                        {editingId === student.id ? (
                          <input
                            type="number"
                            value={newCredits}
                            onChange={(e) => setNewCredits(e.target.value)}
                            className="w-20 border border-[#e2e8f0] p-1.5 rounded-md font-bold text-center text-[#0f172a] bg-[#f8fafc]"
                          />
                        ) : (
                          <span className="font-black text-[#0284c7]">{student.total_credit_earning || 0} Cr</span>
                        )}
                      </td>

                      {/* Control Action Buttons */}
                      <td className="p-4 text-center">
                        {editingId === student.id ? (
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => handleUpdateStudent(student.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-md text-[11px]">
                              सेव (Save)
                            </button>
                            <button onClick={() => setEditingId(null)} className="bg-white border border-[#e2e8f0] text-[#475569] px-3 py-1.5 rounded-md text-[11px]">
                              रद्द करें
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEditing(student)} className="bg-[#0284c7]/10 text-[#0284c7] hover:bg-[#0284c7]/20 font-bold px-4 py-2 rounded-lg text-[11px] transition-all">
                            ✏️ फंड लोड / एडिट करें
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 text-center text-xs text-[#475569]">
        ToolFlyer Secure Admin Control Matrix © 2026
      </footer>
    </div>
  );
}