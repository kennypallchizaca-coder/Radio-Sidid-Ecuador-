import { SOCIAL_CONFIG, getWhatsAppUrl } from "@/config";
import { motion } from "framer-motion";

/* ── Íconos SVG compactos ──────────────────────────────────── */
const Icon = ({ children, size = 22 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
);

const IconWhatsApp = () => <Icon><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></Icon>;
const IconFacebook = () => <Icon><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></Icon>;
const IconYouTube = () => <Icon><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></Icon>;
const IconInstagram = () => <Icon><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></Icon>;

/* ── Retro helpers ─────────────────────────────────────────── */
const retroShadow = "shadow-[5px_5px_0_#000]";
const retroShadowHover = "hover:shadow-[7px_7px_0_#000]";

/* ── Datos de cards ────────────────────────────────────────── */
const CARDS = [
  {
    name: "Facebook",
    href: SOCIAL_CONFIG.FACEBOOK_URL,
    color: "#1877F2",
    bg: "bg-[#1877F2]",
    labelBg: "bg-blue-400",
    icon: <IconFacebook />,
    cta: "VISITAR PÁGINA",
    desc: "Transmisiones en vivo y eventos",
  },
  {
    name: "Instagram",
    href: SOCIAL_CONFIG.INSTAGRAM_URL,
    color: "#E1306C",
    bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    labelBg: "bg-pink-400",
    icon: <IconInstagram />,
    cta: "VER PERFIL",
    desc: "Fotos, historias y momentos",
  },
  {
    name: "YouTube",
    href: SOCIAL_CONFIG.YOUTUBE_URL,
    color: "#FF0000",
    bg: "bg-[#FF0000]",
    labelBg: "bg-red-400",
    icon: <IconYouTube />,
    cta: "VER CANAL",
    desc: "Videos y transmisiones en vivo",
  },
  {
    name: "WhatsApp",
    href: getWhatsAppUrl(),
    color: "#25D366",
    bg: "bg-[#25D366]",
    labelBg: "bg-emerald-400",
    icon: <IconWhatsApp />,
    cta: "ENVIAR MENSAJE",
    desc: SOCIAL_CONFIG.WHATSAPP_DISPLAY,
  },
];

export default function Contact() {
  return (
    <section
      id="contacto"
      aria-labelledby="contact-title"
      className="py-20 sm:py-28 relative overflow-hidden font-mono"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">

        {/* ── Header retro ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2
            id="contact-title"
            className={`inline-block text-2xl sm:text-4xl font-black text-gray-900 bg-amber-400 px-6 py-3 border-4 border-gray-900 rounded-lg ${retroShadow} uppercase tracking-wider`}
          >
            Conéctate
          </h2>
          <p className={`mt-5 inline-block text-sm sm:text-base font-bold text-white bg-pink-500 px-4 py-2 border-2 border-gray-900 rounded-sm ${retroShadow}`}>
            Síguenos, escríbenos o llámanos
          </p>
        </motion.div>

        {/* ── 4 cards retro grid (2×2) ────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {CARDS.map((card, i) => (
            <motion.a
              key={card.name}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`group relative border-3 sm:border-4 border-gray-900 rounded-xl bg-gray-100 shadow-[3px_3px_0_#000] sm:${retroShadow} hover:shadow-[5px_5px_0_#000] sm:${retroShadowHover} transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] active:shadow-[2px_2px_0_#000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2`}
            >
              {/* Icon container + Tag label */}
              <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg border-3 sm:border-4 border-gray-900 ${card.bg} flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_#000] sm:${retroShadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                    <span className={`${card.labelBg} text-gray-900 font-black text-[9px] sm:text-[11px] uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 border sm:border-2 border-gray-900 rounded-sm`}>
                      {card.name}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[10px] sm:text-xs font-semibold truncate">{card.desc}</p>
                </div>
              </div>

              {/* CTA bar */}
              <div
                className="border-t-3 sm:border-t-4 border-gray-900 px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between rounded-b-[8px] transition-colors duration-300"
                style={{ background: `${card.color}18` }}
              >
                <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-gray-900">
                  {card.cta}
                </span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 group-hover:translate-x-1.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
