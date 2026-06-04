"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function ChatbotWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLandingPage = !session?.user;
  const isLandingRoute = pathname === "/";

  useEffect(() => {
    setMessages([{
      role: "bot",
      content: session?.user?.name
        ? `${session.user.name} ơi, bạn đang nghĩ gì thế?`
        : "Xin chào! Tôi có thể giúp gì cho bạn?",
    }]);
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, forceGuest: isLandingRoute }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "bot",
        content: res.ok ? data.response : "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "bot",
        content: "Không thể kết nối. Vui lòng thử lại sau.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = isLandingPage
    ? ["Về chúng tôi?", "Thông tin về các gói?"]
    : session?.user?.role === "TENANT"
    ? ["Thông báo mới?", "Cần đóng tiền?", "Hợp đồng?"]
    : ["Phòng trống?", "Chưa đóng tiền?", "Gửi nhắc nhở"];

  return (
    <>
      {/* ── Floating button ──────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#fdb549]/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <button
              onClick={() => setIsOpen(true)}
              className="relative h-14 w-14 rounded-full bg-[#1f2116] hover:bg-[#31361b] shadow-xl flex items-center justify-center transition-colors duration-200 border border-[#fdb549]/20"
              aria-label="Mở trợ lý AI"
            >
              {/* Icon: logo image */}
              <img
                src="/icon.webp"
                alt="HouseSea AI"
                width={28}
                height={28}
                className="rounded-md"
              />
              {/* Sparkle badge */}
              <motion.div
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#fdb549] flex items-center justify-center shadow-sm"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-2.5 w-2.5 text-[#1f2116]" strokeWidth={2.5} />
              </motion.div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat window ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 origin-bottom-right"
          >
            <div className="w-[360px] sm:w-[380px] h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-[#e2e0d8] flex flex-col bg-[#fafaf8]">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1f2116] border-b border-[#31361b]">
                <div className="flex items-center gap-3">
                  {/* Logo avatar */}
                  <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 border border-[#fdb549]/30">
                    <img src="/icon.webp" alt="HouseSea AI" width={32} height={32} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none">Trợ Lý AI</p>
                    <p className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b9c38] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8b9c38]" />
                      </span>
                      Trực tuyến
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="h-6 w-6 rounded-md overflow-hidden flex-shrink-0 mt-1 border border-[#e2e0d8]">
                        <img src="/icon.webp" alt="AI" width={24} height={24} className="object-cover" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1f2116] text-white rounded-tr-none"
                          : "bg-white border border-[#e2e0d8] text-[#1f2116] rounded-tl-none shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="h-6 w-6 rounded-md overflow-hidden flex-shrink-0 mt-1 border border-[#e2e0d8]">
                      <img src="/icon.webp" alt="AI" width={24} height={24} className="object-cover" />
                    </div>
                    <div className="bg-white border border-[#e2e0d8] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[#fdb549]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Quick questions */}
              {!isLoading && (
                <div className="px-4 pb-2">
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-[#fdb549]" /> Gợi ý
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#e2e0d8] bg-white text-[#64748b] hover:border-[#fdb549] hover:text-[#1f2116] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-[#e2e0d8] bg-white flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Hỏi AI bất cứ điều gì..."
                    disabled={isLoading}
                    className="h-9 rounded-full bg-[#f8f7f4] border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-sm text-[#1f2116] placeholder:text-[#94a3b8]"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-9 w-9 rounded-full bg-[#fdb549] hover:bg-[#ed7307] text-[#1f2116] border-0 shadow-sm flex-shrink-0 transition-colors disabled:opacity-40"
                  >
                    {isLoading
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Send className="h-3.5 w-3.5 ml-0.5" />
                    }
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
