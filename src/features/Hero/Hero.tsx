import { APP_CONFIG } from "@/config";
import { SECTION_IDS } from "@/constants/routes";
import bannerDefault from "@/assets/img/banner01.jpg";

export default function Hero() {
  const bannerSrc = APP_CONFIG.BANNER_IMAGE_URL || bannerDefault;

  return (
    <section
      id={SECTION_IDS.INICIO}
      aria-label={`Bienvenida a ${APP_CONFIG.RADIO_NAME}`}
      className="px-3 pt-4 sm:px-5"
    >
      <div className="mx-auto max-w-[1180px]">
        <article className="overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
          <div className="rounded-xl border-[10px] border-[#d50000] bg-[#d50000] p-2 sm:border-[12px] sm:p-3">
            <div className="overflow-hidden rounded-md border-[3px] border-[#ffcc00] bg-black">
              <img
                src={bannerSrc}
                alt={`Banner principal ${APP_CONFIG.RADIO_NAME}`}
                className="h-[200px] w-full object-cover object-center sm:h-[270px] md:h-[320px]"
                loading="eager"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
