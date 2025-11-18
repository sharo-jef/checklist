import { MenuType } from "@/types/checklist";

interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
}

export function ResetsMenu({
  onResetNormal,
  onResetNonNormal,
  onResetAll,
}: ResetsMenuProps) {
  return (
    <div className="flex-1 bg-[#09090C] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <button
            onClick={onResetNormal}
            className="w-full text-left px-4 py-1 bg-gray-700 hover:bg-gray-600 font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET NORMAL
          </button>
          <button
            onClick={onResetNonNormal}
            className="w-full text-left px-4 py-1 bg-gray-700 hover:bg-gray-600 font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET NON-NORMAL
          </button>
          <button
            onClick={onResetAll}
            className="w-full text-left px-4 py-1 bg-gray-700 hover:bg-gray-600 font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
