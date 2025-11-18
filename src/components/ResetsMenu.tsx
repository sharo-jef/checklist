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
      <div className="p-3 pt-0">
        <div className="py-2">
          <h1 className="font-mono text-[20px] text-white tracking-wide text-center">
            RESETS
          </h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-2">
          <button
            onClick={onResetNormal}
            className="w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET NORMAL
          </button>
          <button
            onClick={onResetNonNormal}
            className="w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET NON-NORMAL
          </button>
          <button
            onClick={onResetAll}
            className="w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 text-white"
          >
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
