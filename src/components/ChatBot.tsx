import { useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "bot";
  text: string;
}

const quickReplies: Record<string, string> = {
  "What is KrishiMitra?": "KrishiMitra is an AI-powered agricultural platform that helps farmers with price prediction, group buying, video verification, and learning resources.",
  "How does price prediction work?": "Our AI analyzes 15-day historical price data across 8 crops and 5 cities, then uses trend analysis to predict future prices with up to 92% accuracy.",
  "What is group buying?": "Group buying lets farmers pool together to purchase seeds, fertilizers, and equipment at bulk discount prices — saving up to 30%!",
  "How do I get verified?": "Record a short video tour of your farm, upload it on our Verify page, and our team reviews it within 48 hours. It's completely free!",
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! 👋 I'm KrishiBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let reply = "I'm sorry, I don't understand that yet. Try asking about price prediction, group buying, or verification!";

      for (const [q, a] of Object.entries(quickReplies)) {
        if (lowerText.includes(q.toLowerCase().split(" ").slice(1, 3).join(" "))) {
          reply = a;
          break;
        }
      }

      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        reply = "Hello! 🌾 How can I help you with your farming needs today?";
      }

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      setTyping(false);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden"
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <span className="font-semibold">🌱 KrishiBot</span>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-xl text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 px-4 pb-2">
              {Object.keys(quickReplies).slice(0, 2).map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 transition-colors">
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-3 border-t border-border flex gap-2">
              <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} className="text-sm" />
              <Button size="icon" type="submit"><Send className="h-4 w-4" /></Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
};

export default ChatBot;
