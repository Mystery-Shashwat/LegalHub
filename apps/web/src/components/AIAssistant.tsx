"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am LexAI, your legal information assistant. How can I help you understand your rights under Indian Law today?\n\n*Disclaimer: I provide general legal information, not professional legal advice. For specific matters, please consult a verified lawyer on LegalHub.*" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        conversationId
      });

      setConversationId(response.data.conversationId);
      setMessages(prev => [...prev, { role: "ai", content: response.data.message }]);
    } catch (error) {
        console.error("AI chat error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I am having trouble connecting to my legal database right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl z-50 border-primary/20 bg-background overflow-hidden animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg font-medium">LexAI Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/90" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
             {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap leading-relaxed", 
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-background border shadow-sm rounded-bl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-background border shadow-sm rounded-lg rounded-bl-none p-4">
                     <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a legal question..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
