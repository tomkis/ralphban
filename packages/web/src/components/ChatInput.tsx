import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '16px',
        borderTop: '1px solid #ddd',
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: '20px',
          border: '1px solid #ddd',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          padding: '12px 24px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Send
      </button>
    </form>
  );
}
