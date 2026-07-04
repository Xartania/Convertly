import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Clock, History } from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectRun } from "./types";

interface WorkspaceSidebarProps {
  children?: ReactNode;
  isOpen: boolean;
  runs: ProjectRun[];
  onClose: () => void;
  onLoadHistoryItem: (run: ProjectRun) => void;
}

export function WorkspaceSidebar({
  children,
  isOpen,
  runs,
  onClose,
  onLoadHistoryItem,
}: WorkspaceSidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex h-full shrink-0 flex-col overflow-hidden border-r border-black/10 bg-white"
        >
          <div className="flex items-center gap-3 border-b border-black/10 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-black/50 transition-colors hover:bg-purple-600 hover:text-white"
              aria-label="Close workspace sidebar"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold tracking-tight text-black">Convertly Workspace</span>
          </div>

          <div className="border-b border-black/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/45">History</p>
              <History size={14} className="text-black/35" />
            </div>
            <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
              {runs.length === 0 ? (
                <p className="text-sm italic text-black/35">No runs yet.</p>
              ) : (
                runs.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => onLoadHistoryItem(run)}
                    className="group flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-purple-50"
                  >
                    <Clock size={14} className="text-purple-400 group-hover:text-purple-600" />
                    <span className="min-w-0 overflow-hidden">
                      <span className="block truncate text-sm font-medium text-black">
                        {run.instruction}
                      </span>
                      <span className="block text-[10px] text-black/50">
                        {new Date(run.createdAt).toLocaleTimeString()}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {children}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
