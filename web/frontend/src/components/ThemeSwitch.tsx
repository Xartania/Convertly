import { MoonStar, SunMedium } from "lucide-react";

interface ThemeSwitchProps {
  lightMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function ThemeSwitch({ lightMode, onToggle, className = "" }: ThemeSwitchProps) {
  const nextTheme = lightMode ? "dark" : "light";
  const trackClass = lightMode
    ? "border-amber-500 bg-amber-400"
    : "border-slate-950 bg-slate-900";
  const thumbClass = lightMode
    ? "translate-x-0 bg-white text-amber-500"
    : "translate-x-8 bg-violet-500 text-white";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lightMode}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={onToggle}
      className={`theme-switch relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border-2 p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 ${trackClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`grid h-7 w-7 place-items-center rounded-full transition-transform duration-200 ${thumbClass}`}
      >
        {lightMode ? <SunMedium size={15} /> : <MoonStar size={15} />}
      </span>
    </button>
  );
}
