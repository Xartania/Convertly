import { motion } from "framer-motion";
import { CircleDashed, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { getErrorMessage } from "./utils";

export interface NewProjectInput {
  name: string;
  description?: string;
}

interface NewProjectDialogProps {
  onClose: () => void;
  onCreate: (project: NewProjectInput) => Promise<void>;
}

export function NewProjectDialog({ onClose, onCreate }: NewProjectDialogProps) {
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
