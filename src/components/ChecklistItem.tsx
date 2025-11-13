interface ChecklistItemProps {
  text: string;
  checked: boolean;
  required?: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ text, checked, required, onToggle }: ChecklistItemProps) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 py-2 px-4 cursor-pointer hover:bg-green-950/30 transition-colors border-l-2 border-transparent hover:border-green-500"
    >
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {checked ? (
          <span className="text-green-400 text-xl font-bold">✓</span>
        ) : (
          <span className="text-green-800 text-xl">□</span>
        )}
      </div>
      <div className="flex-1 font-mono text-sm tracking-wide">
        <span className={checked ? 'text-green-400' : 'text-green-500'}>
          {text}
        </span>
        {required && (
          <span className="ml-2 text-green-600 text-xs">*</span>
        )}
      </div>
    </div>
  );
}
