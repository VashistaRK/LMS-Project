import { useEffect } from "react";
import { Outlet } from "react-router";
import Header from "./components/Layouts/Header";
import Footer from "./components/Layouts/Footer";
import { Toaster } from "sonner";
import Lenis from "@studio-freight/lenis";

const App = () => {
  document.cookie = "app_session=; Max-Age=0; path=/";

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: !isTouch,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-[#09090B] font-dmsans">
      <Toaster richColors position="bottom-right" />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
