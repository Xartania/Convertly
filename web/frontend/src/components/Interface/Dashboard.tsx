import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Bell,
  CheckCircle2,
  CircleDashed,
  FileText,
  Folder,
  HelpCircle,
  LayoutGrid,
  LayoutTemplate,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { ApiError, api } from "../../services/api";
import { API_BASE_URL } from "../../services/api";
import type { ApiAuth, ApiProjectStatus, ProjectResponse, UserResponse } from "../../types/api";
import { Project, ProjectStatus } from "./types";

const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-slate-50 text-black/60 border-black/10",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  archived: "bg-white text-black/35 border-black/10 line-through",
};

const statusIcons: Record<ProjectStatus, ReactNode> = {
  draft: <FileText size={14} />,
  ready: <CheckCircle2 size={14} />,
  processing: <CircleDashed size={14} className="animate-spin" />,
  error: <Archive size={14} />,
  archived: <Archive size={14} />,
};

const apiStatusToProjectStatus: Record<ApiProjectStatus, ProjectStatus> = {
  DRAFT: "draft",
  READY: "ready",
  PROCESSING: "processing",
  ERROR: "error",
  ARCHIVED: "archived",
};

const mapApiProject = (project: ProjectResponse): Project => ({
  id: project.id,
  name: project.name,
  description: project.description ?? "",
  type: project.type || "Custom Workspace",
  status: project.status ? apiStatusToProjectStatus[project.status] : "draft",
  source: project.source ?? "",
  instruction: project.instruction ?? "",
  currentOutput: project.currentOutput ?? "",
  optionsJson: project.optionsJson ?? "",
  createdAt: project.createdAt,
  updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
  isFavorite: project.favorite,
});

const formatUpdatedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(diffInSeconds / secondsInUnit), unit);
    }
  }

  return "just now";
};

interface DashboardProps {
  user: UserResponse;
  auth: ApiAuth;
  onLogout: () => void;
  onSessionExpired: () => void;
  onProjectOpen: (project: Project) => void;
}

interface NewProjectInput {
  name: string;
  description?: string;
}

const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export function Dashboard({
  user,
  auth,
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
  }, [auth]);

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

      setProjects((currentProjects) => [mapApiProject(createdProject), ...currentProjects]);
      setIsNewProjectModalOpen(false);
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

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-black/10 bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <div className="flex items-center gap-2">
            <img src="/transfer.png" alt="Convertly logo" className="h-7 w-7 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-black">
              Convert<span className="text-purple-600">ly</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 text-black/40 hover:bg-purple-600 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
          <NavItem icon={<Folder size={18} />} label="All Projects" badge={projects.length} />
          <NavItem icon={<Star size={18} />} label="Favorites" />
          <NavItem icon={<LayoutTemplate size={18} />} label="Templates" />

          <div className="pb-2 pt-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-black/35">
              Configuration
            </p>
          </div>
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem icon={<HelpCircle size={18} />} label="Documentation" />
        </nav>

        <div className="border-t border-black/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-purple-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-black">
                {displayName}
              </span>
              <span className="block truncate text-xs text-black/50">
                {user.email}
              </span>
            </span>
            <LogOut
              size={16}
              className="text-purple-600 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </button>
        </div>
      </aside>

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
            <button
              type="button"
              className="rounded-full p-2 text-black/40 transition-colors hover:bg-purple-600 hover:text-white"
              aria-label="Theme"
            >
              <Moon size={18} />
            </button>
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
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-2xl border border-black bg-black p-8 shadow-xl sm:p-10"
            >
              <div className="absolute right-0 top-0 h-full w-1/3 bg-purple-600/20 blur-3xl transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 sm:max-w-xl">
                <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
                  <Sparkles className="text-purple-400" />
                  Start your next workflow
                </h2>
                <p className="mb-8 text-sm leading-relaxed text-white/60 sm:text-base">
                  Create a new project from scratch to parse, format, and automate your data
                  files, or jumpstart with one of our pre-configured templates.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="flex items-center gap-2 rounded bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
                  >
                    <Plus size={18} />
                    Create Project
                  </button>
                  <button
                    type="button"
                    className="px-4 py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    Browse templates
                  </button>
                </div>
              </div>
            </motion.section>

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

function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <a
      href="#"
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-purple-600 text-white"
          : "text-black/60 hover:bg-purple-600 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </span>
      {badge !== undefined && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-white/20 text-white" : "bg-black/5 text-black/45"
        }`}>
          {badge}
        </span>
      )}
    </a>
  );
}

function ProjectCard({
  project,
  onDelete,
  onOpen,
  onToggleFavorite,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onOpen: (project: Project) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(project);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={handleKeyDown}
      className="group relative cursor-pointer rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-purple-200 hover:shadow-lg hover:shadow-purple-900/5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColors[project.status]}`}
        >
          {statusIcons[project.status]}
          <span className="capitalize">{project.status}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(project.id);
            }}
            className={`rounded-md p-1.5 transition-colors hover:bg-purple-50 ${
              project.isFavorite ? "text-purple-600" : "text-black/25"
            }`}
            aria-label={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={16} fill={project.isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(project.id);
            }}
            className="rounded-md p-1.5 text-black/35 opacity-0 transition-colors hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
            aria-label="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h4 className="mb-1 text-lg font-bold text-black transition-colors group-hover:text-purple-600">
        {project.name}
      </h4>
      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-black/55">
        {project.description}
      </p>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 text-xs font-medium text-black/45">
        <span className="rounded bg-purple-50 px-2 py-1 text-purple-700">{project.type}</span>
        <span>Updated {formatUpdatedAt(project.updatedAt)}</span>
      </div>
    </motion.article>
  );
}

function NewProjectDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: NewProjectInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || "A new custom workflow workspace.",
      });
    } catch (error) {
      setError(getErrorMessage(error, "Unable to create project."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/10 p-6">
          <h2 className="text-xl font-bold text-black">Create New Project</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-black/40 transition-colors hover:bg-purple-600 hover:text-white"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-sm font-semibold text-black/70"
            >
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="project-name"
              autoFocus
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="e.g. Q3 Analytics Parser"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-transparent focus:outline-none focus:ring-2 ${
                error
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-black/10 focus:border-purple-600 focus:ring-purple-600/15"
              }`}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-1.5 block text-sm font-semibold text-black/70"
            >
              Description <span className="font-normal text-black/35">(Optional)</span>
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What kind of data will this process?"
              rows={3}
              className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/15"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm font-semibold text-black/60 transition-colors hover:bg-black hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded bg-purple-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <CircleDashed size={16} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
