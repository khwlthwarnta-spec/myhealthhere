import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const keywordResponses: Record<string, string> = {
  "الماء": "شرب الماء ضروري جداً. يُنصح بشرب 8 أكواب يومياً على الأقل للحفاظ على ترطيب الجسم ووظائف الأعضاء. (المصدر: Mayo Clinic)",
  "النوم": "النوم الجيد (7-9 ساعات للبالغين) يعزز المناعة، يحسن الذاكرة، ويقلل التوتر. (المصدر: منظمة الصحة العالمية)",
  "التمرين": "ممارسة النشاط البدني المعتدل لمدة 150 دقيقة أسبوعياً تقلل من خطر الإصابة بالأمراض المزمنة. (المصدر: American Heart Association)",
  "التغذية": "التغذية المتوازنة التي تشمل الخضروات، الفواكه، والحبوب الكاملة هي أساس الصحة الجيدة والوقاية من الأمراض.",
  "الإجهاد": "إدارة الإجهاد عبر التأمل، التنفس العميق، والرياضة تساعد في حماية القلب والصحة النفسية.",
  "السكر": "تقليل استهلاك السكريات المضافة يحمي من السمنة والسكري من النوع الثاني. (المصدر: CDC)",
  "الضغط": "الحفاظ على ضغط الدم الطبيعي يتطلب تقليل الملح، ممارسة الرياضة، وتجنب التدخين.",
  "التدخين": "الإقلاع عن التدخين هو أهم خطوة لحماية الرئتين والقلب وتقليل خطر السرطان. (المصدر: WHO)",
  "الوزن": "الحفاظ على وزن صحي يعتمد على التوازن بين السعرات المستهلكة والنشاط البدني.",
};

const defaultResponse = "عذراً، لا أملك معلومات مخصصة حول هذا الموضوع. يُرجى مراجعة المصادر الطبية الموثوقة كمنظمة الصحة العالمية أو استشارة طبيب مختص.";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "مرحباً! أنا المساعد الصحي الافتراضي. يمكنك سؤالي عن الماء، النوم، التمرين، أو التغذية." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let response = defaultResponse;
      for (const [key, val] of Object.entries(keywordResponses)) {
        if (userMsg.includes(key)) {
          response = val;
          break;
        }
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              size="icon"
              className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">المساعد الافتراضي</h3>
                  <p className="text-[10px] opacity-80">للإرشاد العام، ليس بديلاً عن الطبيب</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="h-[350px] p-4 flex flex-col gap-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.role === "user" ? "bg-secondary text-secondary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t bg-background flex gap-2">
              <Input
                placeholder="اكتب سؤالك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-muted/50 border-none"
              />
              <Button size="icon" className="flex-shrink-0 rounded-full" onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4 rtl:-scale-x-100" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
