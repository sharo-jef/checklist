interface ChecklistItemProps {
  item: string;
  value: string;
  checked: boolean;
  required?: boolean;
  isActive: boolean;
  onToggle: () => void;
}

/**
 * 項目名と値の間にドットを自動生成する
 */
function generateSeparator(item: string, value: string): string {
  const totalLength = 50; // 全体の文字数
  const currentLength = item.length + value.length;
  const dotsCount = Math.max(3, totalLength - currentLength);
  return '.'.repeat(dotsCount);
}

export function ChecklistItem({ item, value, checked, required, isActive, onToggle }: ChecklistItemProps) {
  const separator = generateSeparator(item, value);
  
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 py-3 px-4 cursor-pointer ${
        isActive ? 'bg-[#ff00ff]' : ''
      }`}
    >
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {!required && (
          <div className="w-full h-full bg-gray-600" />
        )}
      </div>
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {checked ? (
          <span className="text-[#00ff00] text-xl font-bold">✓</span>
        ) : (
          <span className="text-white text-xl font-bold">✓</span>
        )}
      </div>
      <div className="flex-1 font-mono text-base tracking-wide">
        <span className={checked ? 'text-[#00ff00]' : 'text-white'}>
          {item}
          {separator}
          {value}
        </span>
      </div>
    </div>
  );
}
