import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/config";
import { SECTION_IDS } from "@/constants/routes";
import bannerDefault from "@/assets/img/bannernuevo.png";
import djGato from "@/assets/img/djgato.png";

const SLIDES = [bannerDefault, djGato];
const INTERVAL_MS = 4500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setVisible(true);
      }, 350);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const bannerSrc = APP_CONFIG.BANNER_IMAGE_URL || SLIDES[index];

  return (
    <section
      id={SECTION_IDS.INICIO}
      aria-label={`Bienvenida a ${APP_CONFIG.RADIO_NAME}`}
      className="px-3 pt-4 sm:px-5"
    >
      <div className="mx-auto max-w-[1180px]">
        <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
          <div className="rounded-xl border-[10px] border-[#d50000] bg-[#d50000] p-0.5 sm:border-[12px] sm:p-0.5">
            <div className="overflow-hidden rounded-md border-[3px] border-[#ffcc00] bg-black">
              <img
                src={bannerSrc}
                alt={`Banner principal ${APP_CONFIG.RADIO_NAME}`}
                className="h-auto w-full object-contain object-center sm:h-[270px] sm:object-cover md:h-[320px]"
                loading="eager"
                style={{
                  transform: "scale(1.08, 1.06)",
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.35s ease-in-out",
                  objectPosition: index === 1 ? "center 20%" : "center center",
                }}
              />
            </div>
          </div>

        </article>
      </div>
    </section>
  );
}
