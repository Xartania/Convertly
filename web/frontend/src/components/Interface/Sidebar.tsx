import { Folder, HelpCircle, LayoutGrid, LayoutTemplate, LogOut, Settings, Star, X } from "lucide-react";
import type { UserResponse } from "../../types/api";
import { NavItem } from "./NavItem";

interface SidebarProps {
  displayName: string;
  initials: string;
  isOpen: boolean;
  projectCount: number;
  user: UserResponse;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  displayName,
  initials,
  isOpen,
  projectCount,
  user,
  onClose,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-black/10 bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
        <div className="flex items-center gap-2">
          <img src="/transfer.png" alt="Convertly logo" className="h-7 w-7 object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-black">
            Convert<span className="text-purple-600">ly</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-black/40 hover:bg-purple-600 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
        <NavItem icon={<Folder size={18} />} label="All Projects" badge={projectCount} />
        <NavItem icon={<Star size={18} />} label="Favorites" />
        <NavItem icon={<LayoutTemplate size={18} />} label="Templates" />

        <div className="pb-2 pt-8">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-black/35">
            Configuration
          </p>
        </div>
        <NavItem icon={<Settings size={18} />} label="Settings" />
        <NavItem icon={<HelpCircle size={18} />} label="Documentation" />
      </nav>

      <div className="border-t border-black/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-purple-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-black">
              {displayName}
            </span>
            <span className="block truncate text-xs text-black/50">
              {user.email}
            </span>
          </span>
          <LogOut
            size={16}
            className="text-purple-600 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>
    </aside>
  );
}
