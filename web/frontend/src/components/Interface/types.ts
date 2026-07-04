export type ProjectStatus = "draft" | "ready" | "processing" | "error" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: ProjectStatus;
  source: string;
  instruction: string;
  currentOutput: string;
  optionsJson: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}
