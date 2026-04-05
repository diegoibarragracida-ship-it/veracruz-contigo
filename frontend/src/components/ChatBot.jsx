import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n/LanguageContext";
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from "lucide-react";

const CHAT_LABELS = {
  es: { title: "VeraCruz AI", subtitle: "Asistente turístico", placeholder: "Pregúntame sobre Veracruz...", greeting: "¡Hola! Soy VeraCruz AI, tu asistente turístico. ¿En qué puedo ayudarte? Puedo recomendarte rutas, municipios, eventos y más." },
  en: { title: "VeraCruz AI", subtitle: "Tourism assistant", placeholder: "Ask me about Veracruz...", greeting: "Hi! I'm VeraCruz AI, your tourism assistant. How can I help you? I can recommend routes, municipalities, events and more." },
  fr: { title: "VeraCruz AI", subtitle: "Assistant touristique", placeholder: "Demandez-moi sur Veracruz...", greeting: "Bonjour ! Je suis VeraCruz AI, votre assistant touristique. Comment puis-je vous aider ? Je peux vous recommander des itinéraires, municipalités, événements et plus." },
};

const ChatBot = () => {
  const { lang } = useLanguage();
  const labels = CHAT_LABELS[lang] || CHAT_LABELS.es;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Set greeting when opening for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: labels.greeting }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, {
        message: text,
        session_id: sessionId,
        lang,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: lang === "en" ? "Sorry, I had an error. Please try again." 
               : lang === "fr" ? "Désolé, j'ai eu une erreur. Veuillez réessayer."
               : "Lo siento, tuve un error. Intenta de nuevo." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#1B5E20] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#145218] transition-all hover:scale-110 group"
          data-testid="chatbot-toggle"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F9A825] rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: "520px" }}
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{labels.title}</h3>
                <p className="text-white/70 text-xs">{labels.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              data-testid="chatbot-close"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50" data-testid="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-[#1B5E20]" : "bg-[#F9A825]"
                  }`}>
                    {msg.role === "user" 
                      ? <User className="w-3.5 h-3.5 text-white" />
                      : <Bot className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-[#1B5E20] text-white rounded-tr-sm" 
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                  }`}>
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F9A825] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={labels.placeholder}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                disabled={loading}
                data-testid="chatbot-input"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-[#1B5E20] text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#145218] transition-colors"
                data-testid="chatbot-send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
