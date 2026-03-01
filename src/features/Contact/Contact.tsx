import { APP_CONFIG, SOCIAL_CONFIG } from "@/config";
import { SECTION_IDS } from "@/constants/routes";
import type { ReactNode } from "react";

function GooglePlayIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="currentColor"/>
    </svg>
  );
}

function AppleIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-27.1-47.2-42.1-84.6-44.9-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

function StoreButton({
  href,
  topText,
  label,
  tuneIn = false,
  icon,
}: {
  href?: string;
  topText?: string;
  label: string;
  tuneIn?: boolean;
  icon?: ReactNode;
}) {
  const className = tuneIn
    ? "btn btn-neutral h-[64px] min-h-[64px] rounded-xl border border-white/25 bg-black text-[#21c8c4] hover:bg-black"
    : "btn btn-neutral h-[64px] min-h-[64px] rounded-xl border border-white/25 bg-[#2a313f] text-white hover:bg-[#2f3746]";

  const content = (
    <span className="text-center leading-none flex items-center justify-center gap-2">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>
        {topText && <span className="mb-0.5 block text-[12px] font-medium text-white/80">{topText}</span>}
        <span className={`block font-semibold ${tuneIn ? "text-[56px] scale-y-[0.68] tracking-tight" : "text-[38px] scale-y-[0.72]"}`}>
          {label}
        </span>
      </span>
    </span>
  );

  if (!href) {
    return (
      <span className={`${className} pointer-events-none opacity-80`}>
        {content}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  );
}

export default function Contact() {
  return (
    <section id={SECTION_IDS.CONTACTO} aria-labelledby="contact-title" className="px-3 py-7 sm:px-5 sm:py-9">
      <div className="mx-auto max-w-[1180px]">
        <h2 id="contact-title" className="mb-6 text-center text-4xl font-bold text-white sm:text-5xl uppercase tracking-tight">
          Contáctanos
        </h2>

        <div className="card rounded-sm border border-[#1b266c] bg-gradient-to-br from-[#0a0f2a] to-[#131a4f] shadow-[0_18px_45px_rgba(0,0,0,0.42)]">
          <div className="card-body rounded-none p-5">
            <div className="relative overflow-hidden rounded-sm border border-[#11195b] bg-gradient-to-r from-[#f6a505] via-[#f3321d] to-[#31bcf4] p-3 sm:p-4">
              <div className="absolute -left-10 -top-16 h-52 w-72 rounded-full bg-[#ff9100]/45" />
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#7438ff]/50 to-transparent" />

              <div className="relative grid items-center gap-3 sm:grid-cols-[178px_1fr] lg:grid-cols-[178px_1fr]">
                <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-[18px] border border-white/35 bg-gradient-to-b from-[#f8be2d] to-[#d67809] shadow-[0_10px_25px_rgba(0,0,0,0.35)] sm:h-[164px] sm:w-[164px]">
                  <span className="text-center text-3xl font-black uppercase leading-[0.86] text-[#1a1a1a] [text-shadow:0_2px_0_rgba(255,255,255,0.28)]">
                    Buena
                    <br />
                    Musica
                  </span>
                </div>

                <div>
                  <p className="text-center text-2xl font-black uppercase leading-[0.88] text-black sm:text-4xl lg:text-left xl:text-5xl">
                    Escuchanos en tu telefono
                  </p>
                  <p className="mt-1 text-center text-xl font-bold uppercase leading-[0.9] text-white sm:text-3xl lg:text-left xl:text-4xl">
                    Descarga es gratis y escuchanos
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <StoreButton href={APP_CONFIG.TUNEIN_URL || undefined} label="tunein" tuneIn />
                    <StoreButton
                      href={APP_CONFIG.ANDROID_APP_URL || undefined}
                      topText="Disponible en"
                      label="Google Play"
                      icon={<GooglePlayIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
                    />
                    <StoreButton
                      href={APP_CONFIG.IPHONE_APP_URL || undefined}
                      topText="Proximamente en"
                      label="App Store"
                      icon={<AppleIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {SOCIAL_CONFIG.FACEBOOK_URL && (
          <div className="mt-7 flex justify-end">
            <a
              href={SOCIAL_CONFIG.FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary h-[60px] min-h-[60px] w-full rounded-lg border border-white/20 bg-gradient-to-r from-[#355fb5] to-[#2f57aa] text-3xl font-bold text-white hover:brightness-110 flex items-center justify-center gap-2 sm:h-[78px] sm:min-h-[78px] sm:w-[270px] sm:text-4xl"
              aria-label="Facebook"
            >
              Facebook
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
