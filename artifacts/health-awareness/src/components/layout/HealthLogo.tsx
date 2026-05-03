export function HealthLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="shrink-0">
        <img
          src="@assets/Screenshot_20260503_151403_1777810632536.png"
          alt="صحتك أولاً | الفصل 2/5"
          className="w-[64px] h-[64px] object-contain rounded-[22px] shadow-lg"
        />
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
