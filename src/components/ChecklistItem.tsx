import { CheckIcon } from "./CheckIcon";
import { ChecklistItemStatus } from "@/types/checklist";
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";

interface ChecklistItemProps {
  item: string;
  value: string;
  status: ChecklistItemStatus;
  required?: boolean;
  isActive: boolean;
  onToggle: () => void;
}

export function ChecklistItem({
  item,
  value,
  status,
  required,
  isActive,
  onToggle,
}: ChecklistItemProps) {
  const isChecked = status === "checked" || status === "checked-overridden";
  const isOverridden = status === "overridden";
  const isCheckedOverridden = status === "checked-overridden";

  return (
    <div className="px-4">
      <div
        onClick={onToggle}
        className={`flex items-center py-3.5 px-3 cursor-pointer ${
          isActive
            ? "border-2 border-(--highlight-magenta)"
            : "border-2 border-transparent"
        }`}
      >
        {/* 自動チェック用の灰色背景（required=falseの場合のみ表示） */}
        {!required && <div className="w-6 h-6 bg-[#6b7c94] shrink-0 -mr-6" />}

        {/* チェックマーク */}
        <div
          className={`w-6 h-6 flex items-center justify-center shrink-0 bg-[#6b7c94] ${
            isOverridden || isCheckedOverridden
              ? "border-2 border-(--text-cyan)"
              : ""
          }`}
        >
          {isChecked && <CheckIcon />}
        </div>

        {/* テキスト */}
        <div
          className={`flex-1 font-mono text-[20px] tracking-wide flex items-center gap-2 overflow-hidden ml-2 ${
            isCheckedOverridden
              ? "text-(--text-cyan)"
              : isChecked
                ? "text-(--text-green)"
                : isOverridden
                  ? "text-(--text-cyan)"
                  : "text-white"
          }`}
        >
          <span className="shrink-0">{item}</span>
          <span className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
            {". ".repeat(DOTTED_SEPARATOR_REPEATS)}
          </span>
          <span className="shrink-0">{value}</span>
        </div>
      </div>
    </div>
  );
}
