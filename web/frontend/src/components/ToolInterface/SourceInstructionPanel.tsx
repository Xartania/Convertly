import { KeyboardEvent } from "react";
import { FileText, LayoutTemplate } from "lucide-react";
import { SourceFileImport } from "./SourceFileImport";
import type { ToolProject } from "./types";

const TEMPLATES = [
  "Summarize into bullet points",
  "Rewrite in a professional tone",
  "Extract names, dates, and action items",
  "Format this as valid JSON",
];

interface SourceInstructionPanelProps {
  instruction: string;
  source: string;
  onInstructionKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onUpdateField: <Field extends keyof ToolProject>(
    field: Field,
    value: ToolProject[Field]
  ) => void;
}

export function SourceInstructionPanel({
  instruction,
  source,
  onInstructionKeyDown,
  onUpdateField,
}: SourceInstructionPanelProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-black/10 bg-white px-4 py-3">
          <FileText size={16} className="text-purple-600" />
          <span className="text-sm font-bold text-black">Source Content</span>
        </div>
        <SourceFileImport
          hasSource={source.length > 0}
          onImport={(content) => onUpdateField("source", content)}
        />
        <textarea
          value={source}
          onChange={(event) => onUpdateField("source", event.target.value)}
          placeholder="Paste or type your raw data here..."
          className="w-full flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed text-black outline-none placeholder:text-black/30"
        />
        <div className="border-t border-black/10 bg-slate-50 px-4 py-2 text-right text-xs text-black/35">
          {source.length} characters
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
                onUpdateField("instruction", event.target.value);
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
          value={instruction}
          onChange={(event) => onUpdateField("instruction", event.target.value)}
          onKeyDown={onInstructionKeyDown}
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
  );
}
