export function Footer() {
  return (
    <footer className="py-12 border-t bg-muted/30">
      <div className="container mx-auto px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-foreground">الفصل 2/5</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span><span className="text-foreground/60">المبرمج</span> حمزه نور الدين</span>
          <span><span className="text-foreground/60">المصمم</span> حمزه محمد</span>
          <span><span className="text-foreground/60">كتابة المواضيع</span> قتيبة مصطفى</span>
          <span><span className="text-foreground/60">جلب المصادر</span> محمد صالح</span>
          <span><span className="text-foreground/60">التأكد والمراجعة</span> زاهر العلاوي</span>
        </div>
      </div>
    </footer>
  );
}
