import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ArrowLeft,
  ChevronLeft,
  Clock,
  Copy,
  Download,
  FileText,
  History,
  LayoutTemplate,
  Play,
  Square,
  Star,
} from "lucide-react";
import { KeyboardEvent, useState } from "react";
import type { ApiAuth } from "../../types/api";
import { useWorkspace } from "./useWorkspace";
import type { OutputFormat, ToolProject } from "./types";

const DEMO_PROJECT: ToolProject = {
  id: "proj_1",
  name: "Customer Feedback Cleaner",
  status: "ready",
  source: "delivery was late but support was very nice!!! product works good, packaging damaged.",
  instruction:
    "Correct the grammar, preserve the original meaning, and return a concise professional version.",
  currentOutput: "",
  options: {
    language: "English",
    tone: "Professional",
    length: "short",
    outputFormat: "text",
    preserveFormatting: true,
  },
  runs: [],
  updatedAt: new Date().toISOString(),
  isFavorite: true,
};

const TEMPLATES = [
  "Summarize into bullet points",
  "Rewrite in a professional tone",
  "Extract names, dates, and action items",
  "Format this as valid JSON",
];

interface ToolInterfaceProps {
  initialProject?: ToolProject;
  auth?: ApiAuth;
  onBack?: () => void;
}

export function ToolInterface({ initialProject = DEMO_PROJECT, auth, onBack }: ToolInterfaceProps) {
  const {
    project,
    updateField,
    updateOption,
    isProcessing,
    saveStatus,
    handleRun,
    cancelRun,
    loadHistoryItem,
  } = useWorkspace(initialProject, auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const canRun = Boolean(project.source && project.instruction && auth);

  const handleCopy = () => {
    if (!project.currentOutput) {
      return;
    }

    navigator.clipboard.writeText(project.currentOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!project.currentOutput) {
      return;
    }

    const extension =
      project.options.outputFormat === "json"
        ? "json"
        : project.options.outputFormat === "csv"
          ? "csv"
          : "txt";
    const blob = new Blob([project.currentOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${project.name.replace(/\s+/g, "_")}_${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInstructionKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-black">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex h-full shrink-0 flex-col overflow-hidden border-r border-black/10 bg-white"
          >
            <div className="flex items-center gap-3 border-b border-black/10 p-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
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
                {project.runs.length === 0 ? (
                  <p className="text-sm italic text-black/35">No runs yet.</p>
                ) : (
                  project.runs.map((run) => (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => loadHistoryItem(run)}
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

            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-black/45">
                Settings
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <label htmlFor="tool-output-format" className="mb-1 block font-medium text-black">
                    Output Format
                  </label>
                  <select
                    id="tool-output-format"
                    value={project.options.outputFormat}
                    onChange={(event) =>
                      updateOption("outputFormat", event.target.value as OutputFormat)
                    }
                    className="w-full rounded-lg border border-black/10 bg-white p-2 text-black outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
                  >
                    <option value="text">Plain Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="bullets">Bullets</option>
                    <option value="table">Table</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tool-tone" className="mb-1 block font-medium text-black">
                    Tone
                  </label>
                  <select
                    id="tool-tone"
                    value={project.options.tone}
                    onChange={(event) => updateOption("tone", event.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white p-2 text-black outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Academic</option>
                    <option>Concise</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col bg-slate-50">
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
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-purple-600 hover:text-white"
              >
                History
              </button>
            )}
            <input
              type="text"
              value={project.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="min-w-0 rounded bg-transparent px-2 text-lg font-bold text-black outline-none hover:bg-black/5 focus:bg-white focus:ring-2 focus:ring-purple-600/15"
            />
            <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  saveStatus === "Saved" ? "bg-purple-600" : "bg-amber-500"
                }`}
              />
              {saveStatus}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-black/35 transition-colors hover:bg-purple-50 hover:text-purple-600"
              aria-label="Toggle favorite"
            >
              <Star
                fill={project.isFavorite ? "currentColor" : "none"}
                size={18}
                className={project.isFavorite ? "text-purple-600" : ""}
              />
            </button>
            <button
              type="button"
              onClick={isProcessing ? cancelRun : handleRun}
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

        <div className="flex-1 overflow-hidden p-6">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex h-full flex-col gap-6">
              <div className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-black/10 bg-white px-4 py-3">
                  <FileText size={16} className="text-purple-600" />
                  <span className="text-sm font-bold text-black">Source Content</span>
                </div>
                <textarea
                  value={project.source}
                  onChange={(event) => updateField("source", event.target.value)}
                  placeholder="Paste or type your raw data here..."
                  className="w-full flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed text-black outline-none placeholder:text-black/30"
                />
                <div className="border-t border-black/10 bg-slate-50 px-4 py-2 text-right text-xs text-black/35">
                  {project.source.length} characters
                </div>
              </div>

              <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate size={16} className="text-purple-600" />
                    <span className="text-sm font-bold text-black">Instruction</span>
                  </div>
                  <select
                    onChange={(event) => {
                      if (event.target.value) {
                        updateField("instruction", event.target.value);
                      }
                    }}
                    className="cursor-pointer rounded border border-black/10 bg-white p-1 text-xs text-black/60 outline-none hover:border-purple-300"
                    aria-label="Use an instruction template"
                  >
                    <option value="">Use a template...</option>
                    {TEMPLATES.map((template) => (
                      <option key={template} value={template}>
                        {template}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={project.instruction}
                  onChange={(event) => updateField("instruction", event.target.value)}
                  onKeyDown={handleInstructionKeyDown}
                  placeholder="What should the tool do? (e.g., Extract all email addresses into a JSON list)"
                  className="h-28 w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-black outline-none placeholder:text-black/30"
                />
                <div className="flex justify-between border-t border-black/10 bg-slate-50 px-4 py-2 text-xs text-black/40">
                  <span>
                    Press{" "}
                    <kbd className="rounded bg-black/5 px-1 font-mono text-black/60">
                      Cmd/Ctrl + Enter
                    </kbd>{" "}
                    to run
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
                <span className="text-sm font-bold text-black">Result</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!project.currentOutput || isProcessing}
                    className="rounded p-1.5 text-black/50 transition-colors hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!project.currentOutput || isProcessing}
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

                {!project.currentOutput && !isProcessing ? (
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
                    value={project.currentOutput}
                    onChange={(event) => updateField("currentOutput", event.target.value)}
                    className="h-full w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-black outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-between border-t border-black/10 bg-slate-50 px-4 py-2 text-xs text-black/40">
                <span className="font-semibold uppercase tracking-wider">
                  {project.options.outputFormat}
                </span>
                <span>{project.currentOutput.length} characters</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
