"use client";

interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}

export function DefaultView({
  onNormalClick,
  onNonNormalClick,
}: DefaultViewProps) {
  return (
    <div className="flex-1 bg-[#09090C] flex flex-col">
      <div className="flex-1"></div>
      <div className="flex justify-between gap-3 p-3">
        <button
          onClick={onNormalClick}
          className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white"
        >
          NORMAL
        </button>
        <button
          onClick={onNonNormalClick}
          className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-yellow-400 whitespace-pre-line"
        >
          {"NON-\nNORMAL"}
        </button>
      </div>
    </div>
  );
}
