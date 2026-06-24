import React from "react";
import { NotepadTextDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}

export const AnimatedFooter = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}: FooterProps) => {
  return (
    <section className={cn("relative w-full mt-0 overflow-hidden", className)}>
      <footer className="border-t border-white/5 bg-[#09090B] mt-10 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[18rem] sm:min-h-[20rem] md:min-h-[24rem] relative p-4 py-6">
          <div className="flex flex-col mb-6 sm:mb-10 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-100 font-satoshi text-3xl font-bold">
                    {brandName}
                  </span>
                </div>
                <p className="text-zinc-200 font-dmsans font-semibold text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-3 gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-zinc-200 hover:text-zinc-100 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-6 h-6 hover:scale-110 duration-300">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[11px] sm:text-sm font-jetbrains uppercase tracking-[0.05em] text-zinc-200 max-w-full px-4">
                  {navLinks.map((link, index) => (
                    <a
                      key={index}
                      className="hover:text-zinc-100 duration-300 hover:font-semibold"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 md:mt-12 flex flex-col gap-2 md:gap-1 items-center justify-center md:flex-row md:items-center md:justify-between px-4 md:px-0">
            <p className="text-base text-zinc-200 font-jetbrains text-sm text-center md:text-left">
              &copy;{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-200 hover:text-zinc-100 transition-colors duration-300 hover:font-medium font-jetbrains"
                >
                  A product of {creatorName}
                </a>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text */}
        <div
          className="bg-linear-to-b from-zinc-100/20 via-zinc-100/10 to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-32 sm:bottom-24 md:bottom-20 font-satoshi font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
          style={{
            fontSize: 'clamp(2rem, 8vw, 6rem)',
            maxWidth: '95vw'
          }}
        >
          {brandName.toUpperCase()}
        </div>

        {/* Bottom logo */}
        <div className="absolute hover:border-zinc-400 duration-400 drop-shadow-[0_0px_20px_rgba(255,255,255,0.15)] bottom-14 md:bottom-12 backdrop-blur-sm rounded-3xl bg-[#09090B]/60 left-1/2 border-2 border-white/10 flex items-center justify-center p-2 -translate-x-1/2 z-10">
          <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-linear-to-br from-zinc-100 to-zinc-300 rounded-2xl flex items-center justify-center shadow-lg">
            {brandIcon || (
              <NotepadTextDashed className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-[#09090B] drop-shadow-lg" />
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-20 sm:bottom-22 backdrop-blur-sm h-1 bg-linear-to-r from-transparent via-white/10 to-transparent w-full left-1/2 -translate-x-1/2" />

        {/* Bottom shadow */}
        <div className="bg-linear-to-t from-[#09090B] via-[#09090B]/80 blur-[1em] to-[#09090B]/40 absolute bottom-16 w-full h-16" />
      </footer>
    </section>
  );
};
