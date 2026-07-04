import type { OutputFormat, ToolOptions } from "./types";

interface WorkspaceSettingsProps {
  options: ToolOptions;
  onUpdateOption: <Field extends keyof ToolOptions>(
    field: Field,
    value: ToolOptions[Field]
  ) => void;
}

export function WorkspaceSettings({ options, onUpdateOption }: WorkspaceSettingsProps) {
  return (
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
            value={options.outputFormat}
            onChange={(event) =>
              onUpdateOption("outputFormat", event.target.value as OutputFormat)
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
            value={options.tone}
            onChange={(event) => onUpdateOption("tone", event.target.value)}
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
  );
}
