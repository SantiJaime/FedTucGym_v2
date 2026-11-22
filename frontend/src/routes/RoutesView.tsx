import { lazy, Suspense } from "react";
import { Spinner } from "react-bootstrap";
import { Route, Routes, useLocation } from "react-router-dom";
import PrivateRoutes from "../components/PrivateRoutes";
import LazyBoundary from "../components/LazyBoundary";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const InscripcionT = lazy(() => import("../pages/InscripcionT"));
const Alumnos = lazy(() => import("../pages/Alumnos"));
const Puntajes = lazy(() => import("../pages/Puntajes"));
const MiCuenta = lazy(() => import("../pages/MiCuenta"));
const AdministrarTorneos = lazy(() => import("../pages/AdministrarTorneos"));
const HistorialPuntajes = lazy(() => import("../pages/HistorialPuntajes"));

const RoutesView = () => {
  const { pathname } = useLocation();

  return (
    <LazyBoundary key={pathname}>
      <Suspense
        fallback={
          <div className="d-flex justify-content-center mt-5">
            <Spinner variant="dark" role="status" aria-label="Cargando" />
          </div>
        }
      >
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/crear-usuario"
        element={
          <PrivateRoutes role={["Administrador"]}>
            <RegisterPage />
          </PrivateRoutes>
        }
      />
      <Route
        path="/admin-torneos"
        element={
          <PrivateRoutes role={["Administrador"]}>
            <AdministrarTorneos />
          </PrivateRoutes>
        }
      />
      <Route
        path="/inicio"
        element={
          <PrivateRoutes role={["Administrador", "Gimnasio", "Juez"]}>
            <HomePage />
          </PrivateRoutes>
        }
      />
      <Route
        path="/mi-cuenta"
        element={
          <PrivateRoutes role={["Administrador", "Gimnasio", "Juez"]}>
            <MiCuenta />
          </PrivateRoutes>
        }
      />
      <Route
        path="/inscripcion-torneos"
        element={
          <PrivateRoutes role={["Administrador", "Gimnasio"]}>
            <InscripcionT />
          </PrivateRoutes>
        }
      />
      <Route
        path="/alumnos"
        element={
          <PrivateRoutes role={["Administrador", "Gimnasio"]}>
            <Alumnos />
          </PrivateRoutes>
        }
      />
      <Route
        path="/puntajes"
        element={
          <PrivateRoutes role={["Administrador", "Juez"]}>
            <Puntajes />
          </PrivateRoutes>
        }
      />
      <Route
        path="/historial-puntajes"
        element={
          <PrivateRoutes role={["Administrador", "Gimnasio", "Juez"]}>
            <HistorialPuntajes />
          </PrivateRoutes>
        }
      />
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
      </Suspense>
    </LazyBoundary>
  );
};

export default RoutesView;
