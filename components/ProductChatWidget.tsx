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
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchMessages = async () => {
    if (status !== "authenticated") return;
    const url = productId ? `/api/chat/messages?productId=${productId}` : `/api/chat/messages`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
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
      // Poll every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
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

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend, productId })
      });

      if (res.ok) {
        if (!overrideMessage) setNewMessage("");
        if (overrideMessage && overrideMessage.startsWith("PRODUCT_LINK:")) setActiveProduct(null); // hide the send product bar after sending
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith("PRODUCT_LINK:")) {
      try {
        const p = JSON.parse(content.replace("PRODUCT_LINK:", ""));
        return (
          <Link href={`/product/${p.id}`} onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--background)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--foreground)', lineHeight: '1.2' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>₱{p.price?.toFixed(2)}</div>
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
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '350px',
          height: '500px',
          background: 'var(--background)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Chat Support</h3>
              {productName && <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Asking about {productName}</div>}
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground-muted)' }}>
              <X size={20} />
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
                    background: msg.senderRole === "USER" ? 'var(--primary)' : 'var(--background-secondary)',
                    color: msg.senderRole === "USER" ? 'white' : 'var(--foreground)',
                    borderRadius: '1rem',
                    borderBottomRightRadius: msg.senderRole === "USER" ? '0' : '1rem',
                    borderBottomLeftRadius: msg.senderRole === "USER" ? '1rem' : '0',
                    fontSize: '0.875rem'
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
          <form onSubmit={(e) => handleSend(e)} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !newMessage.trim()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: newMessage.trim() ? 1 : 0.5 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}
