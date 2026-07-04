import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, api } from "../../services/api";
import type { ApiAuth, ApiProjectStatus, ProjectRequest } from "../../types/api";
import { runTool } from "./toolRunner";
import type { ProjectRun, ToolOptions, ToolProject } from "./types";

export const DEFAULT_OPTIONS: ToolOptions = {
  language: "English",
  tone: "Professional",
  length: "medium",
  outputFormat: "text",
  preserveFormatting: true,
};

type SaveStatus = "Saved" | "Saving..." | "Unsaved" | "Save failed";

const SAVE_DEBOUNCE_MS = 800;

const projectStatusToApiStatus: Record<ToolProject["status"], ApiProjectStatus> = {
  draft: "DRAFT",
  ready: "READY",
  processing: "PROCESSING",
  error: "ERROR",
};

const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

const parseOptions = (value: string | null | undefined, fallback: ToolOptions) => {
  if (!value) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...(JSON.parse(value) as Partial<ToolOptions>),
    };
  } catch {
    return fallback;
  }
};

const toSavePayload = (project: ToolProject): Partial<ProjectRequest> => ({
  name: project.name.trim() || "Untitled project",
  source: project.source,
  instruction: project.instruction,
  currentOutput: project.currentOutput,
  optionsJson: JSON.stringify(project.options),
  status: projectStatusToApiStatus[project.status],
  favorite: project.isFavorite,
});

const createSaveSnapshot = (project: ToolProject) => JSON.stringify(toSavePayload(project));

export function useWorkspace(
  initialProject: ToolProject,
  auth?: ApiAuth,
  onSessionExpired?: () => void
) {
  const [project, setProject] = useState<ToolProject>(initialProject);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const abortControllerRef = useRef<AbortController | null>(null);
  const projectRef = useRef(project);
  const saveRequestIdRef = useRef(0);
  const lastSavedSnapshotRef = useRef(createSaveSnapshot(initialProject));

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const saveCurrentProject = useCallback(async () => {
    if (!auth) {
      return false;
    }

    const projectToSave = projectRef.current;
    const snapshot = createSaveSnapshot(projectToSave);

    if (snapshot === lastSavedSnapshotRef.current) {
      setSaveStatus("Saved");
      return true;
    }

    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;
    setSaveStatus("Saving...");

    try {
      const savedProject = await api.updateProject(auth, projectToSave.id, toSavePayload(projectToSave));

      if (saveRequestIdRef.current !== requestId) {
        return true;
      }

      const savedToolProject: ToolProject = {
        ...projectToSave,
        name: savedProject.name,
        status: savedProject.status
          ? savedProject.status.toLowerCase() as ToolProject["status"]
          : projectToSave.status,
        source: savedProject.source ?? "",
        instruction: savedProject.instruction ?? "",
        currentOutput: savedProject.currentOutput ?? "",
        options: parseOptions(savedProject.optionsJson, projectToSave.options),
        updatedAt: savedProject.updatedAt || projectToSave.updatedAt,
        isFavorite: savedProject.favorite,
      };
      const savedSnapshot = createSaveSnapshot(savedToolProject);

      lastSavedSnapshotRef.current = savedSnapshot;

      if (createSaveSnapshot(projectRef.current) === savedSnapshot) {
        setProject((currentProject) => ({
          ...currentProject,
          updatedAt: savedToolProject.updatedAt,
        }));
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Unsaved");
      }

      return true;
    } catch (error) {
      if (isAuthError(error)) {
        onSessionExpired?.();
        return false;
      }

      if (saveRequestIdRef.current === requestId) {
        setSaveStatus("Save failed");
      }

      return false;
    }
  }, [auth, onSessionExpired]);

  useEffect(() => {
    if (!auth) {
      return;
    }

    if (createSaveSnapshot(project) === lastSavedSnapshotRef.current) {
      setSaveStatus("Saved");
      return;
    }

    setSaveStatus("Unsaved");

    const timer = window.setTimeout(() => {
      void saveCurrentProject();
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    auth,
    project.name,
    project.source,
    project.instruction,
    project.currentOutput,
    project.options,
    project.status,
    project.isFavorite,
    saveCurrentProject,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (createSaveSnapshot(projectRef.current) === lastSavedSnapshotRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

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
      if (isAuthError(error)) {
        onSessionExpired?.();
        return;
      }

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
  }, [auth, onSessionExpired, project.id, project.instruction, project.options, project.source]);

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
    saveCurrentProject,
    handleRun,
    cancelRun,
    loadHistoryItem,
  };
}
