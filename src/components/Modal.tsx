import type { ReactNode } from 'react';
import { Icon } from '../lib/icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-[560px]' }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-md bg-white p-7`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="mb-0">{title}</h3>
          <button className="text-text-muted hover:text-text" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
