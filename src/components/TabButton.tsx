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
        px-4 py-2 font-mono text-sm tracking-wide transition-all
        border-b-2 whitespace-nowrap
        ${
          active
            ? "text-green-400 border-green-400 bg-green-950/30"
            : "text-green-600 border-transparent hover:text-green-500 hover:border-green-700"
        }
      `}
    >
      {title.toUpperCase()}
    </button>
  );
}
