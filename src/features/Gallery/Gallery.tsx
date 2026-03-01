import { useEffect, useState } from "react";
import { SECTION_IDS } from "@/constants/routes";
import imagen2Src from "@/assets/img/imagen2.png";
import foto1Src from "@/assets/img/foto1.png";
import foto2Src from "@/assets/img/foto2.png";
import bienvenidosSrc from "@/assets/img/bienvenidos.png";
import iglesiaSrc from "@/assets/img/iglesia.jpg";
import iglesia2Src from "@/assets/img/iglesia2.png";

const FIRST_CARD_IMAGES = [
  { src: foto1Src, alt: "Imagen promocional 1" },
  { src: foto2Src, alt: "Imagen promocional 2" },
  { src: imagen2Src, alt: "Imagen promocional 3" },
];

const SECOND_CARD_IMAGES = [
  { src: bienvenidosSrc, alt: "Bienvenidos a Radio Sisid" },
  { src: iglesiaSrc, alt: "Iglesia del pueblo cañari" },
  { src: iglesia2Src, alt: "Iglesia cañari vista panorámica" },
];

export default function Gallery() {
  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(0);

  useEffect(() => {
    const t1 = window.setInterval(() => {
      setFirstIndex((prev) => (prev + 1) % FIRST_CARD_IMAGES.length);
    }, 3500);
    const t2 = window.setInterval(() => {
      setSecondIndex((prev) => (prev + 1) % SECOND_CARD_IMAGES.length);
    }, 3000);
    return () => { window.clearInterval(t1); window.clearInterval(t2); };
  }, []);

  return (
    <section id={SECTION_IDS.GALERIA} aria-label="Galeria" className="px-3 py-4 sm:px-5 sm:py-5 min-h-[300px] sm:min-h-[560px] lg:min-h-[540px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
            <div className="relative w-full overflow-hidden rounded-md min-h-[250px] sm:h-[520px] lg:h-[520px]">
              {FIRST_CARD_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-500 sm:object-cover ${
                    index === firstIndex ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                />
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
            <div className="relative w-full overflow-hidden rounded-md min-h-[250px] sm:h-[520px] lg:h-[520px]">
              {SECOND_CARD_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-500 sm:object-cover ${
                    index === secondIndex ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                />
              ))}

              {/* navigation arrows */}
              <button
                onClick={() => setSecondIndex((secondIndex - 1 + SECOND_CARD_IMAGES.length) % SECOND_CARD_IMAGES.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                onClick={() => setSecondIndex((secondIndex + 1) % SECOND_CARD_IMAGES.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Siguiente"
              >
                ›
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
