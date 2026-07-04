import { motion } from "framer-motion";
import { KeyboardEvent } from "react";
import { Star, Trash2 } from "lucide-react";
import type { Project } from "./types";
import { formatUpdatedAt, statusColors, statusIcons } from "./utils";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onOpen: (project: Project) => void;
  onToggleFavorite: (id: string) => void;
}

export function ProjectCard({
  project,
  onDelete,
  onOpen,
  onToggleFavorite,
}: ProjectCardProps) {
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
