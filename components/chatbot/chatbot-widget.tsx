"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, Sparkles, Loader2 } from "lucide-react";
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
    if (session?.user) {
      if (session.user.name) {
        setMessages([
          { role: "bot", content: `${session.user.name} ơi, bạn đang nghĩ gì thế?` },
        ]);
      } else {
        setMessages([
          { role: "bot", content: "Xin chào! Tôi có thể giúp gì cho bạn?" },
        ]);
      }
    } else {
      setMessages([
        { role: "bot", content: "Xin chào! Tôi có thể giúp gì cho bạn?" },
      ]);
    }
  }, [session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
        body: JSON.stringify({
          message: userMessage,
          forceGuest: isLandingRoute,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Không thể kết nối. Vui lòng thử lại sau." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16"
          >
            {/* Ripple Effect Ring */}
            <motion.div
              animate={{
                boxShadow: [
                  "0px 0px 0px 0px rgba(139, 92, 246, 0.4)",
                  "0px 0px 0px 20px rgba(139, 92, 246, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full"
            />
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-tr from-blue-600 via-violet-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] border-0 p-0 relative overflow-hidden flex items-center justify-center group"
              size="icon"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <motion.div
                animate={{ rotate: [-3, 3, -3], y: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex items-center justify-center h-full w-full z-10"
              >
                <Bot className="h-8 w-8 text-white drop-shadow-md" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-3 right-3"
                >
                  <Sparkles className="h-3 w-3 text-yellow-300 drop-shadow-sm" />
                </motion.div>
              </motion.div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 origin-bottom-right"
          >
            <Card className="w-[380px] sm:w-[400px] h-[580px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border-muted/60 flex flex-col overflow-hidden rounded-2xl bg-background/95 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-md relative overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-50%] bg-[conic-gradient(transparent,rgba(255,255,255,0.3),transparent)]"
                    />
                    <Bot className="h-5 w-5 text-white relative z-10" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Trợ Lý AI</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Trực tuyến
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-muted/80 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 z-10 scroll-smooth">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "bot" && (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-none ml-auto"
                            : "bg-background border shadow-sm text-foreground rounded-tl-none"
                          }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-1.5 h-[44px]">
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="h-1.5 w-1.5 bg-violet-500 rounded-full" />
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="h-1.5 w-1.5 bg-violet-500 rounded-full" />
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="h-1.5 w-1.5 bg-violet-500 rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Quick Questions */}
                {!isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-4 pb-3 z-10"
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" /> Gợi ý
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {isLandingPage ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Về chúng tôi?")}
                          >
                            Về chúng tôi?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Thông tin về các gói?")}
                          >
                            Thông tin về các gói?
                          </Button>
                        </>
                      ) : session?.user?.role === 'TENANT' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Kiểm tra thông báo mới")}
                          >
                            Thông báo mới?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Các khoản cần đóng?")}
                          >
                            Cần đóng tiền?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Thông tin hợp đồng của tôi?")}
                          >
                            Hợp đồng?
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Tổng số phòng còn trống?")}
                          >
                            Phòng trống?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Còn ai chưa đóng tiền?")}
                          >
                            Chưa đóng tiền?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-violet-500/10 hover:text-violet-600 border-border/50 rounded-full h-8 transition-all"
                            onClick={() => handleQuickQuestion("Gửi thông báo đóng tiền thông minh")}
                          >
                            Gửi nhắc nhở
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Input */}
                <div className="p-3 border-t bg-background/80 backdrop-blur-md z-10 flex-shrink-0">
                  <div className="flex gap-2 items-center relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Hỏi AI bất cứ điều gì..."
                      disabled={isLoading}
                      className="rounded-full pr-12 bg-muted/50 border-transparent hover:border-border focus-visible:ring-violet-500/30 h-10 shadow-inner"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="absolute right-1 h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 ml-0.5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
