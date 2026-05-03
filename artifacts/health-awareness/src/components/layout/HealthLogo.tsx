export function HealthLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon mark */}
      <div className="relative flex-shrink-0">
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hl-bg" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="hl-icon" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="hl-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rounded square background */}
          <rect width="42" height="42" rx="13" fill="url(#hl-bg)" opacity="0.15" />
          <rect width="42" height="42" rx="13" fill="none" stroke="url(#hl-bg)" strokeWidth="1.2" opacity="0.4" />

          {/* Leaf + heart hybrid shape */}
          <path
            d="M21 32 C13 26.5 8.5 20 11 14 C12.8 9.5 17 8.5 21 12.5 C25 8.5 29.2 9.5 31 14 C33.5 20 29 26.5 21 32Z"
            fill="url(#hl-icon)"
            opacity="0.82"
            filter="url(#hl-glow)"
          />

          {/* Heartbeat / ECG line across the leaf */}
          <polyline
            points="9,21 13,21 15,16 17,26 19,13 21,21 23,21 25,17.5 27,24.5 29,21 33,21"
            fill="none"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Tiny gleam dot top-right */}
          <circle cx="31" cy="11" r="2.2" fill="white" opacity="0.55" />
        </svg>
      </div>

      {/* Word-mark */}
      <div className="flex flex-col leading-none gap-[3px]">
        {/* Main title */}
        <span
          className="font-black text-[18px] tracking-tight bg-gradient-to-l from-violet-500 to-emerald-500 bg-clip-text text-transparent"
          style={{ lineHeight: 1 }}
        >
          صحتك أولاً
        </span>

        {/* Chapter badge row */}
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
