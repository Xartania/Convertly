import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { API_BASE_URL } from "../../services/api";
import type { ApiAuth, UserResponse } from "../../types/api";
import { ThemeSwitch } from "../ThemeSwitch";
import { DashboardHero } from "./DashboardHero";
import { NewProjectDialog, type NewProjectInput } from "./NewProjectDialog";
import { ProjectCard } from "./ProjectCard";
import { Sidebar } from "./Sidebar";
import type { Project, ProjectStatus } from "./types";
import { getErrorMessage, isAuthError, mapApiProject } from "./utils";

interface DashboardProps {
  user: UserResponse;
  auth: ApiAuth;
  lightMode: boolean;
  onLightModeToggle: () => void;
  onLogout: () => void;
  onSessionExpired: () => void;
  onProjectOpen: (project: Project) => void;
}

const getPromptProjectName = (prompt: string) => {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();
  const withoutCommand = normalizedPrompt.replace(
    /^(create|build|generate|make|start)\s+(a|an|the)?\s*/i,
    ""
  );
  const words = withoutCommand.split(" ").filter(Boolean).slice(0, 6).join(" ");

  if (!words) {
    return "AI Generated Workflow";
  }

  return words.charAt(0).toUpperCase() + words.slice(1);
};

export function Dashboard({
  user,
  auth,
  lightMode,
  onLightModeToggle,
  onLogout,
  onSessionExpired,
  onProjectOpen,
}: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");
  const displayName = user.displayName || user.email;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  useEffect(() => {
    let isMounted = true;

    setIsLoadingProjects(true);
    setProjectError("");

    api.listProjects(auth)
      .then((loadedProjects) => {
        if (isMounted) {
          setProjects(loadedProjects.map(mapApiProject));
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        if (isAuthError(error)) {
          onSessionExpired();
          return;
        }

        setProjectError(getErrorMessage(error, "Unable to load projects."));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auth, onSessionExpired]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      return;
    }

    const previousProjects = projects;

    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));
    setProjectError("");

    try {
      await api.deleteProject(auth, id);
    } catch (error) {
      if (isAuthError(error)) {
        onSessionExpired();
        return;
      }

      setProjects(previousProjects);
      setProjectError(getErrorMessage(error, "Unable to delete project."));
    }
  };

  const toggleFavorite = async (id: string) => {
    const project = projects.find((currentProject) => currentProject.id === id);

    if (!project) {
      return;
    }

    const previousProjects = projects;
    const nextFavorite = !project.isFavorite;

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === id ? { ...project, isFavorite: nextFavorite } : project
      )
    );
    setProjectError("");

    try {
      const updatedProject = await api.updateProject(auth, id, {
        favorite: nextFavorite,
      });

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === id ? mapApiProject(updatedProject) : project
        )
      );
    } catch (error) {
      if (isAuthError(error)) {
        onSessionExpired();
        return;
      }

      setProjects(previousProjects);
      setProjectError(getErrorMessage(error, "Unable to update project."));
    }
  };

  const handleCreate = async (newProject: NewProjectInput) => {
    setProjectError("");

    try {
      const createdProject = await api.createProject(auth, {
        name: newProject.name,
        description: newProject.description,
        type: "Custom Workspace",
        status: "DRAFT",
        favorite: false,
        source: "",
        instruction: "",
        currentOutput: "",
        optionsJson: "",
      });

      const project = mapApiProject(createdProject);

      setProjects((currentProjects) => [project, ...currentProjects]);
      setIsNewProjectModalOpen(false);
      onProjectOpen(project);
    } catch (error) {
      if (isAuthError(error)) {
        onSessionExpired();
      }

      throw error;
    }
  };

  const handlePromptCreate = async (prompt: string) => {
    setProjectError("");

    try {
      const createdProject = await api.createProject(auth, {
        name: getPromptProjectName(prompt),
        description: prompt,
        type: "AI Generated Workspace",
        status: "DRAFT",
        favorite: false,
        source: "",
        instruction: prompt,
        currentOutput: "",
        optionsJson: "",
      });

      const project = mapApiProject(createdProject);

      setProjects((currentProjects) => [project, ...currentProjects]);
      onProjectOpen(project);
    } catch (error) {
      if (isAuthError(error)) {
        onSessionExpired();
      }

      throw error;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-black">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar
        displayName={displayName}
        initials={initials}
        isOpen={isSidebarOpen}
        projectCount={projects.length}
        user={user}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="-ml-2 rounded-lg p-2 text-black/50 hover:bg-purple-600 hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="hidden text-lg font-semibold sm:block">
              Good afternoon, {displayName.split(" ")[0]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 text-black/40 transition-colors hover:bg-purple-600 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <ThemeSwitch lightMode={lightMode} onToggle={onLightModeToggle} />
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="hidden items-center gap-2 rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black sm:flex"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-8">
            <DashboardHero
              onCreateProject={() => setIsNewProjectModalOpen(true)}
              onPromptCreate={handlePromptCreate}
            />

            <section className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h3 className="self-start text-xl font-bold sm:self-auto">Recent Projects</h3>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <label className="relative flex-1 sm:w-64">
                  <span className="sr-only">Search projects</span>
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white py-2 pl-9 pr-4 text-sm shadow-sm transition-all placeholder:text-black/30 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/15"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as ProjectStatus | "all")
                  }
                  className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/15"
                  aria-label="Filter projects by status"
                >
                  <option value="all">All Status</option>
                  <option value="ready">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="draft">Drafts</option>
                  <option value="error">Errors</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </section>

            {projectError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <p>{projectError}</p>
                <p className="mt-1 text-xs text-rose-600/80">Backend: {API_BASE_URL}</p>
                <button
                  type="button"
                  onClick={onSessionExpired}
                  className="mt-3 rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
                >
                  Sign in again
                </button>
              </div>
            )}

            {isLoadingProjects ? (
              <section className="rounded-2xl border border-black/10 bg-white py-20 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                <p className="text-sm font-semibold text-black/60">Loading projects...</p>
              </section>
            ) : filteredProjects.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-black/10 bg-white py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <Search size={24} />
                </div>
                <h4 className="mb-1 font-semibold text-black">
                  No projects found
                </h4>
                <p className="mx-auto mb-6 max-w-sm text-sm text-black/55">
                  We could not find any projects matching your current filters. Try adjusting
                  your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-sm font-medium text-purple-600 hover:underline"
                >
                  Clear filters
                </button>
              </section>
            ) : (
              <motion.section
                layout
                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence>
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleDelete}
                      onOpen={onProjectOpen}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </AnimatePresence>
              </motion.section>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isNewProjectModalOpen && (
          <NewProjectDialog onClose={() => setIsNewProjectModalOpen(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>
    </div>
  );
}
