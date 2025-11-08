import { useState } from "react";
import { MarqueeDemo } from "./Marquee";

interface AccordionItemProps {
  title: string;
  content: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-t border-gray-200 py-5 cursor-pointer ${open ? "pb-6" : ""
        }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg md:text-xl text-gray-800 font-medium">
          {title}
        </span>
        <span
          className={`text-2xl transition-transform duration-300 ${open ? "rotate-45" : ""
            }`}
        >
          +
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ${open ? "max-h-60 mt-3" : "max-h-0"
          }`}
      >
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

interface SectionProps {
  header: string;
  title: string;
  description: string;
  items: { title: string; content: string }[];
  image: string;
}

const Section: React.FC<SectionProps> = ({
  header,
  title,
  description,
  items,
  image,
}) => {
  return (
    <section className="bg-[#fffff8] py-20 px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-30 items-start even:[&>.text-content]:order-2 even:[&>.image-content]:order-1">
      <div className="text-content">
        <div className="uppercase tracking-[3px] bg-zinc-800 p-2 font-bold text-lg text-white mb-3">
          {header}
        </div>
        <h2 className="text-3xl md:text-5xl bg-red-700 text-white font-serif mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
          {description}
        </p>

        {items.map((item, i) => (
          <AccordionItem key={i} title={item.title} content={item.content} />
        ))}
        {title === "Company Preparation" && (
          <a href="/companies">
            <button className="text-white px-3 py-1 text-lg bg-red-700 hover:bg-red-800/60 hover:scale-110 rounded mt-6">
              Company
            </button>
          </a>
        )}
      </div>

      <div className={`image-content ${title==="Get Placed"? "w-full":"w-8/12"} select-none relative`}>
        {title==="Get Placed"?(<MarqueeDemo/>):(<img
              src={image}
              alt={`Image for ${title}`}
              className="w-full h-full object-cover pointer-events-none object-top rounded"
            />)}
            
      </div>


    </section>
  );
};

const CareerPreparation: React.FC = () => {
  return (
    <div className="bg-gray-100">
      {/* Communication Skills */}
      <Section
        header="Career Preparation"
        title="Communication Skills"
        description="We build and activate brands through cultural insight, strategic vision, and the power of emotion across every element of its expression."
        items={[
          {
            title: "Verbal Communication",
            content:
              "Master the art of speaking confidently in meetings, presentations, and interviews. Learn to articulate your thoughts clearly and professionally in any business setting.",
          },
          {
            title: "Written Communication",
            content:
              "Craft professional emails, reports, and documentation that effectively convey your message and maintain professional standards.",
          },
          {
            title: "Interpersonal Skills",
            content:
              "Build rapport and work effectively in teams. Develop the ability to collaborate, empathize, and create positive working relationships.",
          },
        ]}
        image = "images/Verbal Communication.png"
      />

      {/* Logical Skills */}
      <Section
        header="Analytical Thinking"
        title="Logical Skills and Aptitude"
        description="Develop critical reasoning abilities through comprehensive training in quantitative, logical, and verbal aptitude to excel in competitive assessments."
        items={[
          {
            title: "Quantitative Aptitude",
            content:
              "Master numerical reasoning, data interpretation, percentages, ratios, and mathematical problem-solving under time constraints.",
          },
          {
            title: "Logical Reasoning",
            content:
              "Enhance pattern recognition, sequence analysis, and analytical thinking through structured puzzle-solving techniques.",
          },
          {
            title: "Problem Solving",
            content:
              "Learn systematic approaches to break down complex challenges into manageable components for efficient solutions.",
          },
        ]}
        image = "images/Quantitative Aptitude.png"
      />

      {/* Technical Skills */}
      <Section
        header="Technical Expertise"
        title="Technical Skills Development"
        description="Build comprehensive technical capabilities across programming, databases, and modern development tools to meet industry demands."
        items={[
          {
            title: "Programming Fundamentals",
            content:
              "Learn essential programming languages including Python, JavaScript, and Java with focus on clean code practices and efficient algorithms.",
          },
          {
            title: "Data Structures & Algorithms",
            content:
              "Master fundamental data structures and algorithmic thinking for optimal problem-solving in technical interviews.",
          },
          {
            title: "Web Technologies",
            content:
              "Develop proficiency in HTML, CSS, modern frameworks, and API integration for full-stack development capabilities.",
          },
        ]}
        image = "images/technical.jpg"
      />

      {/* Company Preparation */}
      <Section
        header="Target Preparation"
        title="Company Preparation"
        description="Comprehensive research and strategic preparation for your target organizations, understanding culture, processes, and expectations."
        items={[
          {
            title: "Company Research",
            content:
              "Deep dive into industry positioning, products, services, recent developments, and organizational structure of potential employers.",
          },
          {
            title: "Interview Process",
            content:
              "Understand company-specific interview rounds, assessment criteria, and preparation strategies for each stage.",
          },
          {
            title: "Culture Fit",
            content:
              "Analyze organizational values, work environment, and team dynamics to align your approach with company expectations.",
          },
        ]}
        image = "images/company.jpg"
      />

      {/* Get Placed */}
      <Section
        header="Placement Success"
        title="Get Placed"
        description="Complete end-to-end guidance from application to offer acceptance, maximizing your opportunities for career success."
        items={[
          {
            title: "Resume & Portfolio",
            content:
              "Create ATS-friendly resumes and compelling portfolios that effectively showcase your skills and achievements to recruiters.",
          },
          {
            title: "Interview Mastery",
            content:
              "Comprehensive preparation for technical, HR, and behavioral interviews with mock sessions and expert feedback.",
          },
          {
            title: "Offer Negotiation",
            content:
              "Learn to evaluate and negotiate job offers effectively, understanding compensation packages and making informed career decisions.",
          },
        ]}
        image = ""
      />
    </div>
  );
};

export default CareerPreparation;
