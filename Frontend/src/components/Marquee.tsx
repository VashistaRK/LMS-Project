import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const companies = [
  {
    name: "Accenture",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
  },
  {
    name: "Tata Consultancy Services (TCS)",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b1/Tata_Consultancy_Services.svg",
  },
  {
    name: "Cognizant",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
  },
  {
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Wipro_new_logo.svg",
  },
  {
    name: "Capgemini",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7c/Capgemini_New_logo.svg",
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
  {
    name: "Tech Mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/32/TM_Logo_Color_Pos_RGB.svg",
  },
  {
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
  },
  {
    name: "HCLTech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/HCLTech-new-logo.svg",
  },
];

const firstRow = companies.slice(0, companies.length / 2);
const secondRow = companies.slice(companies.length / 2);

const CompanyCard = ({ logo, name }: { logo: string; name: string }) => {
  return (
    <div
      className={cn(
        "relative flex h-20 w-40 sm:w-48 md:w-56 md:p-8 items-center justify-center rounded-xl border",
        "border-gray-950/[.1] bg-[#fff8f8] hover:bg-gray-100",
        "dark:border-gray-50/[.1] dark:bg-gray-900/70 dark:hover:bg-gray-800/90",
        "transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
      )}
    >
      <img
        src={logo}
        alt={name}
        className="object-contain max-h-10 sm:max-h-12 md:max-h-14 grayscale hover:grayscale-0 transition-all duration-300"
      />
    </div>
  );
};

export function CompanyMarquee() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden py-6 sm:py-10 dark:bg-red-950">

      {/* First row - Reverse direction */}
      <Marquee reverse pauseOnHover className="marquee [--duration:40s]">
        <div className="marquee-content flex gap-4 sm:gap-6">
          {firstRow.map((company) => (
            <CompanyCard key={company.name} {...company} />
          ))}
        </div>
      </Marquee>

      {/* Second row - Normal direction */}
      <Marquee pauseOnHover className="marquee [--duration:30s] mt-3 sm:mt-4">
        <div className="marquee-content flex gap-4 sm:gap-6">
          {secondRow.map((company) => (
            <CompanyCard key={company.name} {...company} />
          ))}
        </div>
      </Marquee>

      {/* gradient fade on edges */}
      <div className="from-[#fffff8] dark:from-gray-950 pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-1/5 bg-gradient-to-r"></div>
      <div className="from-[#fffff8] dark:from-gray-950 pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-1/5 bg-gradient-to-l"></div>
    </section>
  );
}
