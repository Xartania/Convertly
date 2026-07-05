import { KeyboardEvent, useState } from "react";
import type { ApiAuth } from "../../types/api";
import { ResultPanel } from "./ResultPanel";
import { SourceInstructionPanel } from "./SourceInstructionPanel";
import type { ToolProject } from "./types";
import { useWorkspace } from "./useWorkspace";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceSettings } from "./WorkspaceSettings";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

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

interface ToolInterfaceProps {
  initialProject?: ToolProject;
  auth?: ApiAuth;
  lightMode?: boolean;
  onBack?: () => void;
  onLightModeToggle?: () => void;
  onSessionExpired?: () => void;
}

export function ToolInterface({
  initialProject = DEMO_PROJECT,
  auth,
  lightMode = true,
  onBack,
  onLightModeToggle,
  onSessionExpired,
}: ToolInterfaceProps) {
  const {
    project,
    updateField,
    updateOption,
    isProcessing,
    saveStatus,
    saveCurrentProject,
    handleRun,
    cancelRun,
    loadHistoryItem,
  } = useWorkspace(initialProject, auth, onSessionExpired);
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

  const handleBack = async () => {
    if (!onBack) {
      return;
    }

    const saved = await saveCurrentProject();

    if (saved || window.confirm("Saving failed. Leave the editor anyway?")) {
      onBack();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-black">
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        runs={project.runs}
        onClose={() => setIsSidebarOpen(false)}
        onLoadHistoryItem={loadHistoryItem}
      >
        <WorkspaceSettings options={project.options} onUpdateOption={updateOption} />
      </WorkspaceSidebar>

      <main className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <WorkspaceHeader
          canRun={canRun}
          lightMode={lightMode}
          isFavorite={project.isFavorite}
          isProcessing={isProcessing}
          isSidebarOpen={isSidebarOpen}
          name={project.name}
          saveStatus={saveStatus}
          onBack={onBack ? handleBack : undefined}
          onCancelRun={cancelRun}
          onLightModeToggle={onLightModeToggle}
          onNameChange={(value) => updateField("name", value)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onRun={handleRun}
          onToggleFavorite={() => updateField("isFavorite", !project.isFavorite)}
        />

        <div className="flex-1 overflow-hidden p-6">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
            <SourceInstructionPanel
              instruction={project.instruction}
              source={project.source}
              onInstructionKeyDown={handleInstructionKeyDown}
              onUpdateField={updateField}
            />

            <ResultPanel
              copied={copied}
              currentOutput={project.currentOutput}
              isProcessing={isProcessing}
              outputFormat={project.options.outputFormat}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onUpdateOutput={(value) => updateField("currentOutput", value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
