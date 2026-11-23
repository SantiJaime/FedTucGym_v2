import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonClasses } from "./ui/buttonStyles";

const title = "text-2xl font-semibold text-neutral-100 max-sm:text-xl";

const Footer = () => {
  return (
    <footer className="bg-neutral-400 text-center text-white">
      <div className="grid grid-cols-1 items-center gap-2 bg-brand-700 p-3 md:grid-cols-2 md:p-4">
        <div className="p-2">
          <img
            src="/logo_blanco.png"
            alt="Logo Federación Tucumana de Gimnasia"
            width={200}
            className="mx-auto h-auto max-w-full"
          />
        </div>
        <div className="flex flex-col items-center p-2">
          <h1 className={title}>Federación Tucumana de Gimnasia</h1>
          <p className="flex flex-col items-center p-5 font-bold uppercase">
            <span>Gimnasia artística femenina y masculina</span>
            <span>Gimnasia Rítmica</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            Contacto:
            <Link to="mailto:fedetucdegimnasia@gmail.com" className={buttonClasses("outline-light")}>
              <Mail size={18} aria-hidden="true" />
              <span>fedetucdegimnasia@gmail.com</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
