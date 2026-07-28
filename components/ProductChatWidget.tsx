"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send } from "lucide-react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function ProductChatWidget() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const pendingRequestsRef = useRef(0);
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchMessages = async (isAfterSend = false) => {
    if (status !== "authenticated") return;
    const url = productId ? `/api/chat/messages?productId=${productId}` : `/api/chat/messages`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        // If there are pending requests, the server state is stale (missing the optimistic messages).
        // Only accept the server state if there are NO pending requests, 
        // OR if this is the explicit fetch after the LAST pending request finishes.
        if (pendingRequestsRef.current > (isAfterSend ? 1 : 0)) {
          return;
        }
        
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.product) {
        const product = customEvent.detail.product;
        setProductId(product.id);
        setProductName(product.name);
        setActiveProduct(product);
      }
      setIsOpen(true);
    };
    window.addEventListener('open-product-chat', handleOpenChat);
    return () => window.removeEventListener('open-product-chat', handleOpenChat);
  }, [newMessage]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Poll every 1 second, but pause if we are currently sending to prevent optimistic UI flicker
      const interval = setInterval(() => {
        if (pendingRequestsRef.current === 0) {
          fetchMessages();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, status, productId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent, overrideMessage?: string) => {
    e?.preventDefault();
    const contentToSend = overrideMessage || newMessage;
    if (!contentToSend.trim() || status !== "authenticated") return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: tempId,
      content: contentToSend,
      senderRole: "USER",
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, optimisticMessage]);
    
    if (!overrideMessage) setNewMessage("");
    if (overrideMessage && overrideMessage.startsWith("PRODUCT_LINK:")) setActiveProduct(null);

    pendingRequestsRef.current += 1;
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend, productId })
      });

      if (res.ok) {
        if (pendingRequestsRef.current === 1) {
          await fetchMessages(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      pendingRequestsRef.current -= 1;
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith("PRODUCT_LINK:")) {
      try {
        const p = JSON.parse(content.replace("PRODUCT_LINK:", ""));
        return (
          <Link href={`/product/${p.id}`} onClick={() => setIsOpen(false)} style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            gap: '0.75rem', 
            alignItems: 'center', 
            background: 'var(--background)', 
            padding: '0.75rem', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: '250px'
          }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', background: 'var(--background-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.25rem' }}>₱{p.price?.toFixed(2)}</div>
            </div>
          </Link>
        );
      } catch (e) {
        return content;
      }
    }
    return content;
  };

  if (status !== "authenticated" || !mounted) return null;

  return createPortal(
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="no-print"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="no-print" style={{
          position: 'fixed',
          bottom: '5rem',
          right: '2rem',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'fade-in 0.2s ease-out'
        }} className="dark-mode-chat">
          <style dangerouslySetInnerHTML={{__html: `
            .dark-mode-chat {
              background: var(--background) !important;
              border: 1px solid var(--border);
            }
          `}} />
          {/* Header */}
          <div style={{ 
            padding: '1.25rem', 
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: 'white'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>Chat Support</h3>
              {productName && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem' }}>Asking about {productName}</div>}
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.5rem', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '2rem' }}>
                Start a conversation with us!
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.senderRole === "USER" ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem', textAlign: msg.senderRole === "USER" ? 'right' : 'left' }}>
                    {msg.senderRole === "USER" ? "You" : msg.senderRole === "OWNER" ? "Anyprint (Owner)" : "Anyprint (Admin)"}
                  </div>
                  <div style={{
                    padding: msg.content.startsWith("PRODUCT_LINK:") ? '0.25rem' : '0.75rem 1rem',
                    background: msg.senderRole === "USER" ? 'linear-gradient(135deg, var(--primary), #3b82f6)' : 'var(--background)',
                    color: msg.senderRole === "USER" ? 'white' : 'var(--foreground)',
                    borderRadius: '18px',
                    borderBottomRightRadius: msg.senderRole === "USER" ? '4px' : '18px',
                    borderBottomLeftRadius: msg.senderRole === "USER" ? '18px' : '4px',
                    fontSize: '0.9375rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: msg.senderRole === "USER" ? 'none' : '1px solid var(--border)'
                  }}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Optional Send Product Bar */}
          {activeProduct && (
            <div style={{ padding: '0.5rem 1rem', background: 'var(--background-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Send product to chat</div>
              <button 
                onClick={(e) => handleSend(e, `PRODUCT_LINK:${JSON.stringify({ id: activeProduct.id, name: activeProduct.name, imageUrl: activeProduct.imageUrl, price: activeProduct.price })}`)}
                style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Send Link
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => handleSend(e)} style={{ padding: '1rem', background: 'var(--background)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.875rem 1rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--background-secondary)', color: 'var(--foreground)', outline: 'none', fontSize: '0.9375rem', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: newMessage.trim() ? 'linear-gradient(135deg, var(--primary), #8b5cf6)' : 'var(--border)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.2s', transform: newMessage.trim() ? 'scale(1)' : 'scale(0.95)' }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}
