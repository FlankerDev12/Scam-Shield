import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { buildUrl, api } from "@shared/routes";
import type { Message, Conversation } from "@shared/schema";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function AIChat({ isOpen, onClose, initialMessage }: AIChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Create conversation on mount or when opened
  const createConv = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", api.chat.createConversation.path, { title: "Scan Analysis" });
      return res.json() as Promise<Conversation>;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      if (initialMessage) {
        sendMessage.mutate(initialMessage);
      }
    }
  });

  useEffect(() => {
    if (isOpen && !conversationId && !createConv.isPending) {
      createConv.mutate();
    }
  }, [isOpen]);

  const { data: messages = [], isLoading: isLoadingHistory } = useQuery<Message[]>({
    queryKey: [buildUrl(api.chat.getHistory.path, { id: conversationId || 0 })],
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", buildUrl(api.chat.sendMessage.path, { id: conversationId! }), { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [buildUrl(api.chat.getHistory.path, { id: conversationId! })] });
      setInputValue("");
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md animate-in slide-in-from-right duration-300 sm:w-[400px]">
      <Card className="flex h-full flex-col rounded-none border-l shadow-2xl glass grain">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Expert Scam Analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4" ref={scrollRef}>
            {messages.length === 0 && !isLoadingHistory && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <Bot className="mb-2 h-10 w-10" />
                <p className="text-sm">How can I help you understand this scan?</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
                      {msg.role === "user" ? "You" : "Shield AI"}
                    </span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {(sendMessage.isPending || createConv.isPending) && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-2.5 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim() && !sendMessage.isPending) {
                sendMessage.mutate(inputValue.trim());
              }
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="rounded-full bg-secondary/50 focus-visible:ring-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full shrink-0"
              disabled={!inputValue.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
