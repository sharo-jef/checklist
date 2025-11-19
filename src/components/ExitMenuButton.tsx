interface ExitMenuButtonProps {
  onClick: () => void;
}

export function ExitMenuButton({ onClick }: ExitMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Exit Menu"
      className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
    >
      {"EXIT\nMENU"}
    </button>
  );
}
