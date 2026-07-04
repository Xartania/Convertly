import { api } from "../../services/api";
import type { ApiAuth } from "../../types/api";
import type { ProjectRun, ToolOptions } from "./types";

type RunInput = {
  projectId: string;
  source: string;
  instruction: string;
  options: ToolOptions;
  auth: ApiAuth;
};

export async function runTool(
  input: RunInput,
  signal?: AbortSignal
): Promise<Omit<ProjectRun, "id" | "createdAt">> {
  const result = await api.runProjectTool(input.auth, input.projectId, {
    source: input.source,
    instruction: input.instruction,
    options: input.options,
  }, signal);

  return {
    source: result.source,
    instruction: result.instruction,
    originalOutput: result.originalOutput,
    output: result.output,
    options: input.options,
    status: result.status,
  };
}
