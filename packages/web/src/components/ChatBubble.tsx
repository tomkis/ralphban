interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '18px',
          backgroundColor: role === 'user' ? '#007bff' : '#e9ecef',
          color: role === 'user' ? 'white' : 'black',
          wordWrap: 'break-word',
        }}
      >
        {content}
      </div>
    </div>
  );
}
