import { MenuType } from "@/types/checklist";
import { CheckIcon } from "./CheckIcon";
import { useState } from "react";

interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
}

type ResetButtonType = "normal" | "nonNormal" | "all" | null;

export function ResetsMenu({
  onResetNormal,
  onResetNonNormal,
  onResetAll,
}: ResetsMenuProps) {
  const [clickedButton, setClickedButton] = useState<ResetButtonType>(null);

  const handleReset = (type: ResetButtonType, callback: () => void) => {
    callback();
    setClickedButton(type);
    setTimeout(() => {
      setClickedButton(null);
    }, 3000);
  };

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
            onClick={() => handleReset("normal", onResetNormal)}
            className={`w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 ${
              clickedButton === "normal" ? "text-(--text-green)" : "text-white"
            }`}
          >
            <div className="w-4 h-4 shrink-0">
              {clickedButton === "normal" && <CheckIcon />}
            </div>
            RESET NORMAL
          </button>
          <button
            onClick={() => handleReset("nonNormal", onResetNonNormal)}
            className={`w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 ${
              clickedButton === "nonNormal"
                ? "text-(--text-green)"
                : "text-white"
            }`}
          >
            <div className="w-4 h-4 shrink-0">
              {clickedButton === "nonNormal" && <CheckIcon />}
            </div>
            RESET NON-NORMAL
          </button>
          <button
            onClick={() => handleReset("all", onResetAll)}
            className={`w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 ${
              clickedButton === "all" ? "text-(--text-green)" : "text-white"
            }`}
          >
            <div className="w-4 h-4 shrink-0">
              {clickedButton === "all" && <CheckIcon />}
            </div>
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
