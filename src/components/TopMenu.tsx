interface TopMenuProps {
  activeMenu: 'normal' | 'resets' | 'non-normal';
  onMenuChange: (menu: 'normal' | 'resets' | 'non-normal') => void;
}

export function TopMenu({ activeMenu, onMenuChange }: TopMenuProps) {
  return (
    <div className="flex border-b-2 border-gray-600">
      <button
        onClick={() => onMenuChange('normal')}
        className={`flex-1 py-3 text-center font-bold text-sm tracking-wide ${
          activeMenu === 'normal'
            ? 'bg-gray-600 text-black'
            : 'bg-gray-700 text-white'
        }`}
      >
        NORMAL MENU
      </button>
      <button
        onClick={() => onMenuChange('resets')}
        className={`flex-1 py-3 text-center font-bold text-sm tracking-wide border-x-2 border-gray-600 ${
          activeMenu === 'resets'
            ? 'bg-gray-600 text-black'
            : 'bg-gray-700 text-white'
        }`}
      >
        RESETS
      </button>
      <button
        onClick={() => onMenuChange('non-normal')}
        className={`flex-1 py-3 text-center font-bold text-sm tracking-wide ${
          activeMenu === 'non-normal'
            ? 'bg-gray-600 text-black'
            : 'bg-gray-700 text-white'
        }`}
      >
        NON-NORMAL MENU
      </button>
    </div>
  );
}
