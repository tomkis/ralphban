import { useState } from 'react';
import type { Task } from '@ralphban/api';
import { trpc } from './trpc';

function WorkingDirectoryModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workingDirectory: string) => void;
}) {
  const [workingDirectory, setWorkingDirectory] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (workingDirectory.trim()) {
      onSubmit(workingDirectory.trim());
      setWorkingDirectory('');
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Start Ralph</h2>
        <label
          style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#5e6c84' }}
        >
          Working Directory
        </label>
        <input
          type="text"
          value={workingDirectory}
          onChange={(e) => setWorkingDirectory(e.target.value)}
          placeholder="/path/to/project"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #dfe1e6',
            borderRadius: '4px',
            boxSizing: 'border-box',
            marginBottom: '16px',
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onClose();
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#f4f5f7',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!workingDirectory.trim()}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: workingDirectory.trim() ? '#5aac44' : '#dfe1e6',
              border: 'none',
              borderRadius: '4px',
              cursor: workingDirectory.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleStartRalph = (workingDirectory: string) => {
    startRalph.mutate({ workingDirectory });
  };

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
          onStart={() => setIsModalOpen(true)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Column title="Todo" tasks={todoTasks} />
        <Column title="Done" tasks={doneTasks} />
      </div>
      <WorkingDirectoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStartRalph}
      />
    </div>
  );
}
