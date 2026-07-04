import { Check, Copy, Download, Play } from "lucide-react";

interface ResultPanelProps {
  copied: boolean;
  currentOutput: string;
  isProcessing: boolean;
  outputFormat: string;
  onCopy: () => void;
  onDownload: () => void;
  onUpdateOutput: (value: string) => void;
}

export function ResultPanel({
  copied,
  currentOutput,
  isProcessing,
  outputFormat,
  onCopy,
  onDownload,
  onUpdateOutput,
}: ResultPanelProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
        <span className="text-sm font-bold text-black">Result</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!currentOutput || isProcessing}
            className="rounded p-1.5 text-black/50 transition-colors hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!currentOutput || isProcessing}
            className="rounded p-1.5 text-black/50 transition-colors hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
            title="Download file"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            <p className="text-sm font-bold text-purple-600">Processing with AI...</p>
          </div>
        )}

        {!currentOutput && !isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-black/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
              <Play size={24} className="text-purple-300" />
            </div>
            <p className="text-sm font-medium text-black/60">No result yet</p>
            <p className="mt-1 text-xs">
              Add your source text, write an instruction, and click Run Tool.
            </p>
          </div>
        ) : (
          <textarea
            value={currentOutput}
            onChange={(event) => onUpdateOutput(event.target.value)}
            className="h-full w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-black outline-none"
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-black/10 bg-slate-50 px-4 py-2 text-xs text-black/40">
        <span className="font-semibold uppercase tracking-wider">
          {outputFormat}
        </span>
        <span>{currentOutput.length} characters</span>
      </div>
    </div>
  );
}
