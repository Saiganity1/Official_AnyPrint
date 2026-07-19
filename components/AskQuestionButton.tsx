"use client";

import { MessageCircle } from "lucide-react";

export function AskQuestionButton({ product }: { product: any }) {
  return (
    <button 
      onClick={() => window.dispatchEvent(new CustomEvent('open-product-chat', { detail: { product } }))}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '1rem', 
        background: 'var(--background-secondary)', 
        color: 'var(--foreground)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        cursor: 'pointer', 
        fontSize: '1rem', 
        fontWeight: 'bold' 
      }}
    >
      <MessageCircle size={20} /> Ask a Question
    </button>
  );
}
