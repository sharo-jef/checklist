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
  const totalLength = 45;
  const currentLength = item.length + value.length;
  const dotsCount = Math.max(3, totalLength - currentLength);
  return '.'.repeat(dotsCount);
}

export function ChecklistItem({ item, value, checked, required, isActive, onToggle }: ChecklistItemProps) {
  const separator = generateSeparator(item, value);
  
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-2 py-2 px-3 cursor-pointer ${
        isActive ? 'border-2 border-[#ff00ff]' : 'border-2 border-transparent'
      }`}
    >
      {/* 自動チェック用の灰色背景（required=falseの場合のみ表示） */}
      {!required && (
        <div className="w-5 h-5 bg-[#6b7c94] shrink-0" />
      )}
      {required && (
        <div className="w-5 h-5 shrink-0" />
      )}
      
      {/* チェックマーク */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <span className={`text-lg font-bold ${checked ? 'text-[#00ff00]' : 'text-white'}`}>
          ✓
        </span>
      </div>
      
      {/* テキスト */}
      <div className="flex-1 font-mono text-sm tracking-wide">
        <span className={checked ? 'text-[#00ff00]' : 'text-white'}>
          {item}{separator}{value}
        </span>
      </div>
    </div>
  );
}
