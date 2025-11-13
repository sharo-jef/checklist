import { CheckIcon } from './CheckIcon';

interface ChecklistItemProps {
  item: string;
  value: string;
  checked: boolean;
  required?: boolean;
  isActive: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ item, value, checked, required, isActive, onToggle }: ChecklistItemProps) {
  return (
    <div className="px-4">
      <div
        onClick={onToggle}
        className={`flex items-center py-3.5 px-3 cursor-pointer ${
          isActive ? 'border-2 border-[#ff00ff]' : 'border-2 border-transparent'
        }`}
      >
        {/* 自動チェック用の灰色背景（required=falseの場合のみ表示） */}
        {!required && (
          <div className="w-6 h-6 bg-[#6b7c94] shrink-0 -mr-6" />
        )}

        {/* チェックマーク */}
        <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-[#6b7c94]">
          {checked && <CheckIcon />}
        </div>

        {/* テキスト */}
        <div className={`flex-1 font-mono text-[17px] tracking-wide flex items-center gap-2 overflow-hidden ml-2 ${checked ? 'text-[#1FEC3E]' : 'text-white'}`}>
          <span className="shrink-0 font-bold">{item}</span>
          <span className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
            {'.'.repeat(400)}
          </span>
          <span className="shrink-0 font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
}
