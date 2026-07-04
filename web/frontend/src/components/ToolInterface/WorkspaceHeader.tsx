import { ArrowLeft, Play, Square, Star } from "lucide-react";

interface WorkspaceHeaderProps {
  canRun: boolean;
  isProcessing: boolean;
  isSidebarOpen: boolean;
  isFavorite: boolean;
  name: string;
  saveStatus: string;
  onBack?: () => void;
  onCancelRun: () => void;
  onNameChange: (value: string) => void;
  onOpenSidebar: () => void;
  onRun: () => void;
  onToggleFavorite: () => void;
}

export function WorkspaceHeader({
  canRun,
  isProcessing,
  isSidebarOpen,
  isFavorite,
  name,
  saveStatus,
  onBack,
  onCancelRun,
  onNameChange,
  onOpenSidebar,
  onRun,
  onToggleFavorite,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white px-6">
      <div className="flex min-w-0 items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-purple-600 hover:text-white"
          >
            <ArrowLeft size={15} />
            Projects
          </button>
        )}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-purple-600 hover:text-white"
          >
            History
          </button>
        )}
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="min-w-0 rounded bg-transparent px-2 text-lg font-bold text-black outline-none hover:bg-black/5 focus:bg-white focus:ring-2 focus:ring-purple-600/15"
        />
        <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              saveStatus === "Saved"
                ? "bg-purple-600"
                : saveStatus === "Save failed"
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
          />
          {saveStatus}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleFavorite}
          className="rounded-lg p-2 text-black/35 transition-colors hover:bg-purple-50 hover:text-purple-600"
          aria-label="Toggle favorite"
        >
          <Star
            fill={isFavorite ? "currentColor" : "none"}
            size={18}
            className={isFavorite ? "text-purple-600" : ""}
          />
        </button>
        <button
          type="button"
          onClick={isProcessing ? onCancelRun : onRun}
          disabled={!canRun}
          className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-semibold text-white transition-all ${
            isProcessing
              ? "bg-rose-500 hover:bg-rose-600"
              : !canRun
                ? "cursor-not-allowed bg-black/25"
                : "bg-purple-600 hover:bg-black"
          }`}
        >
          {isProcessing ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isProcessing ? "Cancel" : "Run Tool"}
        </button>
      </div>
    </header>
  );
}
