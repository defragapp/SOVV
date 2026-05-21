export function UpgradeButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl bg-white px-4 py-2 text-black font-medium">
      Upgrade
    </button>
  );
}
