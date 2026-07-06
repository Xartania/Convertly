import { AlertCircle, FileCheck2, Loader2, Upload, X } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";

type ImportedSourceFile = {
  name: string;
  extension: string;
  size: number;
};

interface SourceFileImportProps {
  hasSource: boolean;
  onImport: (content: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set([
  "txt",
  "csv",
  "json",
  "xml",
  "yaml",
  "yml",
  "md",
  "markdown",
  "ini",
  "toml",
  "conf",
  "cfg",
  "config",
  "properties",
  "env",
  "log",
]);

const ACCEPT_ATTRIBUTE = Array.from(ACCEPTED_EXTENSIONS)
  .map((extension) => `.${extension}`)
  .join(",");

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtension = (fileName: string) => {
  const normalizedName = fileName.trim().toLowerCase();

  if (normalizedName === ".env") {
    return "env";
  }

  const index = normalizedName.lastIndexOf(".");
  return index === -1 ? "" : normalizedName.slice(index + 1);
};

const looksBinary = (text: string) => {
  if (text.includes("\u0000")) {
    return true;
  }

  const sample = text.slice(0, 4096);
  let suspiciousCharacters = 0;

  for (const character of sample) {
    const code = character.charCodeAt(0);
    const isAllowedControl = code === 9 || code === 10 || code === 13;

    if (code < 32 && !isAllowedControl) {
      suspiciousCharacters += 1;
    }
  }

  return sample.length > 0 && suspiciousCharacters / sample.length > 0.05;
};

export function SourceFileImport({ hasSource, onImport }: SourceFileImportProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importedFile, setImportedFile] = useState<ImportedSourceFile | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const importFile = async (file: File) => {
    setError("");

    const extension = getExtension(file.name);

    if (!extension || !ACCEPTED_EXTENSIONS.has(extension)) {
      setError(
        "Unsupported file type. Import TXT, CSV, JSON, XML, YAML, Markdown, INI, TOML, or readable config files."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
      return;
    }

    if ((hasSource || importedFile) && !window.confirm("Replace the current source content with this file?")) {
      return;
    }

    setIsLoading(true);

    try {
      const content = await file.text();

      if (looksBinary(content)) {
        setError("This looks like a binary file. Convertly can only import readable text files here.");
        return;
      }

      onImport(content);
      setImportedFile({
        name: file.name,
        extension,
        size: file.size,
      });
    } catch {
      setError("Unable to read this file. Check the file and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      void importFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void importFile(file);
    }
  };

  const removeImportedFile = () => {
    if (hasSource && !window.confirm("Remove the imported file and clear the source content?")) {
      return;
    }

    setImportedFile(null);
    setError("");
    onImport("");
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
      className={`border-b border-black/10 px-4 py-3 transition-colors ${
        isDragging ? "bg-purple-50" : "bg-slate-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {importedFile ? (
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <FileCheck2 size={16} className="shrink-0 text-purple-600" />
              <span className="truncate font-semibold text-black">{importedFile.name}</span>
              <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-semibold uppercase text-black/50">
                {importedFile.extension}
              </span>
              <span className="shrink-0 text-xs text-black/45">{formatFileSize(importedFile.size)}</span>
            </div>
          ) : (
            <p className="text-sm text-black/50">
              Import a readable source file or drop it here.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {importedFile && (
            <button
              type="button"
              onClick={removeImportedFile}
              className="rounded border border-black/10 bg-white p-2 text-black/45 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Remove imported file"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:bg-black/30"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {isLoading ? "Importing..." : "Import file"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
