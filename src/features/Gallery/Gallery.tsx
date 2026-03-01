import { useEffect, useState } from "react";
import { SECTION_IDS } from "@/constants/routes";

const SECOND_CARD_IMAGES = [
  { src: "public/img/bienvenidos.png", alt: "Imagen promocional 3" },
  { src: "public/img/iglesia.jpg", alt: "Imagen promocional 4" },
]

export default function Gallery() {
  const [secondIndex, setSecondIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondIndex((prev) => (prev + 1) % SECOND_CARD_IMAGES.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id={SECTION_IDS.GALERIA} aria-label="Galeria" className="px-3 py-4 sm:px-5 sm:py-5 min-h-[480px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
            <img
              src="/img/imagen2.png"
              alt="Imagen promocional 1"
              className="h-[420px] w-full rounded-md object-cover object-center sm:h-[520px]"
              loading="lazy"
            />
          </article>

          <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
            <div className="relative h-[420px] w-full overflow-hidden rounded-md sm:h-[520px]">
              {SECOND_CARD_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
                    index === secondIndex ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
