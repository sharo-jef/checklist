interface ChecklistItemProps {
  item: string;
  value: string;
  checked: boolean;
  required?: boolean;
  onToggle: () => void;
}

/**
 * 項目名と値の間にドットを自動生成する
 */
function generateSeparator(item: string, value: string): string {
  const totalLength = 40; // 全体の文字数
  const currentLength = item.length + value.length;
  const dotsCount = Math.max(3, totalLength - currentLength);
  return '.'.repeat(dotsCount);
}

export function ChecklistItem({ item, value, checked, required, onToggle }: ChecklistItemProps) {
  const separator = generateSeparator(item, value);
  
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
          {item}
          <span className="text-green-700">{separator}</span>
          {value}
        </span>
        {required && (
          <span className="ml-2 text-green-600 text-xs">*</span>
        )}
      </div>
    </div>
  );
}
