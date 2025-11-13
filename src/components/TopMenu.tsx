interface TopMenuProps {
  activeMenu: 'normal' | 'non-normal';
  onMenuChange: (menu: 'normal' | 'non-normal') => void;
  onReset: () => void;
}

export function TopMenu({ activeMenu, onMenuChange, onReset }: TopMenuProps) {
  return (
    <div className="flex gap-3 p-3 bg-[#213248]">
      <button
        onClick={() => onMenuChange('normal')}
        className={`flex-1 py-2 text-center font-mono text-sm font-bold tracking-widest ${
          activeMenu === 'normal'
            ? 'bg-[#6b7c94] text-white'
            : 'bg-[#4a5568] text-white'
        }`}
      >
        NORMAL MENU
      </button>
      <button
        onClick={onReset}
        className="flex-1 py-2 text-center font-mono text-sm font-bold tracking-widest bg-[#4a5568] text-white"
      >
        RESETS
      </button>
      <button
        onClick={() => onMenuChange('non-normal')}
        className={`flex-1 py-2 text-center font-mono text-sm font-bold tracking-widest ${
          activeMenu === 'non-normal'
            ? 'bg-[#6b7c94] text-white'
            : 'bg-[#4a5568] text-white'
        }`}
      >
        NON-NORMAL MENU
      </button>
    </div>
  );
}
