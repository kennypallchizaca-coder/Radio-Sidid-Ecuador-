import { APP_CONFIG } from "@/config";
import { SECTION_IDS } from "@/constants/routes";
import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "@/utils/scroll";

const navItems = [
  { id: "home", label: APP_CONFIG.RADIO_NAME.toUpperCase(), href: `#${SECTION_IDS.INICIO}`, internal: true },
  { id: "tunein", label: "TUNEIN", href: APP_CONFIG.TUNEIN_URL, internal: false },
  { id: "android", label: "ANDROID", href: APP_CONFIG.ANDROID_APP_URL, internal: false },
  { id: "iphone", label: "IPHONE", href: APP_CONFIG.IPHONE_APP_URL, internal: false },
] as const;

const NAV_BTN = "radio-nav-button radio-nav-sm";
const NAV_BTN_DISABLED = `${NAV_BTN} opacity-70`;

export default function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > 50) {
        // scrolling down
        setIsHidden(true);
      } else {
        // scrolling up
        setIsHidden(false);
      }
      lastScroll.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-sm transform transition-transform duration-300 ${isHidden ? "-translate-y-full" : "translate-y-0"}` }>
      <div className="mx-auto max-w-[1180px] px-3 py-3 sm:px-5">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          {APP_CONFIG.RADIO_NAME}
        </p>

        <nav aria-label="Principal" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {navItems.map((item) =>
            item.internal ? (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(SECTION_IDS.INICIO);
                }}
                className={NAV_BTN}
              >
                {item.label}
              </a>
            ) : item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={NAV_BTN}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                className={NAV_BTN_DISABLED}
                disabled
              >
                {item.label}
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
