# Radio Sisid Ecuador

Sitio web de la radio: stream en vivo, enlaces a apps (TuneIn, Android, iPhone) y contacto.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **daisyUI**
- **@radix-ui/react-icons**

## Estructura (clean code)

```
src/
├── config/          # Configuración (app, redes sociales)
├── constants/       # IDs de secciones, constantes
├── context/         # AudioContext (estado global del reproductor)
├── hooks/           # useAudioPlayer (API pública EC + fallback)
├── services/        # Consumo de Radio Browser
├── utils/           # scrollToSection
├── components/
│   └── layout/      # Header
├── features/        # Hero, ContentSection, Gallery, Contact
├── pages/           # HomePage
├── App.tsx
├── main.tsx
└── index.css
```

## Configuración

- **`src/config/app.config.ts`**: nombre de la radio, API pública EC, stream fallback, video y apps.
- **`src/config/social.config.ts`**: redes sociales y contacto.

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Despliegue

Build estático: `npm run build` → carpeta `dist/`. Compatible con Vercel, Netlify, etc.
