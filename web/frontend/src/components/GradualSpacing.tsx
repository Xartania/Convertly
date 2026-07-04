"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import * as React from "react";

interface GradualSpacingProps {
  text: string;
  highlight?: string;
}

export function GradualSpacing({ text, highlight }: GradualSpacingProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const highlightStart = highlight ? text.indexOf(highlight) : -1;
  const highlightEnd = highlight && highlightStart >= 0 ? highlightStart + highlight.length : -1;

  return (
    <span ref={ref} className="flex flex-wrap justify-center gap-x-1 gap-y-0">
      <AnimatePresence>
        {text.split("").map((char, index) => {
          const isHighlighted = highlightStart >= 0 && index >= highlightStart && index < highlightEnd;

          return (
            <motion.span
              key={`${char}-${index}`}
              initial={{ opacity: 0, x: -18 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              className={`text-center text-4xl font-extrabold tracking-normal sm:text-6xl md:text-7xl ${
                isHighlighted ? "text-indigo-600" : "text-slate-900"
              }`}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}
