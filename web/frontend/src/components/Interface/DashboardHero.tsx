import { FormEvent, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, CircleDashed, Plus, Sparkles } from "lucide-react";
import { getErrorMessage } from "./utils";

interface DashboardHeroProps {
  onCreateProject: () => void;
  onPromptCreate: (prompt: string) => Promise<void>;
}

export function DashboardHero({ onCreateProject, onPromptCreate }: DashboardHeroProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      setError("Describe the project you want Convertly to create.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onPromptCreate(nextPrompt);
      setPrompt("");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to create a project from this prompt."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion Variants for staggered entry
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <motion.div variants={itemVariants}>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Sparkles size={24} className="text-purple-600" />
            Create with AI
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Describe the file workflow you need and Convertly will start a draft project for it.
          </p>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="button"
          onClick={onCreateProject}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
        >
          <Plus size={18} />
          Manual setup
        </motion.button>
      </div>

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center rounded-xl border-2 bg-slate-50 transition-colors duration-200 ${
            isFocused ? "border-purple-600 bg-white" : "border-slate-200"
          }`}
        >
          <label className="flex-1">
            <span className="sr-only">AI project prompt</span>
            <input
              type="text"
              value={prompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (error) setError("");
              }}
              placeholder="Ask for a workflow, e.g: clean CSV invoices and export JSON..."
              className="h-14 w-full rounded-xl bg-transparent pl-5 pr-36 text-base text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            />
          </label>

          <div className="absolute right-2 flex items-center">
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="inline-flex h-10 min-w-[110px] items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CircleDashed size={18} className="animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span>Generate</span>
                    <ArrowRight size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600">
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-600"></span>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
