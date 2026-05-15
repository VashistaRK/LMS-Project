import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DarkGradientBgProps {
  children?: React.ReactNode
  className?: string
}

const STREAKS = [
  {
    id: 'a',
    mask: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
    duration: 6,
    delay: 0,
  },
  {
    id: 'b',
    mask: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
    duration: 8,
    delay: 1.2,
  },
  {
    id: 'c',
    mask: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)',
    duration: 7,
    delay: 2.4,
  },
  {
    id: 'd',
    mask: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)',
    duration: 9,
    delay: 0.6,
  },
  {
    id: 'e',
    mask: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)',
    duration: 10,
    delay: 1.8,
  },
]

export function DarkGradientBg({ children, className }: Readonly<DarkGradientBgProps>) {
  return (
    <div
      className={cn("relative min-h-screen w-full bg-black overflow-hidden", className)}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: 'radial-gradient(100% 100% at 0% 0%, rgb(46, 46, 46) 0%, rgb(0, 0, 0) 100%)',
            maskImage: 'radial-gradient(150% 120% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 0) 100%)',
            WebkitMaskImage: 'radial-gradient(150% 120% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 0) 100%)',
          }}
        >
          {STREAKS.map((s) => (
            <motion.div
              key={s.id}
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(rgb(0, 207, 255) 0%, rgba(0, 207, 255, 0) 100%)',
                maskImage: s.mask,
                WebkitMaskImage: s.mask,
              }}
              initial={{ opacity: 0.7, skewX: '40deg', x: '-3%' }}
              animate={{
                opacity: [0.7, 1, 0.75, 0.95, 0.7],
                skewX: ['40deg', '48deg', '42deg', '50deg', '40deg'],
                x: ['-3%', '3%', '-1%', '4%', '-3%'],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-5 bg-repeat"
        style={{
          backgroundImage: 'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
          backgroundSize: '149.76px',
        }}
      />

      {/* Subtle dot pattern overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
        animate={{ opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle radial highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
