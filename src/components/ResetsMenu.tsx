import { useState, useEffect, useRef } from "react";
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";

interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
  onExitMenu: () => void;
}

type ResetButtonType = "normal" | "nonNormal" | "all" | null;

export function ResetsMenu({
  onResetNormal,
  onResetNonNormal,
  onResetAll,
  onExitMenu,
}: ResetsMenuProps) {
  const [clickedButton, setClickedButton] = useState<ResetButtonType>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // コンポーネントがアンマウントされる時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleReset = (type: ResetButtonType, callback: () => void) => {
    // 既存のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    callback();
    setClickedButton(type);
    timeoutRef.current = setTimeout(() => {
      setClickedButton(null);
      onExitMenu();
      timeoutRef.current = null;
    }, RESET_MENU_EXIT_DELAY_MS);
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
            className={`w-full text-left px-4 py-1 border-2 border-transparent hover:border-white font-mono text-2xl text-white ${
              clickedButton === "normal" ? "bg-(--menu-green)" : "bg-gray-700"
            }`}
          >
            RESET NORMAL
          </button>
          <button
            onClick={() => handleReset("nonNormal", onResetNonNormal)}
            className={`w-full text-left px-4 py-1 border-2 border-transparent hover:border-white font-mono text-2xl text-white ${
              clickedButton === "nonNormal"
                ? "bg-(--menu-green)"
                : "bg-gray-700"
            }`}
          >
            RESET NON-NORMAL
          </button>
          <button
            onClick={() => handleReset("all", onResetAll)}
            className={`w-full text-left px-4 py-1 border-2 border-transparent hover:border-white font-mono text-2xl text-white ${
              clickedButton === "all" ? "bg-(--menu-green)" : "bg-gray-700"
            }`}
          >
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
