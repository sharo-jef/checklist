import { MenuType } from "@/types/checklist";

interface TopMenuProps {
  activeMenu: MenuType | null;
  onMenuChange: (menu: MenuType) => void;
}

export function TopMenu({ activeMenu, onMenuChange }: TopMenuProps) {
  return (
    <div className="flex gap-3 p-3 bg-[#09090C]">
      <button
        onClick={() => onMenuChange(MenuType.NORMAL)}
        className={`flex-1 py-1 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white ${
          activeMenu === MenuType.NORMAL
            ? "bg-green-600 text-white"
            : "bg-[#4a5568] text-white"
        }`}
      >
        NORMAL MENU
      </button>
      <button
        onClick={() => onMenuChange(MenuType.RESETS)}
        className={`flex-1 py-1 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white ${
          activeMenu === MenuType.RESETS
            ? "bg-green-600 text-white"
            : "bg-[#4a5568] text-white"
        }`}
      >
        RESETS
      </button>
      <button
        onClick={() => onMenuChange(MenuType.NON_NORMAL)}
        className={`flex-1 py-1 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white ${
          activeMenu === MenuType.NON_NORMAL
            ? "bg-green-600 text-white"
            : "bg-[#4a5568] text-white"
        }`}
      >
        NON-NORMAL MENU
      </button>
    </div>
  );
}
