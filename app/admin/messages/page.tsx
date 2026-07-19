"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Poll conversations every 5 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll active messages every 3 seconds
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      const interval = setInterval(() => fetchMessages(activeConversationId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/chat/${activeConversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(activeConversationId);
        fetchConversations(); // Update list order
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Message Center</h1>

      <div className="glass-card" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
        
        {/* Left Pane: Conversations */}
        <div style={{ width: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--background-secondary)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active Inquiries</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No messages yet.</div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: activeConversationId === conv.id ? 'var(--background)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{conv.user?.name || "Customer"}</div>
                    {conv.unreadCount > 0 && (
                      <div style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {conv.product && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <Package size={12} /> {conv.product.name}
                    </div>
                  )}

                  <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.messages[0]?.content || "No messages yet"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
          {!activeConversation ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)', flexDirection: 'column', gap: '1rem' }}>
              <MessageCircle size={48} opacity={0.5} />
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{activeConversation.user?.name || "Customer"}</h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>{activeConversation.user?.email || "No email provided"}</div>
                </div>
                {activeConversation.product && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    {activeConversation.product.imageUrl && (
                      <div style={{ width: '30px', height: '30px', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                        <Image src={activeConversation.product.imageUrl} alt="Product" fill sizes="30px" style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{activeConversation.product.name}</div>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ alignSelf: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem', textAlign: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? 'right' : 'left' }}>
                      {(msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? `You (${msg.senderRole === "OWNER" ? "Owner" : "Admin"})` : activeConversation.user?.name || "Customer"}
                    </div>
                    <div style={{
                      padding: msg.content.startsWith("PRODUCT_LINK:") ? '0.5rem' : '1rem',
                      background: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? 'var(--primary)' : 'var(--background-secondary)',
                      color: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? 'white' : 'var(--foreground)',
                      borderRadius: '1rem',
                      borderBottomRightRadius: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? '0' : '1rem',
                      borderBottomLeftRadius: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? '1rem' : '0',
                      fontSize: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {(() => {
                        if (msg.content.startsWith("PRODUCT_LINK:")) {
                          try {
                            const p = JSON.parse(msg.content.replace("PRODUCT_LINK:", ""));
                            return (
                              <Link href={`/product/${p.id}`} target="_blank" style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                {p.imageUrl && (
                                  <div style={{ width: '60px', height: '60px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Image src={p.imageUrl} alt={p.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--foreground)', lineHeight: '1.2', marginBottom: '0.25rem' }}>{p.name}</div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 'bold' }}>₱{p.price?.toFixed(2)}</div>
                                </div>
                              </Link>
                            );
                          } catch (e) {
                            return msg.content;
                          }
                        }
                        return msg.content;
                      })()}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.25rem', textAlign: (msg.senderRole === "ADMIN" || msg.senderRole === "OWNER") ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', background: 'var(--background)' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply... (Press Enter to send)"
                  disabled={isLoading}
                  style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--background-secondary)', color: 'var(--foreground)', outline: 'none', fontSize: '1rem' }}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !newMessage.trim()}
                  style={{ 
                    padding: '0 2rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer', 
                    opacity: newMessage.trim() ? 1 : 0.5,
                    fontWeight: 'bold'
                  }}
                >
                  Send <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
