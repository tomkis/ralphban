import { useState } from 'react';
import { Modal, ModalButton } from './Modal';

export interface CreateTaskFormData {
  category: 'feat' | 'bug' | 'chore';
  title: string;
  description: string;
  steps: string[];
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskFormData) => void;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [category, setCategory] = useState<'feat' | 'bug' | 'chore'>('feat');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);

  const resetForm = () => {
    setCategory('feat');
    setTitle('');
    setDescription('');
    setSteps(['']);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        steps: steps.filter((s) => s.trim()),
      });
      resetForm();
      onClose();
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #dfe1e6',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    color: '#5e6c84',
    fontWeight: 500 as const,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Task"
      footer={
        <>
          <ModalButton onClick={handleClose}>Cancel</ModalButton>
          <ModalButton onClick={handleSubmit} disabled={!title.trim()} variant="primary">
            Create
          </ModalButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'feat' | 'bug' | 'chore')}
            style={inputStyle}
          >
            <option value="feat">Feature</option>
            <option value="bug">Bug</option>
            <option value="chore">Chore</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Steps</label>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f4f5f7',
                  color: steps.length === 1 ? '#a5adba' : '#172b4d',
                  cursor: steps.length === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addStep}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#f4f5f7',
              color: '#172b4d',
              cursor: 'pointer',
            }}
          >
            + Add Step
          </button>
        </div>
      </div>
    </Modal>
  );
}
