import { useRef, useState } from 'react';
import { Icon } from '../lib/icons';
import { Button } from './Button';

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  disabledHint?: string;
  accept?: string;
  hint?: string;
}

export function Dropzone({
  onFile,
  disabled,
  disabledHint = 'Grave o produto primeiro para poder enviar uma imagem.',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  hint = 'Aceita imagens (arraste e largue ou clique para escolher)',
}: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-md border-[1.5px] border-dashed p-7 text-center transition-colors ${
        disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
      } ${dragOver ? 'border-text bg-bg-alt' : 'border-border'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <div className="mb-2 flex justify-center text-text-muted">
        <Icon name="image" size={26} />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        Carregar novo
      </Button>
      <p className="mt-2 mb-0 text-[0.8rem] text-text-muted">{disabled ? disabledHint : hint}</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
