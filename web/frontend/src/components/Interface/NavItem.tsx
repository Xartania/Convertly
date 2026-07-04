import type { ReactNode } from "react";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

export function NavItem({ icon, label, active, badge }: NavItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-purple-600 text-white"
          : "text-black/60 hover:bg-purple-600 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </span>
      {badge !== undefined && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-white/20 text-white" : "bg-black/5 text-black/45"
        }`}>
          {badge}
        </span>
      )}
    </a>
  );
}
