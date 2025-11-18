interface TabButtonProps {
  title: string;
  active: boolean;
  onClick: () => void;
}

export function TabButton({ title, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1 font-mono text-xl tracking-wide transition-all
        border-b-2 whitespace-nowrap
        ${
          active
            ? "text-(--text-green) border-(--menu-green) bg-(--menu-green)/30"
            : "text-(--text-green)/60 border-transparent hover:text-(--text-green)/80 hover:border-(--menu-green)/70"
        }
      `}
    >
      {title.toUpperCase()}
    </button>
  );
}
