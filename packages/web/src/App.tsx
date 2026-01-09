import type { Task } from '@ralphban/api';
import { trpc } from './trpc';

function TaskCard({ task }: { task: Task }) {
  return (
    <div
      style={{
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <div style={{ fontWeight: 500 }}>{task.title}</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{task.id}</div>
    </div>
  );
}

function Column({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: '280px',
        maxWidth: '400px',
        backgroundColor: '#f4f5f7',
        borderRadius: '8px',
        padding: '12px',
        marginRight: '16px',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#5e6c84',
          textTransform: 'uppercase',
        }}
      >
        {title} ({tasks.length})
      </h3>
      <div>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function StartRalphButton({
  hasReadyTasks,
  isRalphRunning,
  onStart,
}: {
  hasReadyTasks: boolean;
  isRalphRunning: boolean;
  onStart: () => void;
}) {
  const isDisabled = !hasReadyTasks || isRalphRunning;
  const buttonText = isRalphRunning ? 'Ralph Running...' : 'Start Ralph';

  return (
    <button
      onClick={onStart}
      disabled={isDisabled}
      style={{
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        color: isDisabled ? '#a5adba' : '#fff',
        backgroundColor: isDisabled ? '#dfe1e6' : '#5aac44',
        border: 'none',
        borderRadius: '4px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        marginLeft: 'auto',
      }}
    >
      {buttonText}
    </button>
  );
}

export default function App() {
  const { data: tasks = [] } = trpc.kanban.getTasks.useQuery(undefined, {
    refetchInterval: 3000,
  });
  const { data: ralphStatus } = trpc.ralph.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const startRalph = trpc.ralph.start.useMutation();

  const todoTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const hasReadyTasks = todoTasks.length > 0;
  const isRalphRunning = ralphStatus?.isRunning ?? false;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0079bf',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            color: '#fff',
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Kanban Board
        </h1>
        <StartRalphButton
          hasReadyTasks={hasReadyTasks}
          isRalphRunning={isRalphRunning}
          onStart={() => startRalph.mutate()}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Column title="Todo" tasks={todoTasks} />
        <Column title="Done" tasks={doneTasks} />
      </div>
    </div>
  );
}
