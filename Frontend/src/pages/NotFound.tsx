import { Link } from "react-router-dom";
import { LightGlassBg } from "@/components/ui/light-glass-bg";

export default function NotFound() {
  return (
    <LightGlassBg className="text-zinc-900">
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <span className="font-jetbrains text-[120px] font-bold leading-none bg-linear-to-r from-[#6366F1] to-[#4edea3] bg-clip-text text-transparent">404</span>
        <h2 className="font-satoshi text-2xl font-bold mt-4">Page Not Found</h2>
        <p className="mt-2 text-zinc-500 font-dmsans">Sorry, this page does not exist.</p>
        <Link
          to="/"
          className="mt-8 px-6 py-3 bg-[#6366F1] text-[#0d0096] rounded-lg font-jetbrains text-xs uppercase font-medium hover:opacity-90 transition"
        >
          Go Home
        </Link>
      </div>
    </LightGlassBg>
  );
}
