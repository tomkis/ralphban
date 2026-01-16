import type { TaskDetail } from '@ralphban/api';
import { Modal, ModalButton } from './Modal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetail | null;
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#5e6c84',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#172b4d',
  marginBottom: '16px',
};

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  if (!task) return null;

  const statusLabel = task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Todo';
  const createdAt = new Date(task.created_at).toLocaleString();
  const updatedAt = new Date(task.updated_at).toLocaleString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      footer={<ModalButton onClick={onClose}>Close</ModalButton>}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={labelStyle}>ID</div>
        <div style={valueStyle}>{task.id}</div>

        <div style={labelStyle}>Category</div>
        <div style={valueStyle}>{task.category}</div>

        <div style={labelStyle}>Status</div>
        <div style={valueStyle}>{statusLabel}</div>

        <div style={labelStyle}>Description</div>
        <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{task.description || '—'}</div>

        <div style={labelStyle}>Steps</div>
        {task.steps.length > 0 ? (
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#172b4d' }}>
            {task.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: '4px', fontSize: '14px' }}>{step}</li>
            ))}
          </ul>
        ) : (
          <div style={valueStyle}>—</div>
        )}

        {task.progress && (
          <>
            <div style={labelStyle}>Progress</div>
            <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{task.progress}</div>
          </>
        )}

        <div style={labelStyle}>Created</div>
        <div style={valueStyle}>{createdAt}</div>

        <div style={labelStyle}>Updated</div>
        <div style={{ ...valueStyle, marginBottom: 0 }}>{updatedAt}</div>
      </div>
    </Modal>
  );
}
