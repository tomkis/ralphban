import { useState } from 'react';
import type { Task } from '@ralphban/api';
import { trpc } from './trpc';
import { Modal, ModalButton } from './components/Modal';
import { CreateTaskModal, CreateTaskFormData } from './components/CreateTaskModal';

function WorkingDirectoryModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Ralph"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleSubmit} variant="primary">
            Start
          </ModalButton>
        </>
      }
    >
      <p style={{ margin: 0, color: '#172b4d' }}>
        Ralph will start working on tasks in the current working directory.
      </p>
    </Modal>
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

function Column({
  title,
  tasks,
  onAddClick,
}: {
  title: string;
  tasks: Task[];
  onAddClick?: () => void;
}) {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#5e6c84',
            textTransform: 'uppercase',
          }}
        >
          {title} ({tasks.length})
        </h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            style={{
              padding: '4px 8px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#5e6c84',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        )}
      </div>
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
      }}
    >
      {buttonText}
    </button>
  );
}

export default function App() {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: tasks = [] } = trpc.kanban.getTasks.useQuery(undefined, {
    refetchInterval: 3000,
  });
  const { data: ralphStatus } = trpc.ralph.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const startRalph = trpc.ralph.start.useMutation();
  const createTask = trpc.kanban.createTask.useMutation({
    onSuccess: () => {
      utils.kanban.getTasks.invalidate();
    },
  });
  const deleteAllTasks = trpc.kanban.deleteAllTasks.useMutation({
    onSuccess: () => {
      utils.kanban.getTasks.invalidate();
    },
  });

  const todoTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const hasReadyTasks = todoTasks.length > 0;
  const isRalphRunning = ralphStatus?.isRunning ?? false;

  const handleStartRalph = () => {
    startRalph.mutate();
  };

  const handleCreateTask = (data: CreateTaskFormData) => {
    createTask.mutate(data);
  };

  const handleDeleteAllTasks = () => {
    deleteAllTasks.mutate();
    setIsDeleteAllModalOpen(false);
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
        <button
          onClick={() => setIsDeleteAllModalOpen(true)}
          disabled={tasks.length === 0}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: tasks.length === 0 ? '#a5adba' : '#fff',
            backgroundColor: tasks.length === 0 ? '#dfe1e6' : '#eb5a46',
            border: 'none',
            borderRadius: '4px',
            cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
            marginLeft: 'auto',
            marginRight: '8px',
          }}
        >
          Clear All
        </button>
        <StartRalphButton
          hasReadyTasks={hasReadyTasks}
          isRalphRunning={isRalphRunning}
          onStart={() => setIsStartModalOpen(true)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Column title="Todo" tasks={todoTasks} onAddClick={() => setIsCreateModalOpen(true)} />
        <Column title="Done" tasks={doneTasks} />
      </div>
      <WorkingDirectoryModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSubmit={handleStartRalph}
      />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      <Modal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Clear All Tasks"
        footer={
          <>
            <ModalButton onClick={() => setIsDeleteAllModalOpen(false)}>Cancel</ModalButton>
            <ModalButton onClick={handleDeleteAllTasks} variant="primary">
              Clear All
            </ModalButton>
          </>
        }
      >
        <p style={{ margin: 0, color: '#172b4d' }}>
          Are you sure you want to delete all tasks? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
