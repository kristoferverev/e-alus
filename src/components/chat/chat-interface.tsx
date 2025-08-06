"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { Session } from "@supabase/supabase-js";
import { SendHorizonal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendMessageAction } from "@/app/actions";
import { toast } from "sonner";

type Message = Database["public"]["Tables"]["messages"]["Row"];

type ChatInterfaceProps = {
  initialMessages: Message[];
  conversationId: string;
  session: Session;
};

export function ChatInterface({
  initialMessages,
  conversationId,
  session,
}: ChatInterfaceProps) {
  const supabase = createSupabaseBrowserClient();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Add the new message to the state, but only if it's not already there
          // This prevents duplicates from the initial fetch and the real-time event
          setMessages((currentMessages) => {
            if (currentMessages.find((m) => m.id === payload.new.id)) {
              return currentMessages;
            }
            return [...currentMessages, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(""); // Clear input immediately

    const result = await sendMessageAction(conversationId, content);

    if (result?.error) {
      toast.error(result.error);
      setNewMessage(content); // Restore input if sending failed
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender_id === session.user.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-2xl p-3 rounded-2xl ${
                message.sender_id === session.user.id
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs text-right mt-1 opacity-75">
                {new Date(message.created_at).toLocaleTimeString("et-EE", {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Kirjuta sõnum..."
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}