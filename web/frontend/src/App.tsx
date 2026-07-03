import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import AuthPage, { type AuthMode } from "./components/AuthPage";
import { Footer } from "./components/landingpage/Footer";
import { HeroSection } from "./components/landingpage/HeroSection";
import { Navbar } from "./components/landingpage/Navbar";
import { TechSection } from "./components/landingpage/TechSection";
import { TutorialSection } from "./components/landingpage/TutorialSection";
import type { CopiedPane, TutorialStep } from "./components/landingpage/types";

export default function ConvertlyLanding() {
  const tutorialRef = useRef<HTMLElement | null>(null);
  const scrollLockTimeoutRef = useRef<number | null>(null);
  const [activeStep, setActiveStep] = useState<TutorialStep>(0);
  const [activeNavStep, setActiveNavStep] = useState<TutorialStep | null>(null);
  const [inputText, setInputText] = useState(
    "id,name,role,email\n1,Alice Dupont,Admin,alice@convertly.dev\n2,Bob Martin,User,bob@convertly.dev\n3,Charlie Roux,Editor,charlie@convertly.dev"
  );
  const [outputText, setOutputText] = useState("");
  const [copiedPane, setCopiedPane] = useState<CopiedPane>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    if (window.location.hash) {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }

    window.scrollTo(0, 0);

    return () => {
      if (scrollLockTimeoutRef.current !== null) {
        window.clearTimeout(scrollLockTimeoutRef.current);
      }

      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: tutorialRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (scrollLockTimeoutRef.current !== null) {
      return;
    }

    if (latest <= 0 || latest >= 1) {
      setActiveNavStep(null);
      return;
    }

    const nextStep: TutorialStep = latest < 0.33 ? 0 : latest < 0.66 ? 1 : 2;
    setActiveStep(nextStep);
    setActiveNavStep(nextStep);
  });

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const scrollToTutorialStep = (step: TutorialStep) => {
    const section = tutorialRef.current;

    if (!section) {
      return;
    }

    const progressByStep: Record<TutorialStep, number> = {
      0: 0.16,
      1: 0.5,
      2: 0.84,
    };
    const scrollableDistance = section.offsetHeight - window.innerHeight;

    if (scrollLockTimeoutRef.current !== null) {
      window.clearTimeout(scrollLockTimeoutRef.current);
    }

    setActiveStep(step);
    setActiveNavStep(step);
    window.scrollTo({
      top: section.offsetTop + scrollableDistance * progressByStep[step],
      behavior: "smooth",
    });

    scrollLockTimeoutRef.current = window.setTimeout(() => {
      scrollLockTimeoutRef.current = null;
    }, 700);
  };

  const handleCopy = (pane: "input" | "output") => {
    const textToCopy = pane === "input" ? inputText : outputText;

    navigator.clipboard.writeText(textToCopy);
    setCopiedPane(pane);
    window.setTimeout(() => setCopiedPane(null), 2000);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      return;
    }

    setIsProcessing(true);
    window.setTimeout(() => {
      try {
        const lines = inputText.trim().split("\n");
        const separator = lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(separator);
        const json = lines.slice(1).map((line) => {
          const values = line.split(separator);

          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
            return obj;
          }, {} as Record<string, string>);
        });

        setOutputText(JSON.stringify(json, null, 2));
      } catch {
        setOutputText("// Erreur de conversion. Vérifiez le format du fichier d'entrée.");
      }

      setIsProcessing(false);
    }, 800);
  };

  const wordCount = inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length;
  const charCount = inputText.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar
        activeNavStep={activeNavStep}
        onAuthOpen={openAuth}
        onTutorialStepSelect={scrollToTutorialStep}
      />

      <AuthPage
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />

      <HeroSection />
      <TutorialSection
        activeStep={activeStep}
        charCount={charCount}
        copiedPane={copiedPane}
        inputText={inputText}
        isProcessing={isProcessing}
        outputText={outputText}
        tutorialRef={tutorialRef}
        wordCount={wordCount}
        onClear={handleClear}
        onConvert={handleConvert}
        onCopy={handleCopy}
        onInputTextChange={setInputText}
      />
      <TechSection />
      <Footer />
    </div>
  );
}
