export type OutputFormat = "text" | "markdown" | "json" | "csv" | "bullets" | "table";

export type ToolOptions = {
  language: string;
  tone: string;
  length: "short" | "medium" | "long";
  outputFormat: OutputFormat;
  preserveFormatting: boolean;
};

export type ProjectRun = {
  id: string;
  source: string;
  instruction: string;
  output: string;
  originalOutput: string;
  options: ToolOptions;
  createdAt: string;
  status: "completed" | "failed" | "cancelled";
};

export type ToolProject = {
  id: string;
  name: string;
  status: "draft" | "ready" | "processing" | "error";
  source: string;
  instruction: string;
  currentOutput: string;
  options: ToolOptions;
  runs: ProjectRun[];
  updatedAt: string;
  isFavorite: boolean;
};
