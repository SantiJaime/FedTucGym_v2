import { Component, type ReactNode } from "react";
import { Button } from "react-bootstrap";

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
      <div className="text-center mt-5" role="alert">
        <h4>No se pudo cargar la página</h4>
        <Button variant="dark" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
    );
  }
}
