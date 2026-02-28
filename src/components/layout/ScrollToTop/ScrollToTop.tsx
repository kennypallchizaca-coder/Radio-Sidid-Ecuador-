import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { scrollToSection } from "@/utils/scroll";
import { SECTION_IDS } from "@/constants/routes";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Aparece después de 400px de scroll
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const handleScrollToTop = () => {
        scrollToSection(SECTION_IDS.GALERIA);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{
                        scale: 1.1,
                        translateY: -5,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        borderColor: "rgba(255, 255, 255, 0.4)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleScrollToTop}
                    className="fixed bottom-24 right-5 sm:right-8 z-[60] flex items-center justify-center w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group"
                    title="Volver arriba"
                    aria-label="Volver arriba"
                >
                    <ChevronUp className="w-6 h-6 group-hover:animate-bounce-subtle" />

                    {/* Decorative gradients */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-yellow-500/10 via-blue-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
