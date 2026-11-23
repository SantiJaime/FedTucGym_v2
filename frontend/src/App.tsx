import RoutesView from "./routes/RoutesView";
import Footer from "./components/Footer";
import NavbarComp from "./components/NavBar";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <NavbarComp />
      <main className="mt-[66px] grow bg-bubbles">
        <Toaster richColors />
        <RoutesView />
      </main>
      <Footer />
    </div>
  );
}

export default App;
