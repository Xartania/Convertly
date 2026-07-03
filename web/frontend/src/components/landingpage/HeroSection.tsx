import { motion, type Variants } from "framer-motion";
import { ArrowRight, Database, FileQuestion, Terminal } from "lucide-react";

const heroTextContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroTextItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const heroTitleItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const heroBoxContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.45,
      staggerChildren: 0.12,
    },
  },
};

const heroBoxItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const heroArrowItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function HeroSection() {
  return (
    <section id="home" className="relative border-b border-black/10 bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div variants={heroTextContainer} initial="hidden" animate="show">
          <motion.h1
            variants={heroTitleItem}
            className="text-6xl font-extrabold tracking-tight text-black sm:text-8xl"
          >
            Convert<span className="text-purple-600">ly</span>
          </motion.h1>
          <motion.p
            variants={heroTextItem}
            className="mx-auto mt-5 max-w-xl text-xl font-semibold text-black sm:text-2xl"
          >
            Un langage de script pour automatiser vos fichiers.
          </motion.p>
          <motion.p
            variants={heroTextItem}
            className="mx-auto mt-4 max-w-lg text-base leading-7 text-black/60"
          >
            Convertly centralise le traitement de fichiers. Grâce à notre DSL et son interpréteur dédié, lisez, modifiez, configurez et convertissez tous vos formats au sein d'une plateforme unique.
          </motion.p>

          <motion.div variants={heroTextItem} className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <a href="#tutorial" className="flex items-center gap-2 bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black rounded">
              Découvrir le workflow
              <ArrowRight size={16} />
            </a>
            <a href="#team" className="flex items-center gap-1.5 text-sm font-semibold text-black transition-colors hover:text-purple-600">
              Voir la roadmap
              <ArrowRight size={14} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={heroBoxContainer}
          initial="hidden"
          animate="show"
          className="mt-20 flex items-center justify-center gap-3 sm:gap-6"
        >
          <motion.div
            variants={heroBoxItem}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex w-24 flex-col items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-5 shadow-sm sm:w-36 sm:px-4"
          >
            <FileQuestion className="text-black" size={22} />
            <span className="font-mono text-[10px] text-black/50 sm:text-[11px]">fichier.csv</span>
          </motion.div>

          <motion.div variants={heroArrowItem}>
            <ArrowRight className="shrink-0 text-purple-600" size={18} />
          </motion.div>

          <motion.div
            variants={heroBoxItem}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex w-24 flex-col items-center gap-2 rounded-xl border border-purple-600 bg-purple-600 px-3 py-5 shadow-sm sm:w-36 sm:px-4"
          >
            <Terminal className="text-white" size={22} />
            <span className="font-mono text-[10px] text-white sm:text-[11px]">script.cly</span>
          </motion.div>

          <motion.div variants={heroArrowItem}>
            <ArrowRight className="shrink-0 text-purple-600" size={18} />
          </motion.div>

          <motion.div
            variants={heroBoxItem}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex w-24 flex-col items-center gap-2 rounded-xl border border-black bg-black px-3 py-5 shadow-sm sm:w-36 sm:px-4"
          >
            <Database className="text-white" size={22} />
            <span className="font-mono text-[10px] text-white sm:text-[11px]">résultat.json</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
