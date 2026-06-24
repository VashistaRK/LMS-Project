import { cn } from "@/lib/utils";

interface LightGlassBgProps {
  children: React.ReactNode;
  className?: string;
}

export const LightGlassBg = ({ children, className }: LightGlassBgProps) => (
  <div
    className={cn("relative w-full overflow-hidden bg-white text-zinc-900", className)}
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap"
    />
    {/* Fixed global blob layer — mirrors LandingPage M-Glass scaffold */}
    <div className="pointer-events-none fixed inset-0 -z-0">
      <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-300/35 blur-3xl" />
      <div className="absolute top-40 right-0 h-[500px] w-[500px] rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="absolute top-[700px] left-0 h-[500px] w-[500px] rounded-full bg-amber-300/30 blur-3xl" />
      <div className="absolute top-[1100px] right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="absolute top-[1700px] left-1/3 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-3xl" />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default LightGlassBg;
