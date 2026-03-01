import { APP_CONFIG, SOCIAL_CONFIG } from "@/config";
import { SECTION_IDS } from "@/constants/routes";

function StoreButton({
  href,
  topText,
  label,
  tuneIn = false,
}: {
  href?: string;
  topText?: string;
  label: string;
  tuneIn?: boolean;
}) {
  const className = tuneIn
    ? "btn btn-neutral h-[64px] min-h-[64px] rounded-xl border border-white/25 bg-black text-[#21c8c4] hover:bg-black"
    : "btn btn-neutral h-[64px] min-h-[64px] rounded-xl border border-white/25 bg-[#2a313f] text-white hover:bg-[#2f3746]";

  const content = (
    <span className="text-center leading-none">
      {topText && <span className="mb-0.5 block text-[12px] font-medium text-white/80">{topText}</span>}
      <span className={`block font-semibold ${tuneIn ? "text-[56px] scale-y-[0.68] tracking-tight" : "text-[38px] scale-y-[0.72]"}`}>
        {label}
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

              <div className="relative grid items-center gap-3 lg:grid-cols-[178px_1fr]">
                <div className="mx-auto flex h-[164px] w-[164px] items-center justify-center rounded-[18px] border border-white/35 bg-gradient-to-b from-[#f8be2d] to-[#d67809] shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                  <span className="text-center text-3xl font-black uppercase leading-[0.86] text-[#1a1a1a] [text-shadow:0_2px_0_rgba(255,255,255,0.28)]">
                    Buena
                    <br />
                    Musica
                  </span>
                </div>

                <div>
                  <p className="text-center text-3xl font-black uppercase leading-[0.88] text-black sm:text-4xl lg:text-left xl:text-5xl">
                    Escuchanos en tu telefono
                  </p>
                  <p className="mt-1 text-center text-2xl font-bold uppercase leading-[0.9] text-white sm:text-3xl lg:text-left xl:text-4xl">
                    Descarga es gratis y escuchanos
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <StoreButton href={APP_CONFIG.TUNEIN_URL || undefined} label="tunein" tuneIn />
                    <StoreButton href={APP_CONFIG.ANDROID_APP_URL || undefined} topText="Disponible en" label="Google play" />
                    <StoreButton href={APP_CONFIG.IPHONE_APP_URL || undefined} topText="Disponible en el" label="App Store" />
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
              className="btn btn-primary h-[78px] min-h-[78px] w-[270px] rounded-lg border border-white/20 bg-gradient-to-r from-[#355fb5] to-[#2f57aa] text-4xl font-bold text-white hover:brightness-110"
              aria-label="Facebook"
            >
              f
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
