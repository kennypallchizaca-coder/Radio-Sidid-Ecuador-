/**
 * features/index.ts — Barrel de feature modules
 *
 * Secciones de dominio de la SPA:
 * - Hero: portada principal con botón de play
 * - Gallery: carrusel de fotos
 * - Contact: contacto y redes sociales
 * - AppPromo: promoción de la aplicación móvil
 */
export { default as Hero } from "./Hero/Hero";
export { default as Contact } from "./Contact/Contact";
export { default as Gallery } from "./Gallery/Gallery";
export { default as AppPromo } from "./AppPromo/AppPromo";
