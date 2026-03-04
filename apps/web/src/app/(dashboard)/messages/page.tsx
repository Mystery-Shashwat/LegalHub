"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/store/auth";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

// Contacts represent users you have booked or who booked you.
interface Contact {
    id: string; // The other user's ID
    name: string;
    role: string;
    roomId: string; // UserA_UserB
}

export default function MessagesPage() {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch contacts based on role
    // For MVP, we'll derive contacts from Bookings
    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/bookings');
            const uniqueContacts = new Map<string, Contact>();
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.bookings.forEach((b: any) => {
                const isLawyer = user?.role === "LAWYER";
                const otherUser = isLawyer ? b.client : b.lawyer.user;
                const otherId = isLawyer ? b.clientId : b.lawyerProfileId; // Requires backend fix to return deep User ID, assuming its mapped

                // Robust Room ID generation (sorted alphabetically)
                const ids = [user?.id, otherUser.id || otherId].sort();
                const roomId = `${ids[0]}_${ids[1]}`;

                if (!uniqueContacts.has(otherUser.email)) {
                    uniqueContacts.set(otherUser.email, {
                        id: otherUser.id || otherId,
                        name: otherUser.name,
                        role: isLawyer ? "CLIENT" : "LAWYER",
                        roomId
                    });
                }
            });
            setContacts(Array.from(uniqueContacts.values()));
        } catch (error) {
            console.error("Failed to load contacts", error);
        }
    };
    if (user) fetchContacts();
  }, [user]);

  useEffect(() => {
    // 2. Initialize Socket Connection
    if (!token) return;
    
    // eslint-disable-next-line no-undef
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
        auth: { token }
    });

    socketRef.current.on("receive_message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
    });

    return () => {
        socketRef.current?.disconnect();
    };
  }, [token]);

  useEffect(() => {
    // 3. Auto-scroll to bottom when messages get added
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectContact = async (c: Contact) => {
    setActiveContact(c);
    setMessages([]);
    
    // Join Socket Room
    socketRef.current?.emit("join_room", c.roomId);

    // Fetch message history
    try {
        const { data } = await api.get(`/messages/${c.roomId}`);
        setMessages(data.messages);
    } catch (error) {
        console.error("Failed to load history", error);
        toast.error("Could not load chat history");
    }
  };

  const handleSend = () => {
      if (!newMessage.trim() || !activeContact) return;

      socketRef.current?.emit("send_message", {
          roomId: activeContact.roomId,
          content: newMessage
      });

      setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-card text-card-foreground shadow">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b font-semibold">Conversations</div>
        <ScrollArea className="flex-1">
            {contacts.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    No conversations yet. Book a session to start chatting.
                </div>
            )}
            {contacts.map((c) => (
                <div 
                    key={c.roomId}
                    onClick={() => selectContact(c)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${activeContact?.roomId === c.roomId ? 'bg-muted' : ''}`}
                >
                    <Avatar>
                        <AvatarFallback>{c.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.role}</div>
                    </div>
                </div>
            ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeContact ? (
            <>
                <div className="p-4 border-b flex items-center gap-3 bg-muted/20">
                    <Avatar>
                        <AvatarFallback>{activeContact.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold">{activeContact.name}</div>
                </div>
                
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m) => {
                            const isMe = m.senderId === user?.id;
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                        <p className="text-sm">{m.content}</p>
                                        <p className="text-[10px] opacity-70 mt-1 text-right">
                                            {format(new Date(m.createdAt), "h:mm a")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20">
                    <form 
                        className="flex gap-2"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <Input 
                            placeholder="Type heavily encrypted, totally legally binding message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                    </form>
                </div>
            </>
        ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
            </div>
        )}
      </div>
    </div>
  );
}
