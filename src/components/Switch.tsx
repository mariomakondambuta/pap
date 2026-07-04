interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5">
      <input
        id={id}
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-dark' : 'bg-[#d6d6d6]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
      <span className="text-[0.85rem] font-medium">{label}</span>
    </label>
  );
}
