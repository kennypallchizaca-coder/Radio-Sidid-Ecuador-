import { useState } from "react";
import { APP_CONFIG } from "@/config";
import { NAV_ITEMS } from "@/constants/routes";
import { scrollToSection } from "@/utils/scroll";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  Headphones,
  MessageCircle,
  Facebook,
  Smartphone,
  Radio,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  activeSection: string;
}

// Configuración de íconos con colores únicos por sección
const NAV_ICON_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  inicio:      { icon: Home,           color: "text-sky-500",    bg: "bg-sky-500/10"    },
  escuchanos:  { icon: Headphones,     color: "text-violet-500", bg: "bg-violet-500/10" },
  contacto:    { icon: MessageCircle,  color: "text-emerald-500",bg: "bg-emerald-500/10"},
  facebook:    { icon: Facebook,       color: "text-blue-500",   bg: "bg-blue-500/10"   },
  nuestra_app: { icon: Smartphone,     color: "text-pink-500",   bg: "bg-pink-500/10"   },
};

const DEFAULT_ICON_CONFIG = { icon: Home, color: "text-sky-500", bg: "bg-sky-500/10" };

export default function Header({ activeSection }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string, isExternal?: boolean, url?: string) => {
    if (isExternal && url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setIsMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.header
      className="sticky top-0 w-full z-50 bg-black text-neutral-content border-b border-white/10 shadow-lg"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      {/* ── Fila principal: 3 columnas — logo | nav | controles ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">

        {/* ── Col 1: Logo + branding + EN VIVO ──────────────────── */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          <a
            href="#inicio"
            onClick={(e) => { e.preventDefault(); handleNavClick("inicio"); }}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300 group-hover:scale-105">
              <img
                src={APP_CONFIG.LOGO_URL || "/logoradio.jpg"}
                alt={`Logo ${APP_CONFIG.RADIO_NAME}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
                {APP_CONFIG.RADIO_NAME}
              </span>
              <span className="text-[10px] text-neutral-content/50 font-medium tracking-wide whitespace-nowrap">
                {APP_CONFIG.SLOGAN}
              </span>
            </div>
          </a>

        </motion.div>

        {/* ── Col 2: Nav centrada (solo escritorio) ─────────────── */}
        <nav className="hidden lg:flex items-center justify-center gap-1">
          {NAV_ITEMS.map((item, i) => {
            const cfg      = NAV_ICON_CONFIG[item.id] ?? DEFAULT_ICON_CONFIG;
            const Icon     = cfg.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.isExternal, item.url)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold
                  transition-colors duration-200 group whitespace-nowrap overflow-hidden
                  ${isActive ? cfg.color : "text-neutral-content/70 hover:text-neutral-content"}
                `}
              >
                {/* Pill de fondo deslizante (layoutId anima entre ítems) */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className={`absolute inset-0 rounded-xl ${cfg.bg}`}
                    style={{ zIndex: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Hover background para ítems inactivos */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl bg-neutral-content/0 group-hover:bg-neutral-content/10 transition-colors duration-200" />
                )}

                {/* Contenido sobre el pill */}
                <span className={`relative z-10 transition-colors duration-200 ${isActive ? cfg.color : `group-hover:${cfg.color}`}`}>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="relative z-10 tracking-wide">{item.label}</span>

                {/* Subrayado inferior animado */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full ${cfg.color.replace("text-", "bg-")}`}
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* ── Col 3: Controles ────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-2 justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >

          {/* Ícono de radio decorativo — solo escritorio grande */}
          <div className="hidden xl:flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
            <Radio size={16} className="text-primary" strokeWidth={2} />
          </div>

          {/* Botón hamburguesa mobile */}
          <button
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-content/10 border border-neutral-content/10 hover:bg-neutral-content/20 transition-all duration-200"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} className="text-neutral-content/80" />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={18} className="text-neutral-content/80" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>

          {/* ── Menú mobile ─────────────────────────────────────── */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden lg:hidden"
              >
                <div className="px-4 sm:px-6 lg:px-8 pb-4 pt-1 border-t border-neutral-content/10">
                  {/* Indicador EN VIVO mobile */}
                  <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-full bg-error/10 border border-error/20 w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
                    </span>
                    <span className="text-[11px] font-bold text-error uppercase tracking-widest">En vivo</span>
                  </div>

                  <nav className="grid grid-cols-2 gap-2">
                    {NAV_ITEMS.map((item, i) => {
                      const cfg    = NAV_ICON_CONFIG[item.id] ?? DEFAULT_ICON_CONFIG;
                      const Icon   = cfg.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleNavClick(item.id, item.isExternal, item.url)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                          whileTap={{ scale: 0.97 }}
                          className={`
                            relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold
                            overflow-hidden transition-colors duration-200
                            ${isActive ? cfg.color : "text-neutral-content/65 hover:text-neutral-content"}
                          `}
                        >
                          {/* Pill deslizante mobile */}
                          {isActive && (
                            <motion.span
                              layoutId="mob-nav-pill"
                              className={`absolute inset-0 rounded-xl ${cfg.bg}`}
                              style={{ zIndex: 0 }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          {!isActive && (
                            <span className="absolute inset-0 rounded-xl bg-neutral-content/0 hover:bg-neutral-content/8 transition-colors duration-200" />
                          )}
                          <span className={`relative z-10 p-1.5 rounded-lg ${cfg.bg}`}>
                            <Icon size={16} className={cfg.color} strokeWidth={isActive ? 2.5 : 2} />
                          </span>
                          <span className="relative z-10">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </motion.header>
  );
}
