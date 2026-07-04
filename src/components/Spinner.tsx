export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`mx-auto my-6 h-[22px] w-[22px] animate-spin rounded-full border-[3px] border-primary-light border-t-primary ${className}`}
    />
  );
}
