/**
 * App — Raíz de la aplicación.
 * Estructura: Header | Main (HomePage).
 */
import { AudioProvider } from "@/context";
import { Header } from "@/components/layout";
import HomePage from "@/pages/Home/HomePage";

function AppShell() {
  return (
    <div className="min-h-screen bg-radio-page text-white antialiased">
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-grow">
          <HomePage />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppShell />
    </AudioProvider>
  );
}
