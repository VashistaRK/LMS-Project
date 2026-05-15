import { Twitter, Linkedin, Github, Mail, GraduationCap } from "lucide-react";
import { AnimatedFooter } from "@/components/ui/modem-animated-footer";

const socialLinks = [
  { icon: <Twitter className="w-6 h-6" />, href: "https://twitter.com", label: "Twitter" },
  { icon: <Linkedin className="w-6 h-6" />, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: <Github className="w-6 h-6" />, href: "https://github.com", label: "GitHub" },
  { icon: <Mail className="w-6 h-6" />, href: "mailto:info@sunadhtechnologies.in", label: "Email" },
];

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Companies", href: "/companies" },
  { label: "Practice", href: "/freshers-pratice" },
  { label: "Resumes", href: "/resumes" },
  { label: "Careers", href: "/carrer-guidance" },
  { label: "Jobs Portal", href: "https://jobs.fresherready.com/" },
];

const Footer = () => {
  return (
    <AnimatedFooter
      brandName="FresherReady"
      brandDescription="Your one-stop placement preparation platform. Master coding, ace aptitude, and land your dream job."
      socialLinks={socialLinks}
      navLinks={navLinks}
      creatorName="Sunadh Technologies"
      creatorUrl="https://sunadhtechnologies.in"
      brandIcon={
        <GraduationCap className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-[#09090B] drop-shadow-lg" />
      }
    />
  );
};

export default Footer;
