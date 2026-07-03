import type { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  FileQuestion,
  Loader2,
  Settings2,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import type { CopiedPane, TutorialStep } from "./types";

interface TutorialSectionProps {
  activeStep: TutorialStep;
  charCount: number;
  copiedPane: CopiedPane;
  inputText: string;
  isProcessing: boolean;
  outputText: string;
  tutorialRef: RefObject<HTMLElement | null>;
  wordCount: number;
  onClear: () => void;
  onConvert: () => void;
  onCopy: (pane: "input" | "output") => void;
  onInputTextChange: (value: string) => void;
}

const tutorialSteps: TutorialStep[] = [0, 1, 2];

export function TutorialSection({
  activeStep,
  charCount,
  copiedPane,
  inputText,
  isProcessing,
  outputText,
  tutorialRef,
  wordCount,
  onClear,
  onConvert,
  onCopy,
  onInputTextChange,
}: TutorialSectionProps) {
  return (
    <section id="tutorial" ref={tutorialRef} className="relative h-[300vh] bg-slate-50">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute right-8 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          {tutorialSteps.map((step) => (
            <div
              key={step}
              className={`h-3 w-3 rounded-full shadow-sm transition-all duration-300 ${
                activeStep === step ? "scale-125 bg-purple-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="problem"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex w-full flex-col items-center justify-center px-8"
            >
              <div className="mb-16 flex flex-col items-center text-center">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Le constat</h2>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                  Vos données ne se parlent plus.
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
                  Le transfert de données entre fichiers disparates et systèmes de production
                  est devenu un goulot d'étranglement manuel et imprévisible.
                </p>
              </div>

              <div className="flex w-full max-w-5xl flex-col items-center gap-12 md:flex-row">
                <div className="w-full flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <FileQuestion className="text-slate-400" size={20} />
                    <span className="font-mono text-xs font-semibold text-slate-500">IMPORT_CASSÉ.CSV</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-400">
                    [...]<br />
                    row_4: MISSING_KEY<br />
                    row_5: SCHEMA_MISMATCH
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="hidden h-16 w-px bg-slate-200 md:block" />
                  <div className="rounded-full bg-rose-50 p-3 text-rose-500">
                    <AlertOctagon size={24} />
                  </div>
                  <div className="hidden h-16 w-px bg-slate-200 md:block" />
                </div>

                <div className="w-full flex-1 rounded-2xl bg-slate-900 p-6 shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <Database className="text-purple-400" size={20} />
                    <span className="font-mono text-xs font-semibold text-slate-300">PRODUCTION_API</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-purple-400">
                    {">"} 400 Bad Request<br />
                    {">"} Invalid JSON structure
                  </div>
                </div>
              </div>

              <div className="mt-16 flex gap-8 text-slate-500">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} />
                  <span className="text-sm">Perte de temps manuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 size={16} />
                  <span className="text-sm">Scripts de conversion fragiles</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="solution"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex w-full flex-col items-center justify-center px-8"
            >
              <div className="mb-14 flex flex-col items-center text-center">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-purple-600">La solution</h2>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                  Un seul langage pour remettre de l'ordre.
                </h1>
                <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-600">
                  Convertly transforme le fichier source avec un script lisible, applique vos règles métier,
                  puis génère une sortie propre pour vos outils de production.
                </p>
              </div>

              <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] lg:items-stretch">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <FileQuestion className="text-slate-400" size={20} />
                    <span className="font-mono text-xs font-semibold text-slate-500">IMPORT_CASSÉ.CSV</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-500">
                    id;name;email;status<br />
                    102;Jean D.;jean@;;ACTIVE<br />
                    <span className="text-rose-500">row_4: MISSING_KEY</span><br />
                    <span className="text-rose-500">row_5: SCHEMA_MISMATCH</span>
                  </div>
                </div>

                <div className="hidden items-center justify-center lg:flex">
                  <ArrowRight className="text-purple-400" size={28} />
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-lg shadow-purple-900/5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Terminal className="text-purple-600" size={20} />
                      <span className="font-mono text-xs font-semibold text-purple-700">convertly.script</span>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                      DSL
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
                    load "import.csv"<br />
                    normalize columns<br />
                    require email as string<br />
                    map status to enum<br />
                    export json
                  </div>
                </div>

                <div className="hidden items-center justify-center lg:flex">
                  <ArrowRight className="text-purple-400" size={28} />
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <Database className="text-emerald-500" size={20} />
                    <span className="font-mono text-xs font-semibold text-slate-500">PRODUCTION_API</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 font-mono text-xs leading-relaxed text-emerald-700">
                    {">"} 200 OK<br />
                    {">"} JSON validé<br />
                    {">"} Schéma normalisé
                  </div>
                </div>
              </div>

              <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-3">
                <div className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3">
                  <Settings2 size={16} className="text-purple-500" />
                  Règles réutilisables
                </div>
                <div className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3">
                  <Code2 size={16} className="text-purple-500" />
                  Conversion automatisée
                </div>
                <div className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Sortie exploitable
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="how-to-use"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex w-full flex-col items-center justify-center px-6"
            >
              <h2 className="mb-4 text-center text-3xl font-bold text-slate-900 md:text-5xl">À vous de jouer</h2>
              <p className="mb-8 max-w-2xl text-center text-slate-600">
                Importez vos données, appliquez vos règles métier et convertissez à la volée. Testez l'éditeur interactif ci-dessous.
              </p>

              <div className="flex h-[480px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-lg shadow-purple-900/5 sm:h-[520px]">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-purple-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Terminal className="text-purple-600" size={20} />
                    <span className="font-mono text-xs font-semibold text-purple-700">convertly.script — éditeur</span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                    Live
                  </span>
                </div>

                <div className="relative grid min-h-0 flex-1 grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div className="flex min-h-0 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileQuestion size={14} className="text-slate-400" />
                        <span className="font-mono text-[11px] font-semibold text-slate-500">entrée.csv</span>
                      </div>
                      <button
                        onClick={() => onCopy("input")}
                        disabled={!inputText.trim()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-purple-600 disabled:opacity-40 disabled:hover:text-slate-500"
                      >
                        {copiedPane === "input" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        {copiedPane === "input" ? "Copié" : "Copier"}
                      </button>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(event) => onInputTextChange(event.target.value)}
                      className="w-full flex-1 resize-none bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                      placeholder="Collez ou tapez votre fichier source ici..."
                      spellCheck={false}
                    />
                  </div>

                  <div className="relative flex min-h-0 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-emerald-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-emerald-500" />
                        <span className="font-mono text-[11px] font-semibold text-emerald-700">résultat.json</span>
                      </div>
                      <button
                        onClick={() => onCopy("output")}
                        disabled={!outputText.trim()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-40 disabled:hover:text-emerald-600"
                      >
                        {copiedPane === "output" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        {copiedPane === "output" ? "Copié" : "Copier"}
                      </button>
                    </div>
                    <pre className="flex-1 overflow-auto whitespace-pre-wrap bg-emerald-50/40 p-4 font-mono text-xs leading-relaxed text-emerald-800">
                      {outputText || <span className="italic text-slate-400">// Le résultat de la conversion s'affichera ici</span>}
                    </pre>

                    <AnimatePresence>
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                        >
                          <Loader2 size={28} className="mb-3 animate-spin text-purple-600" />
                          <span className="text-sm font-semibold tracking-wide text-purple-700">Exécution du script (Rust)...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row">
                  <div className="flex gap-4 text-xs font-medium text-slate-500">
                    <span>{charCount} caractères</span>
                    <span>{wordCount} mots</span>
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      onClick={onClear}
                      className="flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 sm:flex-none"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Effacer</span>
                    </button>

                    <button
                      onClick={onConvert}
                      disabled={isProcessing || !inputText.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      <Sparkles size={14} />
                      Convertir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
