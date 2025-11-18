import { MenuType } from "@/types/checklist";

interface TopMenuProps {
  activeMenu: MenuType | null;
  onMenuChange: (menu: MenuType) => void;
  onReset: () => void;
}

export function TopMenu({ activeMenu, onMenuChange, onReset }: TopMenuProps) {
  return (
    <div className="flex gap-3 p-3 bg-[#09090C]">
      <button
        onClick={() => onMenuChange(MenuType.NORMAL)}
        className={`flex-1 py-1 text-center font-mono text-xl font-bold tracking-wide leading-none ${
          activeMenu === MenuType.NORMAL
            ? "bg-[#6b7c94] text-white"
            : "bg-[#4a5568] text-white"
        }`}
      >
        NORMAL MENU
      </button>
      <button
        onClick={onReset}
        className="flex-1 py-1 text-center font-mono text-xl font-bold tracking-wide leading-none bg-[#4a5568] text-white"
      >
        RESET
      </button>
      <button
        onClick={() => onMenuChange(MenuType.NON_NORMAL)}
        className={`flex-1 py-1 text-center font-mono text-xl font-bold tracking-wide leading-none ${
          activeMenu === MenuType.NON_NORMAL
            ? "bg-[#6b7c94] text-white"
            : "bg-[#4a5568] text-white"
        }`}
      >
        NON-NORMAL MENU
      </button>
    </div>
  );
}
