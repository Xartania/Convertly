import type { AuthMode } from "../AuthPage";
import { ThemeSwitch } from "../ThemeSwitch";
import type { TutorialStep } from "./types";

interface NavbarProps {
  activeNavStep: TutorialStep | null;
  lightMode: boolean;
  onAuthOpen: (mode: AuthMode) => void;
  onLightModeToggle: () => void;
  onTutorialStepSelect: (step: TutorialStep) => void;
}

const tutorialNavItems = [
  { label: "Problem", step: 0 },
  { label: "Solution", step: 1 },
  { label: "Demo", step: 2 },
] as const;

export function Navbar({
  activeNavStep,
  lightMode,
  onAuthOpen,
  onLightModeToggle,
  onTutorialStepSelect,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
            <img src="/transfer.png" alt="Convertly logo" className="convertly-logo-image h-6 w-6 object-contain" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-black">
            Convert<span className="text-purple-600">ly</span>
          </span>
        </a>

        <nav className="hidden items-center rounded-full border border-black/10 bg-white px-2 py-1 text-sm font-semibold text-black/60 shadow-sm transition-colors md:flex">
          <a href="#home" className="rounded-full px-4 py-2 transition-colors hover:bg-purple-600 hover:text-white">
            Home
          </a>
          {tutorialNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onTutorialStepSelect(item.step)}
              className={`rounded-full px-4 py-2 transition-colors ${
                activeNavStep === item.step
                  ? "bg-purple-600 text-white"
                  : "hover:bg-purple-600 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitch lightMode={lightMode} onToggle={onLightModeToggle} />
          <button
            onClick={() => onAuthOpen("signin")}
            className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-purple-600 hover:text-white md:block"
          >
            Sign in
          </button>
          <button
            onClick={() => onAuthOpen("signup")}
            className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
