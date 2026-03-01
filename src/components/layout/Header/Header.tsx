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

        <nav aria-label="Principal" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {navItems.map((item) =>
            item.internal ? (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(SECTION_IDS.INICIO);
                }}
                className="radio-nav-button !min-h-[2.65rem] !rounded-md !border-[#2c68d9] !bg-gradient-to-r !from-[#0a2f86] !to-[#144fb3] !px-2 !text-xs !leading-none sm:!text-sm"
              >
                {item.label}
              </a>
            ) : item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="radio-nav-button !min-h-[2.65rem] !rounded-md !border-[#2c68d9] !bg-gradient-to-r !from-[#0a2f86] !to-[#144fb3] !px-2 !text-xs !leading-none sm:!text-sm"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                className="radio-nav-button !min-h-[2.65rem] !rounded-md !border-[#2c68d9] !bg-gradient-to-r !from-[#0a2f86] !to-[#144fb3] !px-2 !text-xs !leading-none opacity-70 sm:!text-sm"
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
