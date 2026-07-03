const languages = ["Rust", "C", "Java", "TypeScript / JS", "HTML5 / CSS3", "SQL"];
const frameworks = ["React", "Tailwind CSS", "Springboot", "Docker", "Serveur Linux", "CI/CD"];

export function TechSection() {
  return (
    <section id="tech" className="border-y border-slate-200 bg-white px-6 py-24 relative">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Environnement Technique</h2>
          <p className="mt-4 text-lg text-slate-600">
            Une architecture client-serveur robuste adossée à un interpréteur performant.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Langages</h4>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <span key={language} className="bg-slate-50 px-3 py-1 text-sm font-medium border border-slate-200 text-slate-700 rounded-full">
                    {language}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Frameworks & Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                {frameworks.map((tech) => (
                  <span key={tech} className="bg-purple-50 px-3 py-1 text-sm font-medium border border-purple-200 text-purple-700 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
