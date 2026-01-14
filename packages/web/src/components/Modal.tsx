import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

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
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>{title}</h2>
        {children}
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

interface ModalButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export function ModalButton({
  onClick,
  disabled = false,
  variant = 'secondary',
  children,
}: ModalButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: isPrimary ? 600 : 400,
        color: isPrimary ? '#fff' : '#172b4d',
        backgroundColor: isPrimary ? (isDisabled ? '#dfe1e6' : '#5aac44') : '#f4f5f7',
        border: 'none',
        borderRadius: '4px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
