import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bgColors = ["#FFF7ED", "#FFF7ED", "#FFF7ED"];

const archInfo = [
  {
    id: "green",
    title: "Role‑Based Training by Certified Trainers",
    desc: "Learn from certified, industry‑experienced mentors using a role‑based approach that mirrors real project workflows and responsibilities. Our LMS features personalized learning paths for Frontend Developer, Backend Engineer, Full-Stack Developer, Data Scientist, Cloud Architect, and Cybersecurity Specialist roles, with curriculum designed by industry experts from top tech companies.",
    color: "#D5FF37",
    img: "images/Arch4.png",
  },
  {
    id: "blue",
    title: "Live Projects and Practical Labs",
    desc: "Work on live, production‑style projects with hands‑on labs so you build portfolio‑ready artifacts and job‑relevant confidence. Our LMS includes 50+ guided projects, interactive coding environments, real-time collaboration tools, and automated code review systems that simulate professional development workflows.",
    color: "#7DD6FF",
    img: "images/Arch3.png",
  },
  {
    id: "pink",
    title: "Certification and Placement Support",
    desc: "Earn recognized certifications and get placement support with interview prep, resume reviews, and access to hiring partners. Our LMS provides industry-recognized certificates, mock interview platforms with AI feedback, resume optimization tools, and direct connections to 500+ hiring partners including FAANG companies and startups.",
    color: "#FFA0B0",
    img: "images/Arch2.png",
  },
  {
    id: "orange",
    title: "Flexible, Affordable Learning Options",
    desc: "Choose online or classroom sessions, convenient schedules, and industry‑aligned curricula—without compromising on quality. Our LMS offers self-paced learning, live instructor-led sessions, mobile app access, lifetime content updates, and flexible payment plans starting from $9/month with money-back guarantee.",
    color: "#FFA17B",
    img: "images/Arch1.png",
  },
];

export default function ArchSection() {
  const archRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const imgs = gsap.utils.toArray<HTMLImageElement>(".img-wrapper img");

    ScrollTrigger.matchMedia({
      "(min-width: 769px)": function () {
        const mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".arch",
            start: "top top",
            end: "bottom bottom",
            pin: ".arch__right",
            scrub: true,
          },
        });

        gsap.set(imgs, {
          clipPath: "inset(0)",
          objectPosition: "0px 0%",
        });

        imgs.forEach((currentImage, index) => {
          const nextImage = imgs[index + 1] ? imgs[index + 1] : null;

          const sectionTimeline = gsap.timeline();

          if (nextImage) {
            sectionTimeline
              .to(
                "body",
                {
                  backgroundColor: bgColors[index],
                  duration: 1.5,
                  ease: "power2.inOut",
                },
                0
              )
              .to(
                currentImage,
                {
                  clipPath: "inset(0px 0px 100%)",
                  objectPosition: "0px 60%",
                  duration: 1.5,
                  ease: "none",
                },
                0
              )
              .to(
                nextImage,
                {
                  objectPosition: "0px 40%",
                  duration: 1.5,
                  ease: "none",
                },
                0
              );
          }

          mainTimeline.add(sectionTimeline);
        });
      },
      "(max-width: 768px)": function () {
        gsap.set(imgs, {
          objectPosition: "0px 60%",
        });

        imgs.forEach((image, index) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: image,
                start: "top-=70% top+=50%",
                end: "bottom+=200% bottom",
                scrub: true,
              },
            })
            .to(image, {
              objectPosition: "0px 30%",
              duration: 5,
              ease: "none",
            })
            .to("body", {
              backgroundColor: bgColors[index],
              duration: 1.5,
              ease: "power2.inOut",
            });
        });
      },
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap");

        body {
          color: #121212;
          font-family: "Outfit", sans-serif;
          background-color: #f9ffe7;
        }
        
        .container {
        }

        .spacer {
          width: 100%;
          height: 30vh;
        }

        .arch {
          display: flex;
          gap: 30px;
          justify-content: space-between;
          margin-inline: auto;
          max-width: 1200px;
        }

        .arch__left {
          display: flex;
          flex-direction: column;
        }

        .arch__info {
          max-width: 480px;
          height: 100vh;
          display: grid;
          place-items: center;
        }

        .arch__info h2 {
          font-family: serif;
          font-size: 48px;
          font-weight: 500;
          margin-bottom: 24px;
          letter-spacing: -0.84px;
        }

        .arch__info p {
          color: rgba(18, 18, 18, 0.8);
          font-size: 18px;
          letter-spacing: -0.54px;
          margin-block: 6px 28px;
          line-height: 1.625;
        }

        .arch__info a {
          text-decoration: none;
          padding: 16px 18px;
          color: inherit;
          border-radius: 40px;
          display: flex;
          gap: 4px;
          width: fit-content;
          align-items: center;
        }

        .arch__right {
          flex-shrink: 1;
          height: 100vh;
          width: 100%;
          max-width: 540px;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .img-wrapper {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          height: 400px;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
        }

        .img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        @media (max-width: 900px) {
          .arch {
            gap: 30px;
          }
          .arch__left {
            margin-left:0px;
          }
        }

        @media (max-width: 768px) {
          .arch {
            flex-direction: column;
            gap: 20px;
          }
            .arch__left {
            margin-left:0px;
          }

          .arch__left,
          .arch__right {
            display: contents;
          }

          .arch__right {
            height: auto;
            max-width: 100%;
          }

          .arch__right .img-wrapper {
            position: static;
            transform: none;
            height: 360px;
            width: 100%;
            margin-bottom: 20px;
          }

          .arch__left .arch__info {
            height: auto;
            padding: 20px 0;
          }
        }

        @media (max-width: 560px) {
          .arch {
            gap: 12px;
          }
            .arch__left {
            margin-left:0px;
          }

          .container {
            padding: 10px;
          }

          .arch__right .img-wrapper {
            border-radius: 10px;
            height: 280px;
          }
        }
      `}</style>

      <div className="container">
        {/* <div className="spacer"></div> */}

        <div className="arch" ref={archRef}>
          <div className="arch__left">
            {archInfo.map((item, index) => (
              <div
                key={item.id}
                className="arch__info"
                id={`${item.id}-arch`}
                style={{ order: index * 2 }}
              >
                <div className="content">
                  <h2>{item.title}</h2>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="arch__right">
            {archInfo
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={item.id}
                  className="img-wrapper"
                  data-index={archInfo.length - index}
                  style={{
                    zIndex: archInfo.length - index,
                    order: index * 2 + 1,
                  }}
                >
                  <img src={item.img} alt={item.title} />
                </div>
              ))}
          </div>
        </div>

        {/* <div className="spacer"></div> */}
      </div>
    </>
  );
}
