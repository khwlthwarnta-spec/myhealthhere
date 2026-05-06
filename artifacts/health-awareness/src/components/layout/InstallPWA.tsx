import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = (navigator as any).standalone === true;
    setIsIOS(ios);
    if (standalone) setInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  if (!prompt && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow">
        <button
          onClick={handleInstall}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #10b981, #0d9488)",
            boxShadow: "0 0 30px rgba(16,185,129,0.5)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v13M8 11l4 4 4-4"/>
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
          </svg>
          حمّل التطبيق على جهازك
        </button>
      </div>

      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "#1e293b", border: "1px solid #10b981" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold text-lg mb-4">تثبيت التطبيق على iPhone</p>
            <div className="space-y-3 text-sm text-slate-300 text-right">
              <div className="flex items-center gap-3">
                <span className="text-2xl">1️⃣</span>
                <span>اضغط على أيقونة <strong>المشاركة</strong> في الأسفل</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">2️⃣</span>
                <span>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">3️⃣</span>
                <span>اضغط <strong>إضافة</strong> وستجد التطبيق جاهزاً</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 px-6 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background: "#10b981" }}
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
