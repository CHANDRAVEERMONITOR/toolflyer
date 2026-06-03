import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-[#059669] to-[#0284c7] bg-clip-text text-transparent tracking-tight">
              ToolFlyer
            </span>
            <span className="bg-[#059669]/10 text-[#059669] text-xs font-bold px-2 py-0.5 rounded-sm">
              Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-[#475569] hover:text-[#0f172a] transition-colors"
            >
              लॉगिन करें
            </Link>
            <Link 
              href="/signup" 
              className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              नया अकाउंट बनाएं
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center flex-grow flex flex-col justify-center items-center">
        <div className="inline-flex items-center space-x-2 bg-[#0284c7]/10 text-[#0284c7] font-semibold text-xs px-4 py-1.5 rounded-full mb-6">
          <span>✨ ऑनलाइन परीक्षा एवं सर्टिफिकेट वेरिफिकेशन पोर्टल</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0f172a] leading-tight mb-6">
          अपनी योग्यता जांचें और <br />
          <span className="bg-gradient-to-r from-[#059669] to-[#0284c7] bg-clip-text text-transparent">
            सर्टिफाइड प्रोफेशनल
          </span> बनें
        </h1>
        
        <p className="text-lg md:text-xl text-[#475569] max-w-2xl mb-10 leading-relaxed">
          ToolFlyer पोर्टल पर आपका स्वागत है। यहाँ आप ऑनलाइन MCQ टेस्ट देकर तुरंत अपना स्कोर देख सकते हैं और वेरिफाइड सर्टिफिकेट प्राप्त कर सकते हैं।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-12">
          <Link 
            href="/signup" 
            className="flex-1 bg-[#059669] hover:bg-[#047857] text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl text-center transition-all transform hover:-translate-y-0.5"
          >
            अभी शुरू करें (फ्री)
          </Link>
          <Link 
            href="/login" 
            className="flex-1 bg-white border-2 border-[#e2e8f0] hover:border-[#0284c7] text-[#0f172a] text-base font-bold px-8 py-4 rounded-xl text-center transition-all hover:bg-[#f8fafc]"
          >
            स्टूडेंट डैशबोर्ड
          </Link>
        </div>

        {/* Short Features Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl text-left shadow-xs">
            <div className="text-2xl mb-3">📝</div>
            <h3 className="font-bold text-base mb-1">20-Min MCQ टेस्ट</h3>
            <p className="text-xs text-[#475569]">रैंडम सवालों के साथ अपनी थ्योरी और प्रैक्टिकल नॉलेज की परीक्षा लें।</p>
          </div>
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl text-left shadow-xs">
            <div className="text-2xl mb-3">🎓</div>
            <h3 className="font-bold text-base mb-1">इंस्टेंट रिजल्ट</h3>
            <p className="text-xs text-[#475569]">टेस्ट खत्म होते ही तुरंत मार्कशीट और रिजल्ट का पूरा विवरण देखें।</p>
          </div>
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl text-left shadow-xs">
            <div className="text-2xl mb-3">🏅</div>
            <h3 className="font-bold text-base mb-1">वेरिफाइड सर्टिफिकेट</h3>
            <p className="text-xs text-[#475569]">क्यूआर कोड और यूनिक आईडी के साथ पूरी तरह से डिजिटल वेरीफिएबल सर्टिफिकेट।</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-6 text-center text-xs text-[#475569]">
        <div className="max-w-6xl mx-auto px-6">
          © 2026 ToolFlyer Portal. सर्वाधिकार सुरक्षित।
        </div>
      </footer>
    </div>
  );
}