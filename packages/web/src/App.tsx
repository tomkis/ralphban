import { ChatBubble, ChatInput, ChatContainer } from './components';
import { useChatMessages } from './hooks/useChatMessages';
import { trpc } from './trpc';

export default function App() {
  const { messages, sendMessage, isLoading } = useChatMessages();
  const { data: tasks } = trpc.kanban.getTasks.useQuery();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
        Welcome to RalphBan ({tasks?.length ?? 0} tasks)
      </div>
      <ChatContainer>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
      </ChatContainer>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
