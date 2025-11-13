interface TopMenuProps {
  activeMenu: 'normal' | 'resets' | 'non-normal';
  onMenuChange: (menu: 'normal' | 'resets' | 'non-normal') => void;
}

export function TopMenu({ activeMenu, onMenuChange }: TopMenuProps) {
  return (
    <div className="flex bg-[#2a3340]">
      <button
        onClick={() => onMenuChange('normal')}
        className={`flex-1 py-2 text-center font-mono text-xs tracking-widest ${
          activeMenu === 'normal'
            ? 'bg-[#6b7c94] text-white'
            : 'bg-[#4a5568] text-white'
        }`}
      >
        NORMAL MENU
      </button>
      <button
        onClick={() => onMenuChange('resets')}
        className={`flex-1 py-2 text-center font-mono text-xs tracking-widest ${
          activeMenu === 'resets'
            ? 'bg-[#6b7c94] text-white'
            : 'bg-[#4a5568] text-white'
        }`}
      >
        RESETS
      </button>
      <button
        onClick={() => onMenuChange('non-normal')}
        className={`flex-1 py-2 text-center font-mono text-xs tracking-widest ${
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
