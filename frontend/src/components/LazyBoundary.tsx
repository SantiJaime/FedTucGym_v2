import { Component, type ReactNode } from "react";
import { Button } from "./ui/Button";

// Tras un deploy, una pestaña abierta puede pedir un archivo de ruta que ya no existe.
export default class LazyBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mt-12 flex flex-col items-center gap-3 text-center" role="alert">
        <h4 className="text-xl font-semibold">No se pudo cargar la página</h4>
        <Button variant="dark" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
    );
  }
}
