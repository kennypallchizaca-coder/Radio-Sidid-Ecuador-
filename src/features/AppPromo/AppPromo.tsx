import { APP_CONFIG } from "@/config";
import { motion } from "framer-motion";

const IconApple = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

const IconGooglePlay = () => (
    <svg width="22" height="24" viewBox="0 0 512 512" aria-hidden="true">
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="currentColor" />
    </svg>
);

const IconSignal = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8" />
    </svg>
);

const IconMic = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" />
    </svg>
);

const IconBell = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

export default function AppPromo() {
    return (
        <section
            id="nuestra_app"
            aria-labelledby="app-promo-title"
            className="py-20 sm:py-28 relative overflow-hidden"
        >
            {/* Decorativo de fondo */}
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-primary/3 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

            <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Columna de texto */}
                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <span className="section-eyebrow mb-4">Aplicación móvil</span>

                        <h2
                            id="app-promo-title"
                            className="font-black tracking-tighter text-base-content leading-[1.1] mb-5"
                            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}
                        >
                            Lleva la radio <br />
                            <span className="bg-gradient-to-r from-yellow-500 via-blue-400 to-red-400 bg-clip-text text-transparent">
                                en tu bolsillo
                            </span>
                        </h2>

                        <p className="text-base-content/60 text-base sm:text-lg leading-relaxed max-w-md mb-8 sm:mb-10">
                            Descarga la app oficial de {APP_CONFIG.RADIO_NAME} con transmisión en vivo y notificaciones de tus programas favoritos.
                        </p>

                        {/* Caracteristicas previas */}
                        <ul className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 list-none" role="list">
                            {[
                                { icon: <IconSignal />, text: "Transmision en vivo" },
                                { icon: <IconMic />, text: "Podcasts exclusivos" },
                                { icon: <IconBell />, text: "Notificaciones" },
                            ].map((feat) => (
                                <li key={feat.text} className="flex items-center gap-2 text-sm font-medium text-base-content/70">
                                    <span className="text-primary">{feat.icon}</span>
                                    {feat.text}
                                </li>
                            ))}
                        </ul>

                        {/* Botones de tienda */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                disabled
                                aria-disabled="true"
                                aria-label="Próximamente en App Store"
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-base-content text-base-100 opacity-40 cursor-not-allowed select-none"
                            >
                                <IconApple />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] uppercase font-semibold opacity-70 tracking-wider">Próximamente en</span>
                                    <span className="font-bold text-base">App Store</span>
                                </div>
                            </button>

                            <a
                                href="https://play.google.com/store/apps/details?id=com.radiosisidecuador.host"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Descargar en Google Play"
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-base-content text-base-100 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <IconGooglePlay />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] uppercase font-semibold opacity-70 tracking-wider">Descargar en</span>
                                    <span className="font-bold text-base">Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Mockup del telefono */}
                    <div className="flex-shrink-0 hidden sm:flex justify-center items-center relative">
                        {/* Glow ambient */}
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 pointer-events-none" aria-hidden="true" />

                        <motion.div
                            initial={{ y: 100, opacity: 0, rotate: 5 }}
                            whileInView={{ y: 0, opacity: 1, rotate: -5 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                            whileHover={{ rotate: 0, scale: 1.05 }}
                            className="relative w-56 h-[480px] rounded-[2.8rem] border-[6px] border-base-content/20 bg-black shadow-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Notch */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-20" aria-hidden="true" />

                            {/* Contenido de pantalla simulado */}
                            <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-neutral-900 to-black z-10">
                                {/* Status bar */}
                                <div className="flex justify-between items-center px-5 pt-3 pb-1 text-white/50 text-[10px] font-bold">
                                    <span>9:41</span>
                                    <div className="flex gap-1 items-center">
                                        <span>●●●</span>
                                    </div>
                                </div>

                                {/* Radio logo area */}
                                <div className="flex flex-col items-center pt-8 px-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-lg shadow-black/40 mb-3">
                                        <img
                                            src={APP_CONFIG.LOGO_URL || "/logoradio.jpg"}
                                            alt={`Logo ${APP_CONFIG.RADIO_NAME}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-white font-bold text-base text-center">{APP_CONFIG.RADIO_NAME}</h3>
                                    <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">En vivo</p>
                                </div>

                                {/* Ecualizador animado */}
                                <div className="flex justify-center items-end gap-1 h-8 mt-6 px-8">
                                    {[40, 70, 55, 85, 60, 75, 45, 90, 50, 65].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 rounded-full bg-gradient-to-t from-red-600 to-red-300 animate-equalizer"
                                            style={{
                                                height: `${h}%`,
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                                            }}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>

                                {/* Player controls */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/60 backdrop-blur-lg border-t border-white/10">
                                    <div className="flex justify-center items-center gap-6 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white/60 rounded-sm" />
                                        </div>
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/50">
                                            <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <div className="flex gap-0.5">
                                                <div className="w-1 h-3 bg-white/60 rounded-sm" />
                                                <div className="w-1 h-3 bg-white/60 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full">
                                        <div className="w-1/3 h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
