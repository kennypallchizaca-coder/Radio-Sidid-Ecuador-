import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary — Captura errores de React y muestra un fallback
 * en lugar de una pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-[#060810] px-4">
            <div className="text-center">
              <h1 className="mb-3 text-3xl font-bold text-white">
                Algo salió mal
              </h1>
              <p className="mb-6 text-white/70">
                Hubo un error inesperado. Por favor recarga la página.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-[#1231a0] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0a2f86]"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
