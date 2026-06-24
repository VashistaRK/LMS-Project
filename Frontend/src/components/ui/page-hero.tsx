import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface PageHeroProps {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  image?: string;
}

export function PageHero({
  label,
  title,
  subtitle,
  children,
  image = "assets/courses-hero.png",
}: PageHeroProps) {
  return (
    <motion.header
      className="mb-12 relative overflow-hidden rounded-3xl border border-zinc-400 bg-white/60 backdrop-blur-xl shadow-[0_35px_80px_-10px_rgba(0,0,0,0.75)] ring-1 ring-zinc-900/20"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-stretch">
        {/* Text column — white panel */}
        <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10 md:py-12 bg-white">
          <span className="text-sm font-bold text-zinc-900 mb-4 block">
            {label}
          </span>
          <h1 className="font-satoshi text-3xl sm:text-4xl md:text-6xl font-bold tracking-[-0.04em] text-zinc-900 mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="font-satoshi text-lg sm:text-xl md:text-2xl font-bold tracking-[-0.03em] text-zinc-900 mb-6 leading-tight">
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {/* Image column — full visible, no overlay */}
        <div className="relative min-h-[200px] md:min-h-full">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Thin left edge fade so image meets text panel softly */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        </div>
      </div>
    </motion.header>
  );
}
