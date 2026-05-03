export function HealthLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="shrink-0">
        <svg
          width="44"
          height="40"
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="شعار صحتك أولاً"
        >
          {/* Heart shape as a clip path */}
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="44" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="pulseLineGrad" x1="4" y1="22" x2="40" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="0.5" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Heart outline */}
          <path
            d="M22 37C22 37 3 25.5 3 13.5C3 8.25 7.25 4 12.5 4C15.8 4 18.72 5.68 20.5 8.22C21.1 9.1 22.9 9.1 23.5 8.22C25.28 5.68 28.2 4 31.5 4C36.75 4 41 8.25 41 13.5C41 25.5 22 37 22 37Z"
            stroke="url(#heartGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ECG / pulse line inside the heart */}
          <path
            d="M5 21 L11 21 L13.5 15 L16 25 L18.5 18 L20.5 22 L22 19 L23.5 25 L26 14 L28.5 22 L31 21 L39 21"
            stroke="url(#pulseLineGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />
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
