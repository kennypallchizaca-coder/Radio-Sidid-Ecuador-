import { useState, useEffect, useRef, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";

const GALLERY_IMAGES = [
    { id: 1, src: "/img/image.png", alt: "Radio Sisid Ecuador en Vivo", detail: "Escúchanos en Vivo" },
    { id: 2, src: "/img/imagen2.png", alt: "Liberato Guaman, Gerente", detail: "Liberato Guaman · Gerente" },
    { id: 3, src: "/img/image3.png", alt: "Radio Sisid Ecuador", detail: "Siempre Contigo" },
];

interface CardProps {
    card: typeof GALLERY_IMAGES[0];
    index: number;
    activeIndex: number;
    totalCards: number;
}

function Card({ card, index, activeIndex, totalCards }: CardProps) {
    let offset = index - activeIndex;
    if (offset > totalCards / 2) {
        offset -= totalCards;
    } else if (offset < -totalCards / 2) {
        offset += totalCards;
    }

    const isVisible = Math.abs(offset) <= 1;

    const animate = {
        x: `${offset * 50}%`,
        scale: offset === 0 ? 1 : 0.85,
        zIndex: totalCards - Math.abs(offset),
        opacity: isVisible ? 1 : 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    };

    return (
        <motion.div
            className="absolute w-[80%] md:w-1/3 h-[90%] sm:h-[95%]"
            style={{ transformStyle: "preserve-3d" }}
            animate={animate}
            initial={false}
        >
            <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-black/40">
                <img
                    src={card.src}
                    alt={card.alt}
                    className="w-full h-full object-contain pointer-events-none"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{card.alt}</p>
                    <h4 className="text-white text-lg sm:text-xl font-bold leading-tight mt-1">{card.detail}</h4>
                </div>
            </div>
        </motion.div>
    );
}

export default function Gallery() {
    const [activeIndex, setActiveIndex] = useState(0);
    const isPausedRef   = useRef(false);
    const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoplayDelay = 4000;

    const startAutoplay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!isPausedRef.current) {
                setActiveIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
            }
        }, autoplayDelay);
    }, []);

    useEffect(() => {
        startAutoplay();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [startAutoplay]);

    const changeSlide = (newIndex: number) => {
        const safe = (newIndex + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        setActiveIndex(safe);
        startAutoplay(); // reinicia el timer desde cero
    };

    const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dragThreshold = 50;
        if (info.offset.x > dragThreshold) {
            changeSlide(activeIndex - 1);
        } else if (info.offset.x < -dragThreshold) {
            changeSlide(activeIndex + 1);
        }
    };

    return (
        <section id="galeria" aria-labelledby="gallery-title" className="py-20 sm:py-28 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-6 sm:mb-12 text-center">
                <span className="section-eyebrow justify-center">Galería</span>
                <h2 id="gallery-title" className="mt-3 font-black tracking-tighter text-base-content" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                    Nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Historia</span>
                </h2>
                <p className="mt-4 text-base-content/60 max-w-xl mx-auto text-sm sm:text-base">
                    Desliza para explorar los momentos y equipos que hacen posible la transmisión diaria de nuestra cultura y música.
                </p>
            </div>

            <div className="w-full flex-col items-center justify-center font-sans overflow-hidden">
                <div
                    className="w-full max-w-6xl mx-auto px-2 sm:px-4"
                    onMouseEnter={() => { isPausedRef.current = true; }}
                    onMouseLeave={() => { isPausedRef.current = false; }}
                    onTouchStart={() => { isPausedRef.current = true; }}
                    onTouchEnd={() => { setTimeout(() => { isPausedRef.current = false; }, 1500); }}
                >
                    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[500px] flex items-center justify-center overflow-hidden">
                        <motion.div
                            className="w-full h-full flex items-center justify-center"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={onDragEnd}
                        >
                            {GALLERY_IMAGES.map((card, index) => (
                                <Card
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    activeIndex={activeIndex}
                                    totalCards={GALLERY_IMAGES.length}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
