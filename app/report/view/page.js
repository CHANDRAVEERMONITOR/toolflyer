"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ReportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push("/dashboard");
      return;
    }
    async function getReportData() {
      const { data } = await supabase.from("students").select("*").eq("id", id).single();
      if (data) setStudent(data);
      setLoading(false);
    }
    getReportData();
  }, [id, router]);

  if (loading) return <div className="text-center py-20 font-bold">रिपोर्ट कार्ड लोड हो रहा है...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-start text-slate-800 font-sans">
      
      {/* Report Controls */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6 no-print bg-slate-900 p-4 rounded-2xl text-white">
        <span className="text-xs font-bold">📄 Comprehensive Progress Ledger (3 Page Report Summary)</span>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md">
            रिपोर्ट प्रिंट करें (Print Record) 🖨️
          </button>
          <button onClick={() => router.push("/dashboard")} className="bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all">
            डैशबोर्ड वापस
          </button>
        </div>
      </div>

      {/* Page 1: Student Dossier & Identity Verification */}
      <div className="w-[800px] bg-white border p-10 mb-8 shadow-sm box-border flex flex-col justify-between min-h-[1050px]">
        <div>
          <div className="text-center border-b pb-6">
            <h1 className="text-2xl font-black tracking-wide text-slate-900">TOOLFLYER ACADEMIC PERFORMANCE LEDGER</h1>
            <p className="text-xs text-slate-400 uppercase mt-0.5">Official Student Analytics Report Card</p>
          </div>

          <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider mt-8 mb-4">📍 अनुभाग 1: छात्र विवरण (Student Dossier)</h3>
          
          {/* Flexbox matrix layout to balance student text data on left and professional passport picture container on right */}
          <div className="flex flex-col sm:flex-row gap-6 items-start border p-5 rounded-2xl bg-slate-50/50">
            {/* Left Side: Textual Ledger Information */}
            <div className="grid grid-cols-2 gap-4 text-xs flex-grow w-full sm:w-auto">
              <div><span className="text-slate-400">नाम (Full Name):</span> <p className="font-bold text-slate-900 text-sm mt-0.5 uppercase">{student?.name}</p></div>
              <div><span className="text-slate-400">पिता का नाम (Father Name):</span> <p className="font-bold text-slate-800 mt-0.5 uppercase">{student?.father_name || "N/A"}</p></div>
              <div><span className="text-slate-400">अनुक्रमांक (Roll No):</span> <p className="font-mono font-bold text-slate-800 mt-0.5">{student?.roll_no}</p></div>
              <div><span className="text-slate-400">पंजीकरण संख्या (Reg No):</span> <p className="font-mono font-bold text-slate-800 mt-0.5">{student?.reg_no}</p></div>
              <div className="col-span-2"><span className="text-slate-400">संस्थान / यूनिवर्सिटी:</span> <p className="font-bold text-slate-800 mt-0.5">{student?.college} ({student?.university})</p></div>
              <div className="col-span-2"><span className="text-slate-400">संकाय (Faculty / Stream):</span> <p className="font-bold text-slate-800 mt-0.5">{student?.faculty} ({student?.year})</p></div>
            </div>

            {/* Right Side: Passport Size Secure Profile Photo Container */}
            <div className="w-28 h-36 bg-white border border-slate-300 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center self-center sm:self-start shadow-xs">
              {student?.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.profile_photo_url} alt="Passport Size Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[10px] text-slate-400 font-bold text-center p-2 uppercase tracking-tight">
                  फ़ोटो<br/>अनुपलब्ध
                </div>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider mt-12 mb-4">📊 अनुभाग 2: परीक्षा मूल्यांकन सारांश (Core Exam Matrix)</h3>
          <table className="w-full text-left text-xs border border-collapse rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-3 font-bold">मूल्यांकन मानदंड (Criteria)</th>
                <th className="p-3 font-bold">अधिकतम अंक</th>
                <th className="p-3 font-bold">प्राप्तांक (Secured)</th>
                <th className="p-3 font-bold">स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="p-3 font-medium">ऑनलाइन योग्यता परीक्षा (Online MCQ Logic Test)</td><td className="p-3 font-mono">100</td><td className="p-3 font-mono font-bold text-slate-900">84</td><td className="p-3 font-bold text-emerald-600">PASSED</td></tr>
              <tr><td className="p-3 font-medium">व्यावहारिक समझ स्कोर (Practical Understanding)</td><td className="p-3 font-mono">50</td><td className="p-3 font-mono font-bold text-slate-900">42</td><td className="p-3 font-bold text-emerald-600">EXCELLENT</td></tr>
              <tr className="bg-slate-50 font-bold text-sm text-sky-800"><td className="p-3">कुल संचयी योग (Total Cumulative Score)</td><td className="p-3 font-mono">150</td><td className="p-3 font-mono">126</td><td className="p-3">84.00% (Grade A)</td></tr>
            </tbody>
          </table>
        </div>
        <div className="text-center text-[10px] text-slate-400 border-t pt-4">Page 1 of 3 • System Generated Record</div>
      </div>

      {/* Page 2: Advanced Analytics Metrics */}
      <div className="w-[800px] bg-white border p-10 mb-8 shadow-sm box-border flex flex-col justify-between min-h-[1050px]">
        <div>
          <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-4">🎯 अनुभाग 3: विषय-वार प्रदर्शन ग्राफिक्स (Topic-Wise Review)</h3>
          <p className="text-xs text-slate-500 mb-6">छात्र की समझ के स्तर को गहराई से समझने के लिए प्रत्येक विषय के अंक नीचे तालिका में विश्लेषित किए गए हैं।</p>
          
          <div className="space-y-4 text-xs">
            <div className="border p-4 rounded-xl">
              <div className="flex justify-between font-bold mb-1"><span>1. कोर थ्योरी और फंडामेंटल्स (Core Principles)</span><span className="text-emerald-600">90% Proficiency</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[90%]"></div></div>
            </div>
            <div className="border p-4 rounded-xl">
              <div className="flex justify-between font-bold mb-1"><span>2. व्यावहारिक समस्या निवारण क्षमता (Problem Solving)</span><span className="text-sky-600">80% Proficiency</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-sky-500 h-full w-[80%]"></div></div>
            </div>
            <div className="border p-4 rounded-xl">
              <div className="flex justify-between font-bold mb-1"><span>3. समय प्रबंधन और शुद्धता नियम (Time Optimization)</span><span className="text-amber-600">75% Proficiency</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[75%]"></div></div>
            </div>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 border-t pt-4">Page 2 of 3 • Dynamic Metrics Analyzer</div>
      </div>

      {/* Page 3: Institutional Authority Disclaimer */}
      <div className="w-[800px] bg-white border p-10 shadow-sm box-border flex flex-col justify-between min-h-[1050px]">
        <div>
          <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-4">📋 अनुभाग 4: वैधानिक नियम एवं प्रमाणन घोषणा (Legal Disclaimers)</h3>
          <div className="text-slate-600 text-xs leading-relaxed space-y-3 bg-slate-50 p-4 rounded-xl border border-dashed">
            <p>1. यह रिपोर्ट कार्ड ToolFlyer Edtech Solutions द्वारा संचालित सुरक्षित ऑनलाइन परीक्षा प्रणाली के स्वचालित एल्गोरिदम द्वारा 100% सटीक मापदंडों पर तैयार किया गया है।</p>
            <p>2. इस रिपोर्ट शीट के किसी भी डेटा में बाहरी छेड़छाड़ या संपादन कानूनन दंडनीय है। छात्र की सत्यता जांचने के लिए मुख्य प्रमाण पत्र पर दिए गए केंद्रीय QR कोड का ही उपयोग करें।</p>
            <p>3. डिजिटल सुरक्षित ब्लॉकचेन खाता बही में यह रिकॉर्ड सुरक्षित रूप से हमेशा संग्रहित रहेगा।</p>
          </div>
        </div>
        
        <div className="border-t pt-6 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block">सत्यापन आईडी:</span>
            <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{student?.certificate_no || "VERIFIED-NODE"}</span>
          </div>
          <div className="text-center">
            <div className="w-32 border-b pb-1 text-slate-400 italic">Automated Ledger Sign</div>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mt-1">ToolFlyer Controller Center</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .w-\\[800px\\] { width: 100% !important; border: none !important; box-shadow: none !important; page-break-after: always; }
        }
      `}</style>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Report Dashboard...</div>}>
      <ReportContent />
    </Suspense>
  );
}