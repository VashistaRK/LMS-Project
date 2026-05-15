import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
      className="mb-12 relative overflow-hidden rounded-2xl border border-white/[0.06]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className="absolute right-0 top-0 w-2/3 h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] from-30% via-[#09090B]/70 via-50% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]/50" />
      </div>
      <div className="relative z-10 px-8 py-10 md:py-12">
        <span className="font-jetbrains text-xs text-[#c0c1ff] uppercase tracking-[0.2em] mb-4 block">
          {label}
        </span>
        <h1 className="font-satoshi text-4xl md:text-6xl font-bold tracking-[-0.04em] text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="font-satoshi text-xl md:text-2xl font-bold tracking-[-0.03em] text-zinc-500 mb-6 max-w-2xl leading-tight">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </motion.header>
  );
}
