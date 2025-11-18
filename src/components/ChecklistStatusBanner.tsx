interface ChecklistStatusBannerProps {
  isComplete: boolean;
  isOverridden: boolean;
}

export function ChecklistStatusBanner({
  isComplete,
  isOverridden,
}: ChecklistStatusBannerProps) {
  if (!isComplete && !isOverridden) return null;

  return (
    <div className="px-3 pb-3 bg-[#09090C] flex justify-center">
      <div
        className={`font-mono text-white text-center py-0 pb-1 px-3 text-xl tracking-wider ${
          isOverridden ? "bg-[#1e40af]" : "bg-(--menu-green)"
        }`}
        style={{
          borderRadius: "9999px",
        }}
      >
        {isOverridden ? "CHECKLIST OVERRIDDEN" : "CHECKLIST COMPLETE"}
      </div>
    </div>
  );
}
