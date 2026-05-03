export function HealthLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="shrink-0">
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="شعار صحتك أولاً"
        >
          <rect width="42" height="42" rx="12" fill="url(#logoGrad)" />
          <path
            d="M21 31C21 31 10 24.5 10 16.5C10 13.46 12.46 11 15.5 11C17.24 11 18.79 11.86 19.79 13.15C20.22 13.72 21 13.72 21.21 13.15C22.21 11.86 23.76 11 25.5 11C28.54 11 31 13.46 31 16.5C31 24.5 21 31 21 31Z"
            fill="white"
            fillOpacity="0.95"
          />
          <rect x="19.5" y="15" width="3" height="9" rx="1.5" fill="url(#pulseGrad)" />
          <rect x="16" y="18.5" width="10" height="3" rx="1.5" fill="url(#pulseGrad)" />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col leading-none gap-[3px]">
        <span className="font-black text-[18px] tracking-tight text-foreground" style={{ lineHeight: 1 }}>
          صحتك أولاً
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-px w-4 rounded-full bg-gradient-to-r from-emerald-400/60 to-violet-400/60" />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-violet-400 flex-shrink-0" />
            <span className="text-[9.5px] font-bold tracking-widest text-muted-foreground uppercase">
              الفصل 2/5
            </span>
          </div>
          <span className="h-px w-4 rounded-full bg-gradient-to-r from-violet-400/60 to-emerald-400/60" />
        </div>
      </div>
    </div>
  );
}
