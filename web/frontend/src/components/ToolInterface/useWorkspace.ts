import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiAuth } from "../../types/api";
import { runTool } from "./toolRunner";
import type { ProjectRun, ToolOptions, ToolProject } from "./types";

export const DEFAULT_OPTIONS: ToolOptions = {
  language: "English",
  tone: "Professional",
  length: "medium",
  outputFormat: "text",
  preserveFormatting: true,
};

export function useWorkspace(initialProject: ToolProject, auth?: ApiAuth) {
  const [project, setProject] = useState<ToolProject>(initialProject);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved">("Saved");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSaveStatus("Saving...");

    const timer = window.setTimeout(() => {
      setSaveStatus("Saved");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [project.source, project.instruction, project.currentOutput, project.options, project.name]);

  const updateField = useCallback(<Field extends keyof ToolProject>(
    field: Field,
    value: ToolProject[Field]
  ) => {
    setProject((currentProject) => ({
      ...currentProject,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus("Unsaved");
  }, []);

  const updateOption = useCallback(<Field extends keyof ToolOptions>(
    field: Field,
    value: ToolOptions[Field]
  ) => {
    setProject((currentProject) => ({
      ...currentProject,
      options: {
        ...currentProject.options,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus("Unsaved");
  }, []);

  const handleRun = useCallback(async () => {
    if (!project.source || !project.instruction || !auth) {
      return;
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      const result = await runTool(
        {
          projectId: project.id,
          source: project.source,
          instruction: project.instruction,
          options: project.options,
          auth,
        },
        abortControllerRef.current.signal
      );

      const newRun: ProjectRun = {
        ...result,
        id: Math.random().toString(36).slice(2, 11),
        createdAt: new Date().toISOString(),
      };

      setProject((currentProject) => ({
        ...currentProject,
        currentOutput: result.output,
        runs: [newRun, ...currentProject.runs],
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isMissingRunEndpoint = message === "Not Found";

      if (!isAbort && message !== "Processing cancelled") {
        window.alert(
          isMissingRunEndpoint
            ? "Processing failed: the backend does not expose /api/projects/{id}/run yet. Restart the Spring backend with the latest code."
            : `Processing failed: ${message}`
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }, [auth, project.id, project.instruction, project.options, project.source]);

  const cancelRun = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
  }, []);

  const loadHistoryItem = useCallback((run: ProjectRun) => {
    if (saveStatus === "Unsaved" && !window.confirm("You have unsaved changes. Discard them?")) {
      return;
    }

    setProject((currentProject) => ({
      ...currentProject,
      source: run.source,
      instruction: run.instruction,
      currentOutput: run.output,
      options: run.options,
      updatedAt: new Date().toISOString(),
    }));
  }, [saveStatus]);

  return {
    project,
    updateField,
    updateOption,
    isProcessing,
    saveStatus,
    handleRun,
    cancelRun,
    loadHistoryItem,
  };
}
