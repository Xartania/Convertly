import { Archive, CheckCircle2, CircleDashed, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { ApiError } from "../../services/api";
import type { ApiProjectStatus, ProjectResponse } from "../../types/api";
import type { Project, ProjectStatus } from "./types";

export const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-slate-50 text-black/60 border-black/10",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  archived: "bg-white text-black/35 border-black/10 line-through",
};

export const statusIcons: Record<ProjectStatus, ReactNode> = {
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

export const mapApiProject = (project: ProjectResponse): Project => ({
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

export const formatUpdatedAt = (value: string) => {
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

export const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
};
