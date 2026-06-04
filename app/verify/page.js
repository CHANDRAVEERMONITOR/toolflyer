"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function VerifyContent() {
  const searchParams = useSearchParams();
  const certNo = searchParams.get("cert");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const verifyCertificate = async (id) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("name, father_name, college, university, roll_no, faculty, certificate_no, created_at")
      .eq("certificate_no", id)
      .single();

    if (!error && data) setStudent(data);
    else setStudent(null);
    setLoading(false);
  };

  useEffect(() => {
    if (certNo) {
      setSearchQuery(certNo);
      verifyCertificate(certNo);
    } else {
      setLoading(false);
    }
  }, [certNo]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) verifyCertificate(searchQuery.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans">
      <div className="max-w-2xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-emerald-600 tracking-wider">ToolFlyer</span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">🛡️ केंद्रीय प्रमाणन सत्यापन गेटवे</h1>
          <p className="text-xs text-slate-500 mt-1">Central Digital Certificate Verification Registry</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border shadow-xs flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="प्रमाण पत्र संख्या (e.g. TF-2026-101) दर्ज करें" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-slate-50 border p-3 rounded-xl text-xs font-bold font-mono outline-hidden focus:border-emerald-600"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all">
            सत्यापित करें
          </button>
        </form>

        {/* Result Container */}
        {loading ? (
          <div className="text-center py-10 font-bold text-xs animate-pulse text-slate-400">डेटाबेस से रिकॉर्ड सत्यापित हो रहा है...</div>
        ) : student ? (
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-sm relative overflow-hidden animate-fadeIn">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 font-black text-xs rotate-45 pt-8 pl-4">
              VERIFIED
            </div>
            
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4">
              <span>✅</span> डिजिटल रिकॉर्ड प्रमाणित और सक्रिय है
            </div>

            <div className="space-y-3 text-xs border-t pt-4">
              <div className="grid grid-cols-2"><span className="text-slate-400">छात्र का नाम:</span> <span className="font-bold text-slate-900 uppercase">{student.name}</span></div>
              <div className="grid grid-cols-2"><span className="text-slate-400">पिता का नाम:</span> <span className="font-bold">{student.father_name || "N/A"}</span></div>
              <div className="grid grid-cols-2"><span className="text-slate-400">रोल नंबर:</span> <span className="font-mono font-bold">{student.roll_no}</span></div>
              <div className="grid grid-cols-2"><span className="text-slate-400">कॉलेज / फैकल्टी:</span> <span className="font-bold">{student.college} ({student.faculty})</span></div>
              <div className="grid grid-cols-2"><span className="text-slate-400">यूनिवर्सिटी:</span> <span className="font-bold">{student.university}</span></div>
              <div className="grid grid-cols-2 border-t pt-2 mt-2"><span className="text-slate-400 font-bold text-emerald-700">सर्टिफिकेट नंबर:</span> <span className="font-mono font-bold text-emerald-700">{student.certificate_no}</span></div>
            </div>
          </div>
        ) : searchQuery ? (
          <div className="bg-white border-2 border-rose-300 rounded-2xl p-8 text-center shadow-xs">
            <span className="text-4xl">❌</span>
            <h3 className="text-sm font-bold text-rose-600 mt-2">अवैध प्रमाण पत्र!</h3>
            <p className="text-xs text-slate-400 mt-1">इस नंबर का कोई भी रिकॉर्ड हमारे केंद्रीय डेटाबेस सर्वर पर मौजूद नहीं है।</p>
          </div>
        ) : null}
      </div>
      <footer className="text-center py-6 text-[10px] text-slate-400 border-t bg-white">
        ToolFlyer Central Ledger Security Node • System Active
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Verification Server...</div>}>
      <VerifyContent />
    </Suspense>
  );
}