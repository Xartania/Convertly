import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

interface DashboardHeroProps {
  onCreateProject: () => void;
}

export function DashboardHero({ onCreateProject }: DashboardHeroProps) {
  return (
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
            onClick={onCreateProject}
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
  );
}
